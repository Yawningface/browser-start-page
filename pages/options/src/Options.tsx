import React, { useState, useEffect, ChangeEvent } from 'react';
import '@src/Options.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { ToggleButton } from '@extension/ui';
import { t } from '@extension/i18n';

interface OptionsConfig {
  textColor: string;
  backgroundMode: "default" | "solid" | "image";
  backgroundColor: string;
  backgroundImageUrl: string;
  fontFamily: string;
}

const DEFAULT_CONFIG: OptionsConfig = {
  textColor: "#ebb305", // default yellow
  backgroundMode: "default",
  backgroundColor: "#ffffff",
  backgroundImageUrl: "",
  fontFamily: "Arial",
};

const Options = () => {
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';
  
  // Load options configuration from localStorage.
  const [config, setConfig] = useState<OptionsConfig>(() => {
    const stored = localStorage.getItem('userOptions');
    return stored ? JSON.parse(stored) : DEFAULT_CONFIG;
  });
  
  // Save config changes to localStorage.
  useEffect(() => {
    localStorage.setItem('userOptions', JSON.stringify(config));
  }, [config]);
  
  const exportData = () => {
    const dataStr = JSON.stringify({ config }, null, 2);
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'userOptions.json');
    linkElement.click();
  };

  const handleBackgroundImageFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result;
        if (typeof dataUrl === 'string') {
          setConfig({ ...config, backgroundImageUrl: dataUrl });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
  };

  const goBackToNewTab = () => {
    // Simply close the current window. This assumes the Options page is opened in its own tab.
    window.close();
  };

  return (
    <div className={`min-h-screen p-4 ${isLight ? 'bg-slate-50 text-gray-900' : 'bg-gray-800 text-gray-100'}`}>
      <div className="max-w-lg mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-center mb-2">Options</h1>
        </header>
        
        <section className="mb-6 border p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Theme</h2>
          <div className="flex items-center">
            <ToggleButton onClick={exampleThemeStorage.toggle}>
              {t('toggleTheme')}
            </ToggleButton>
            <span className="ml-4">
              Current Theme: {isLight ? 'Light' : 'Dark'}
            </span>
          </div>
        </section>
        
        <section className="mb-6 border p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Text Color</h2>
          <div className="flex items-center">
            <input
              type="color"
              value={config.textColor}
              onChange={(e) => setConfig({ ...config, textColor: e.target.value })}
              className="w-12 h-12 mr-4"
            />
            <span>Current Text Color: {config.textColor}</span>
          </div>
        </section>
        
        <section className="mb-6 border p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Background</h2>
          <div className="mb-4">
            <label className="block mb-1">
              <input
                type="radio"
                name="backgroundMode"
                value="default"
                checked={config.backgroundMode === "default"}
                onChange={() => setConfig({ ...config, backgroundMode: "default" })}
                className="mr-2"
              />
              Default
            </label>
            <label className="block mb-1">
              <input
                type="radio"
                name="backgroundMode"
                value="solid"
                checked={config.backgroundMode === "solid"}
                onChange={() => setConfig({ ...config, backgroundMode: "solid" })}
                className="mr-2"
              />
              Solid Color
            </label>
            <label className="block mb-1">
              <input
                type="radio"
                name="backgroundMode"
                value="image"
                checked={config.backgroundMode === "image"}
                onChange={() => setConfig({ ...config, backgroundMode: "image" })}
                className="mr-2"
              />
              Background Image
            </label>
          </div>
          {config.backgroundMode === "solid" && (
            <div className="flex items-center">
              <input
                type="color"
                value={config.backgroundColor || "#ffffff"}
                onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
                className="w-12 h-12 mr-4"
              />
              <span>Choose a solid background color</span>
            </div>
          )}
          {config.backgroundMode === "image" && (
            <div className="flex flex-col">
              <input
                type="file"
                accept="image/*"
                onChange={handleBackgroundImageFile}
                className="mb-2"
              />
              {config.backgroundImageUrl && (
                <div className="mt-2">
                  <img src={config.backgroundImageUrl} alt="Background Preview" className="w-full max-h-64 object-contain" />
                </div>
              )}
            </div>
          )}
        </section>
        
        <section className="mb-6 border p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Font Selection</h2>
          <div className="flex items-center">
            <select
              value={config.fontFamily}
              onChange={(e) => setConfig({ ...config, fontFamily: e.target.value })}
              className={`p-2 border rounded ${isLight ? 'bg-gray-200 text-black' : 'bg-gray-700 text-white'}`}
            >
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Verdana">Verdana</option>
              <option value="sans-serif">Sans-serif</option>
            </select>
            <span className="ml-4">Current Font: {config.fontFamily}</span>
          </div>
        </section>
        
        <section className="mb-6 border p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Export Configuration</h2>
          <button
            onClick={exportData}
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Export Data
          </button>
        </section>

        <section className="mb-6 border p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Reset Configuration</h2>
          <button
            onClick={resetConfig}
            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Reset to Defaults
          </button>
        </section>

        <div className="flex justify-center mt-8">
          <button
            onClick={goBackToNewTab}
            className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to New Tab
          </button>
        </div>
      </div>
    </div>
  );
};

export default withErrorBoundary(
  withSuspense(Options, <div>Loading ...</div>),
  <div>Error Occurred</div>
);
