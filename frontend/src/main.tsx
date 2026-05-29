import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import SharedDebate from './components/SharedDebate';

function RootApp() {
  const path = window.location.pathname;
  if (path.startsWith('/share/')) {
    const shareId = path.split('/share/')[1];
    return <SharedDebate shareId={shareId} />;
  }

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
