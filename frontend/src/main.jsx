import 'bootstrap/dist/css/bootstrap.min.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles/fonts.css';
import './styles/global.css';
import './styles/layout.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
