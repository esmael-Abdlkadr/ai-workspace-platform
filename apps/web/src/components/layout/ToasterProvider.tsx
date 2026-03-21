'use client';

import { Toaster } from 'react-hot-toast';

export function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          background: '#1a1a24',
          color: '#f0f0f8',
          border: '1px solid #2a2a38',
          borderRadius: '12px',
          fontSize: '13px',
          padding: '12px 16px',
          boxShadow: '0 16px 40px #00000050',
        },
        success: {
          iconTheme: { primary: '#22d3a0', secondary: '#1a1a24' },
          style: {
            border: '1px solid #22d3a030',
          },
        },
        error: {
          iconTheme: { primary: '#f43f5e', secondary: '#1a1a24' },
          style: {
            border: '1px solid #f43f5e30',
          },
        },
      }}
    />
  );
}
