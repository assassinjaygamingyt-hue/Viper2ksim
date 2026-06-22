import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initLocalStorageInterceptor } from './localStorageDB.ts';

// Initialize the static/offline dual-mode interceptor
initLocalStorageInterceptor();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

