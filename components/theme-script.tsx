"use client"

import { useEffect } from "react"

export function ThemeScript() {
  useEffect(() => {
    // This runs only on the client
    return
  }, [])

  // This script runs before React hydration
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              var theme = localStorage.getItem('theme');
              var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              
              if (!theme) {
                theme = 'system';
              }
              
              document.documentElement.classList.remove('light', 'dark');
              
              if (theme === 'system') {
                document.documentElement.classList.add(systemTheme);
              } else {
                document.documentElement.classList.add(theme);
              }
            } catch (e) {
              console.error('Theme initialization failed:', e);
            }
          })();
        `,
      }}
    />
  )
}
