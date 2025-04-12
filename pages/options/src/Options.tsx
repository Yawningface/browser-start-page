import React, { useState, useEffect, ChangeEvent } from 'react';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { t } from '@extension/i18n';
import defaultConfig from './default.json';

interface OptionsConfig {
  textColor: string;
  backgroundMode: 'default' | 'solid' | 'image';
  backgroundColor: string;
  backgroundImageUrl: string;
  fontFamily: string;
}

interface UnifiedConfig {
  columns: Record<string, any[]>;
  options: OptionsConfig;
}

const DEFAULT_UNIFIED_CONFIG: UnifiedConfig = {
  columns: defaultConfig.columns,
  options: defaultConfig.options as OptionsConfig, // Cast to OptionsConfig
};

const Options = () => {
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';

  const [config, setConfig] = useState<UnifiedConfig>(() => {
    const stored = localStorage.getItem('unifiedConfig');
    return stored ? JSON.parse(stored) : DEFAULT_UNIFIED_CONFIG;
  });

  useEffect(() => {
    localStorage.setItem('unifiedConfig', JSON.stringify(config));
  }, [config]);

  const exportData = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'configuration.json');
    linkElement.click();
  };

  const importConfig = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = () => {
      const file = input.files ? input.files[0] : null;
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedConfig = JSON.parse(e.target?.result as string);
            if (importedConfig.columns && importedConfig.options) {
              setConfig(importedConfig);
              alert('Configuration imported successfully!');
            } else {
              alert('Invalid configuration file: Missing columns or options.');
            }
          } catch (error) {
            alert('Failed to import configuration: Invalid file.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleBackgroundImageFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result;
        if (typeof dataUrl === 'string') {
          setConfig({
            ...config,
            options: { ...config.options, backgroundImageUrl: dataUrl },
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const resetConfig = () => {
    setConfig(DEFAULT_UNIFIED_CONFIG);
  };

  return (
    <div
      className={`min-h-screen p-4 ${
        isLight ? 'bg-slate-50 text-gray-900' : 'bg-gray-800 text-gray-100'
      }`}
    >
      <div className="max-w-lg mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-center mb-2">Options</h1>
        </header>

        <section className="mb-6 border p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Theme</h2>
          <div className="flex items-center">
            <label className="relative inline-block w-12 h-6 cursor-pointer">
              <input
                type="checkbox"
                checked={!isLight}
                onChange={exampleThemeStorage.toggle}
                className="sr-only peer"
              />
              <div className="w-full h-full bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors duration-200"></div>
              <div className="absolute top-0 left-0 w-6 h-6 bg-white rounded-full border border-gray-300 transition-transform duration-200 peer-checked:translate-x-6"></div>
            </label>
            <span className="ml-4">
              {isLight ? 'Light Mode (☀️)' : 'Dark Mode (🌙)'}
            </span>
          </div>
        </section>

        <section className="mb-6 border p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Text Color</h2>
          <div className="flex items-center">
            <input
              type="color"
              value={config.options.textColor}
              onChange={(e) =>
                setConfig({
                  ...config,
                  options: { ...config.options, textColor: e.target.value },
                })
              }
              className="w-12 h-12 mr-4"
            />
            <span>Current Text Color: {config.options.textColor}</span>
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
                checked={config.options.backgroundMode === 'default'}
                onChange={() =>
                  setConfig({
                    ...config,
                    options: { ...config.options, backgroundMode: 'default' },
                  })
                }
                className="mr-2"
              />
              Default
            </label>
            <label className="block mb-1">
              <input
                type="radio"
                name="backgroundMode"
                value="solid"
                checked={config.options.backgroundMode === 'solid'}
                onChange={() =>
                  setConfig({
                    ...config,
                    options: { ...config.options, backgroundMode: 'solid' },
                  })
                }
                className="mr-2"
              />
              Solid Color
            </label>
            <label className="block mb-1">
              <input
                type="radio"
                name="backgroundMode"
                value="image"
                checked={config.options.backgroundMode === 'image'}
                onChange={() =>
                  setConfig({
                    ...config,
                    options: { ...config.options, backgroundMode: 'image' },
                  })
                }
                className="mr-2"
              />
              Background Image
            </label>
          </div>
          {config.options.backgroundMode === 'solid' && (
            <div className="flex items-center">
              <input
                type="color"
                value={config.options.backgroundColor || '#ffffff'}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    options: {
                      ...config.options,
                      backgroundColor: e.target.value,
                    },
                  })
                }
                className="w-12 h-12 mr-4"
              />
              <span>Choose a solid background color</span>
            </div>
          )}
          {config.options.backgroundMode === 'image' && (
            <div className="flex flex-col">
              <input
                type="file"
                accept="image/*"
                onChange={handleBackgroundImageFile}
                className="mb-2"
              />
              {config.options.backgroundImageUrl && (
                <div className="mt-2">
                  <img
                    src={config.options.backgroundImageUrl}
                    alt="Background Preview"
                    className="w-full max-h-64 object-contain"
                  />
                </div>
              )}
            </div>
          )}
        </section>

        <section className="mb-6 border p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Font Selection</h2>
          <div className="flex items-center">
            <select
              value={config.options.fontFamily}
              onChange={(e) =>
                setConfig({
                  ...config,
                  options: { ...config.options, fontFamily: e.target.value },
                })
              }
              className={`p-2 border rounded ${
                isLight ? 'bg-gray-200 text-black' : 'bg-gray-700 text-white'
              }`}
            >
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Verdana">Verdana</option>
              <option value="sans-serif">Sans-serif</option>
              <option value="Roboto">Roboto</option>
              <option value="Inter">Inter</option>
              <option value="Segoe UI">Segoe UI</option>
            </select>
            <span className="ml-4">Current Font: {config.options.fontFamily}</span>
          </div>
        </section>

        <section className="mb-6 border p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">
            Export/Import Configuration
          </h2>
          <p className="text-sm mb-2 text-gray-500">
            Use the buttons below to export your current configuration (appearance
            and widgets) to a file, or to import a configuration from a file.
          </p>
          <div className="flex flex-col space-y-2">
            <button
              onClick={exportData}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Export Configuration
            </button>
            <button
              onClick={importConfig}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Import Configuration
            </button>
          </div>
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
      </div>
    </div>
  );
};

export default withErrorBoundary(
  withSuspense(Options, <div>Loading ...</div>),
  <div>Error Occurred</div>
);