import React from 'react';
import { useStorage } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';

const Popup = () => {
  const theme = useStorage(exampleThemeStorage);
  const isDark = theme === 'dark';
  
  const openOptionsPage = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-gray-800' : 'bg-slate-50'}`}>
      <button
        onClick={openOptionsPage}
        className={`px-4 py-2 font-medium rounded focus:outline-none focus:ring-2 transition-colors ${
          isDark 
            ? 'text-white bg-blue-700 hover:bg-blue-600 focus:ring-blue-400' 
            : 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        }`}
      >
        Go to Options
      </button>
    </div>
  );
};

export default Popup;