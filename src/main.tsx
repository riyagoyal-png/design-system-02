import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Order: the spec's own CSS (tokens, base, every component and chart blueprint), generated text styles, showcase chrome.
import './generated/ds.css';
import './generated/text-styles.css';
import './styles/showcase.css';
import App from './App';

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
