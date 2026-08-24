import { spawn, spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const DIST_INDEX = resolve('dist/index.html');
const PREVIEW_HOST = '127.0.0.1';
const PREVIEW_PORT = 4173;
const PREVIEW_URL = `http://${PREVIEW_HOST}:${PREVIEW_PORT}/?lang=ar&kallista_prerender=1`;

// These keys are empty on a fresh Chrome profile and are written by the
// Firestore snapshot callbacks. Requiring all four prevents publishing the old
// local/default UI if Firebase did not actually hydrate during the build.
const FIRESTORE_SYNC_KEYS = [
  'kallista_content_v3',
  'kallista_settings_v3',
  'kallista_categories_v3',
  'kallista_albums_v3',
];

const probeScript = `
<script id="kallista-prerender-probe">
(function () {
  var keys = ${JSON.stringify(FIRESTORE_SYNC_KEYS)};
  var markIfReady = function () {
    try {
      var ready = keys.every(function (key) {
        return !!window.localStorage.getItem(key);
      });
      if (ready) {
        document.documentElement.setAttribute('data-kallista-firestore-synced', 'true');
      }
    } catch (_) {
      // The build validation below will fail safely if storage is unavailable.
    }
  };
  markIfReady();
  window.setInterval(markIfReady, 100);
})();
</script>`;

const handoffScript = `
<script id="kallista-prerender-handoff">
(function () {
  var root = document.getElementById('root');
  if (!root || !root.children.length) return;

  // Keep the exact prerendered site visible while React performs its live
  // Firebase hydration in a hidden root. This prevents a flash of defaults or
  // the loading splash for real visitors.
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

  // If the live app never becomes ready, leave the working static snapshot on
  // screen instead of replacing it with an empty or stale page.
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

  throw new Error(`Vite preview did not become ready: ${lastError?.message || 'timeout'}`);
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

  // Remove the temporary build-only Firebase probe from the published page.
  html = html.replace(
    /<script id="kallista-prerender-probe">[\s\S]*?<\/script>/i,
    '',
  );
  html = html.replace(/\sdata-kallista-firestore-synced="true"/i, '');

  // Mark the output for CI verification and future diagnostics.
  if (/<html\b/i.test(html) && !/data-kallista-prerendered=/i.test(html)) {
    html = html.replace(/<html\b/i, '<html data-kallista-prerendered="true"');
  }

  const stamp = new Date().toISOString();
  const meta = `<meta name="kallista-prerendered-at" content="${stamp}">`;
  if (/<\/head>/i.test(html)) {
    html = html.replace(/<\/head>/i, `  ${meta}\n</head>`);
  }

  // The live browser handoff runs at the end of body, before Vite's module
  // script executes (module scripts are deferred until parsing is complete).
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

  // Add a temporary probe before starting the local preview. This lets the
  // headless browser prove that live Firestore callbacks completed.
  const probedHtml = sourceHtml.replace(/<\/body>/i, `${probeScript}\n</body>`);
  await writeFile(DIST_INDEX, probedHtml, 'utf8');

  previewProcess = spawn(
    process.platform === 'win32' ? 'npm.cmd' : 'npm',
    ['run', 'preview', '--', '--host', PREVIEW_HOST, '--port', String(PREVIEW_PORT), '--strictPort'],
    {
      detached: process.platform !== 'win32',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env },
    },
  );

  previewProcess.stdout?.on('data', (chunk) => process.stdout.write(`[preview] ${chunk}`));
  previewProcess.stderr?.on('data', (chunk) => process.stderr.write(`[preview] ${chunk}`));

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
      '--virtual-time-budget=18000',
      `--user-data-dir=${chromeProfile}`,
      '--dump-dom',
      PREVIEW_URL,
    ],
    {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env },
    },
  );

  const { stdout: renderedHtml, stderr: chromeLogs } = await collectProcess(chromeProcess);

  if (chromeLogs.trim()) {
    process.stderr.write(`[chrome] ${chromeLogs}\n`);
  }

  if (!renderedHtml.includes('data-kallista-firestore-synced="true"')) {
    // Restore the normal Vite build so a failed prerender never leaves the
    // temporary probe inside the artifact.
    await writeFile(DIST_INDEX, sourceHtml, 'utf8');
    throw new Error(
      'Live Firestore data did not hydrate in the fresh headless browser. '
      + 'The build was stopped to avoid publishing stale/default content.',
    );
  }

  if (!renderedHtml.includes('id="kallista-app-root"')) {
    await writeFile(DIST_INDEX, sourceHtml, 'utf8');
    throw new Error('The live Kallista app root was not rendered. Prerender aborted.');
  }

  if (renderedHtml.length < 50000) {
    await writeFile(DIST_INDEX, sourceHtml, 'utf8');
    throw new Error(`Rendered HTML is unexpectedly small (${renderedHtml.length} bytes).`);
  }

  const finalHtml = cleanAndFinalizeRenderedHtml(renderedHtml);
  await writeFile(DIST_INDEX, finalHtml, 'utf8');

  console.log(`Prerender complete: ${finalHtml.length.toLocaleString()} bytes`);
  console.log('Live Firestore hydration verified in a clean Chrome profile.');
  console.log('dist/index.html now contains the current site for non-JS crawlers.');
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
    await rm(chromeProfile, { recursive: true, force: true }).catch(() => undefined);
  }
}
