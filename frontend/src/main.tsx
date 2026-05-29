import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import React, { useState } from 'react';
import LandingPage from './components/LandingPage';

function RootApp() {
  // Skip landing page if we have a token or are returning from OAuth
  const hasToken = !!localStorage.getItem('auth_token') || window.location.hash.includes('access_token=');
  const [showLanding, setShowLanding] = useState(!hasToken);

  if (showLanding) {
    return <LandingPage onLaunch={() => setShowLanding(false)} />;
  }

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootApp />
  </StrictMode>,
);
