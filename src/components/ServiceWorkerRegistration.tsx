
"use client";

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    // Service worker registration logic is now commented out
    // if ('serviceWorker' in navigator) {
    //   navigator.serviceWorker
    //     .register('/sw.js')
    //     .then((registration) => console.log('Service Worker registered with scope:', registration.scope))
    //     .catch((error) => console.error('Service Worker registration failed:', error));
    // }
    console.log("Service Worker registration has been temporarily disabled for debugging.");
  }, []);
  return null;
}
