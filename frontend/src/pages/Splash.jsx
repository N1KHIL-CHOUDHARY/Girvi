import React from 'react';

export default function Splash() {
  return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-app-primary min-h-screen">
      <img
        src="/android/android-launchericon-192-192.png"
        alt="PawnManager"
        className="h-20 w-20 opacity-0 animate-splash-in"
      />

      <style>{`
        @keyframes splash-in {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-splash-in {
          animation: splash-in 300ms ease-out forwards;
        }
      `}</style>
    </div>
  );
}
