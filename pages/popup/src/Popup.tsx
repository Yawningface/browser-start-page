import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import React from 'react';

const Popup = () => {
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';

  const openOptionsPage = () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
  };

  return (
    <div
      className={`App ${isLight ? 'bg-slate-50' : 'bg-gray-800'} min-h-[400px] max-h-[400px] overflow-hidden flex flex-col p-4 relative`}
    >
      <header className={`App-header ${isLight ? 'text-gray-900' : 'text-gray-100'} text-center`}>
        <h1 className="text-2xl font-bold">
          Browser Start Page
        </h1>
      </header>

      <section className="mt-4 flex flex-col items-center">
        <p className={`text-sm ${isLight ? 'text-gray-900' : 'text-gray-100'}`}>
          Welcome to your custom start page!
        </p>
      </section>

      {/* Free & Open Source info */}
      <section className="absolute bottom-12 left-0 right-0 text-center text-sm font-semibold text-gray-400">
        100% Free & Open Source
        <a
          href="https://github.com/Yawningface/browser-start-page"
          className="inline-flex items-center gap-1 text-yellow-400 ml-2 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          ⭐ Star Repo
        </a>
      </section>

      {/* Footer: Options button only */}
      <footer className="absolute bottom-4 right-4">
        <button
          onClick={openOptionsPage}
          className="p-1 rounded-full text-xl bg-transparent hover:scale-110 transition-transform"
          title="Options"
        >
          <span role="img" aria-label="gear">⚙️</span>
        </button>
      </footer>
    </div>
  );
};

export default withErrorBoundary(
  withSuspense(Popup, <div>Loading ...</div>),
  <div>Error Occurred</div>
);
