/**
 * main.tsx
 *
 * Entry point for Fintrack GenZ Vision React application.
 * - Mounts the root App component to the DOM
 * - Imports global styles
 *
 * Dependencies:
 * - react-dom/client: createRoot for concurrent rendering
 * - App.tsx: Root application component
 * - index.css: Global styles (Tailwind, resets, etc.)
 *
 * NOTE: Ensure the #root element exists in index.html.
 * TODO: Add error boundary and performance monitoring.
 */

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Mount the App component to the #root DOM node
createRoot(document.getElementById("root")!).render(<App />);
