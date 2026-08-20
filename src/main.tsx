import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { TypographyScaleSync } from './components/TypographyScaleSync.tsx';
import { AdvancedContentControls } from './components/AdvancedContentControls.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TypographyScaleSync />
    <App />
    <AdvancedContentControls />
  </StrictMode>,
);
