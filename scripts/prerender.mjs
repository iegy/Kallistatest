import { spawn, spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const DIST_INDEX = resolve('dist/index.html');
const ENV_FILE = resolve('.env.production');
const PREVIEW_HOST = '127.0.0.1';
const PREVIEW_PORT = 4173;
const PREVIEW_URL = `http://${PREVIEW_HOST}:${PREVIEW_PORT}/?lang=ar&kallista_prerender=1`;

const STORAGE_KEYS = {
  CONTENT: 'kallista_content_v3',
  SETTINGS: 'kallista_settings_v3',
  CATEGORIES: 'kallista_categories_v3',
  ALBUMS: 'kallista_albums_v3',
};

function parseEnvFile(source) {
  const values = {};

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const separator = line.indexOf('=');
    if (separator <= 0) continue;

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
}

function decodeFirestoreValue(value) {
  if (!value || typeof value !== 'object') return null;

  if ('nullValue' in value) return null;
  if ('stringValue' in value) return value.stringValue;
  if ('booleanValue' in value) return Boolean(value.booleanValue);
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('timestampValue' in value) return value.timestampValue;
  if ('referenceValue' in value) return value.referenceValue;
  if ('bytesValue' in value) return value.bytesValue;
  if ('geoPointValue' in value) return value.geoPointValue;

  if ('arrayValue' in value) {
    return (value.arrayValue?.values || []).map(decodeFirestoreValue);
  }

  if ('mapValue' in value) {
    return decodeFirestoreFields(value.mapValue?.fields || {});
  }

  return null;
}

function decodeFirestoreFields(fields = {}) {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, decodeFirestoreValue(value)]),
  );
}

function decodeFirestoreDocument(document) {
  if (!document) return null;

  const decoded = decodeFirestoreFields(document.fields || {});
  const id = document.name?.split('/').pop();

  return id && decoded.id == null
    ? { id, ...decoded }
    : decoded;
}

async function fetchJson(url, label) {
  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      'user-agent': 'Kallista-Prerender/2.0',
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(
      `${label} failed with HTTP ${response.status}: ${body.slice(0, 500)}`,
    );
  }

  return response.json();
}

async function fetchDocument({ projectId, apiKey, collection, documentId }) {
  const url = new URL(
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}`
    + `/databases/(default)/documents/${encodeURIComponent(collection)}/${encodeURIComponent(documentId)}`,
  );
  url.searchParams.set('key', apiKey);

  const payload = await fetchJson(url, `${collection}/${documentId}`);
  return decodeFirestoreDocument(payload);
}

async function runPublicBooleanQuery({
  projectId,
  apiKey,
  collection,
  fieldPath,
}) {
  const url = new URL(
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}`
    + '/databases/(default)/documents:runQuery',
  );
  url.searchParams.set('key', apiKey);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'user-agent': 'Kallista-Prerender/3.0',
    },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: collection }],
        where: {
          fieldFilter: {
            field: { fieldPath },
            op: 'EQUAL',
            value: { booleanValue: true },
          },
        },
        limit: 1000,
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(
      `${collection} public query failed with HTTP ${response.status}: ${body.slice(0, 500)}`,
    );
  }

  const payload = await response.json();

  return payload
    .map((row) => decodeFirestoreDocument(row.document))
    .filter(Boolean);
}

async function fetchCurrentPublicState() {
  const envSource = await readFile(ENV_FILE, 'utf8');
  const env = parseEnvFile(envSource);

  const apiKey = env.VITE_FIREBASE_API_KEY;
  const projectId = env.VITE_FIREBASE_PROJECT_ID;

  if (!apiKey || !projectId) {
    throw new Error(
      '.env.production must contain VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID.',
    );
  }

  const common = { apiKey, projectId };

  const [
    content,
    settings,
    categories,
    albums,
  ] = await Promise.all([
    fetchDocument({
      ...common,
      collection: 'kallista_content',
      documentId: 'main',
    }),
    fetchDocument({
      ...common,
      collection: 'kallista_settings',
      documentId: 'public',
    }),
    runPublicBooleanQuery({
      ...common,
      collection: 'kallista_categories',
      fieldPath: 'active',
    }),
    runPublicBooleanQuery({
      ...common,
      collection: 'kallista_albums',
      fieldPath: 'published',
    }),
  ]);

  if (!content || !settings) {
    throw new Error('The public content/settings documents could not be loaded.');
  }

  const publicCategories = categories.filter((item) => item.active === true);
  const publicAlbums = albums.filter((item) => item.published === true);

  if (!publicCategories.length) {
    throw new Error('No active portfolio categories were returned from Firestore.');
  }

  if (!publicAlbums.length) {
    throw new Error('No published albums were returned from Firestore.');
  }

  return {
    [STORAGE_KEYS.CONTENT]: content,
    [STORAGE_KEYS.SETTINGS]: settings,
    [STORAGE_KEYS.CATEGORIES]: publicCategories,
    [STORAGE_KEYS.ALBUMS]: publicAlbums,
  };
}

function buildSeedScript(state) {
  const serializedState = JSON.stringify(state)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');

  return `
<script id="kallista-prerender-seed">
(function () {
  var state = ${serializedState};
  try {
    Object.keys(state).forEach(function (key) {
      window.localStorage.setItem(key, JSON.stringify(state[key]));
    });
    document.documentElement.setAttribute('data-kallista-build-state-seeded', 'true');
  } catch (error) {
    console.error('Kallista prerender seed failed:', error);
  }
})();
</script>`;
}

const handoffScript = `
<script id="kallista-prerender-handoff">
(function () {
  var root = document.getElementById('root');
  if (!root || !root.children.length) return;

  // Keep the exact prerendered site visible while the live React app starts.
  // This removes the old/default-content flash for real visitors too.
  var snapshot = document.createElement('div');
  snapshot.id = 'kallista-prerender-snapshot';
  snapshot.setAttribute('data-kallista-prerender-snapshot', 'true');
  snapshot.innerHTML = root.innerHTML;
  snapshot.style.pointerEvents = 'none';

  root.innerHTML = '';
  root.style.display = 'none';
  root.parentNode.insertBefore(snapshot, root);

  var revealLiveApp = function () {
    if (!root.querySelector('#kallista-app-root')) return false;

    window.requestAnimationFrame(function () {
      root.style.display = '';
      if (snapshot && snapshot.parentNode) snapshot.parentNode.removeChild(snapshot);
    });
    return true;
  };

  var observer = new MutationObserver(function () {
    if (revealLiveApp()) observer.disconnect();
  });

  observer.observe(root, { childList: true, subtree: true });

  window.setTimeout(function () {
    if (revealLiveApp()) observer.disconnect();
  }, 12000);
})();
</script>`;

function findChrome() {
  if (process.env.CHROME_BIN) return process.env.CHROME_BIN;

  for (const candidate of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']) {
    const result = spawnSync('which', [candidate], { encoding: 'utf8' });
    if (result.status === 0 && result.stdout.trim()) return result.stdout.trim();
  }

  throw new Error('Chrome/Chromium was not found. Set CHROME_BIN on the runner.');
}

async function waitForServer(url, timeoutMs = 30000) {
  const started = Date.now();
  let lastError;

  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url, { redirect: 'follow' });
      if (response.ok) return;
      lastError = new Error(`Preview returned HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolvePromise) => setTimeout(resolvePromise, 300));
  }

  throw new Error(
    `Vite preview did not become ready: ${lastError?.message || 'timeout'}`,
  );
}

function collectProcess(child) {
  return new Promise((resolvePromise, rejectPromise) => {
    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr?.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', rejectPromise);

    child.on('close', (code) => {
      if (code === 0) {
        resolvePromise({ stdout, stderr });
      } else {
        rejectPromise(new Error(`Process exited with ${code}\n${stderr}`));
      }
    });
  });
}

function cleanAndFinalizeRenderedHtml(renderedHtml) {
  let html = renderedHtml.trim();

  if (!/^<!doctype html>/i.test(html)) {
    html = `<!doctype html>\n${html}`;
  }

  // Keep the seed script in the final HTML. This is intentional:
  // it gives the real browser the same current Firebase data immediately,
  // so React starts from current content instead of stale defaults.
  html = html.replace(/\sdata-kallista-build-state-seeded="true"/i, '');

  if (/<html\b/i.test(html) && !/data-kallista-prerendered=/i.test(html)) {
    html = html.replace(
      /<html\b/i,
      '<html data-kallista-prerendered="true"',
    );
  }

  const stamp = new Date().toISOString();
  const meta = `<meta name="kallista-prerendered-at" content="${stamp}">`;

  if (/<\/head>/i.test(html)) {
    html = html.replace(/<\/head>/i, `  ${meta}\n</head>`);
  }

  if (!/id="kallista-prerender-handoff"/i.test(html)) {
    html = html.replace(/<\/body>/i, `${handoffScript}\n</body>`);
  }

  return html;
}

let previewProcess;
let chromeProfile;

try {
  const sourceHtml = await readFile(DIST_INDEX, 'utf8');

  if (!sourceHtml.includes('</body>')) {
    throw new Error('dist/index.html is missing </body>. Refusing to prerender.');
  }

  console.log('Fetching current public Kallista data directly from Firestore REST...');
  const currentState = await fetchCurrentPublicState();

  const seedScript = buildSeedScript(currentState);

  // Put the seed before Vite's module script so cached/default content can never
  // win the first render in the clean prerender browser.
  let seededHtml = sourceHtml;

  if (/<script[^>]+type=["']module["']/i.test(seededHtml)) {
    seededHtml = seededHtml.replace(
      /(<script[^>]+type=["']module["'][^>]*>)/i,
      `${seedScript}\n$1`,
    );
  } else {
    seededHtml = seededHtml.replace(/<\/body>/i, `${seedScript}\n</body>`);
  }

  await writeFile(DIST_INDEX, seededHtml, 'utf8');

  previewProcess = spawn(
    process.platform === 'win32' ? 'npm.cmd' : 'npm',
    [
      'run',
      'preview',
      '--',
      '--host',
      PREVIEW_HOST,
      '--port',
      String(PREVIEW_PORT),
      '--strictPort',
    ],
    {
      detached: process.platform !== 'win32',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env },
    },
  );

  previewProcess.stdout?.on(
    'data',
    (chunk) => process.stdout.write(`[preview] ${chunk}`),
  );

  previewProcess.stderr?.on(
    'data',
    (chunk) => process.stderr.write(`[preview] ${chunk}`),
  );

  await waitForServer(PREVIEW_URL);

  const chrome = findChrome();
  chromeProfile = await mkdtemp(join(tmpdir(), 'kallista-prerender-'));

  const chromeProcess = spawn(
    chrome,
    [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--hide-scrollbars',
      '--run-all-compositor-stages-before-draw',
      '--window-size=1600,1000',
      '--virtual-time-budget=9000',
      `--user-data-dir=${chromeProfile}`,
      '--dump-dom',
      PREVIEW_URL,
    ],
    {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env },
    },
  );

  const {
    stdout: renderedHtml,
    stderr: chromeLogs,
  } = await collectProcess(chromeProcess);

  // D-Bus messages are normal on GitHub's headless Linux runners.
  if (chromeLogs.trim()) {
    const usefulLogs = chromeLogs
      .split(/\r?\n/)
      .filter((line) => line && !line.includes('dbus'))
      .join('\n');

    if (usefulLogs) {
      process.stderr.write(`[chrome] ${usefulLogs}\n`);
    }
  }

  if (!renderedHtml.includes('data-kallista-build-state-seeded="true"')) {
    await writeFile(DIST_INDEX, sourceHtml, 'utf8');
    throw new Error('The Firestore build-state seed was not executed in Chrome.');
  }

  if (!renderedHtml.includes('id="kallista-app-root"')) {
    await writeFile(DIST_INDEX, sourceHtml, 'utf8');
    throw new Error('The live Kallista app root was not rendered.');
  }

  if (renderedHtml.length < 50000) {
    await writeFile(DIST_INDEX, sourceHtml, 'utf8');
    throw new Error(
      `Rendered HTML is unexpectedly small (${renderedHtml.length} bytes).`,
    );
  }

  const finalHtml = cleanAndFinalizeRenderedHtml(renderedHtml);
  await writeFile(DIST_INDEX, finalHtml, 'utf8');

  console.log(`Prerender complete: ${finalHtml.length.toLocaleString()} bytes`);
  console.log('Current Firestore data was fetched directly during the build.');
  console.log('dist/index.html now contains the current Kallista UI for crawlers.');
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  if (previewProcess?.pid) {
    try {
      if (process.platform === 'win32') {
        previewProcess.kill('SIGTERM');
      } else {
        process.kill(-previewProcess.pid, 'SIGTERM');
      }
    } catch {
      // The preview may already have exited.
    }
  }

  if (chromeProfile) {
    await rm(
      chromeProfile,
      { recursive: true, force: true },
    ).catch(() => undefined);
  }
}
