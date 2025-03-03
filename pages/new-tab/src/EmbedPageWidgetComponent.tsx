import React, { useState } from 'react';
import { Widget } from './NewTab';
import { useStorage } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';

type EmbedWidgetProps = {
  widget?: Widget;
  updateWidget: (widgetId: string, updater: (w: Widget) => Widget | null) => void;
  removeWidget: (widgetId: string) => void;
  isInEditMode: boolean;
};

const EmbedPageWidgetComponent: React.FC<EmbedWidgetProps> = ({
  widget,
  updateWidget,
  removeWidget,
  isInEditMode,
}) => {
  // Read the current theme from storage
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';

  // Retrieve user options (for textColor override)
  const [userOptions] = useState<any>(() => {
    const stored = localStorage.getItem('userOptions');
    return stored ? JSON.parse(stored) : null;
  });

  if (!widget) {
    console.error('EmbedPageWidgetComponent received an undefined widget.');
    return <div className="p-2 bg-red-100 text-red-800">Error: Widget not found.</div>;
  }

  // Use theme-based styling for container, input, and buttons
  const containerClass = isLight
    ? "p-4 bg-white text-black rounded shadow"
    : "p-4 bg-gray-800 text-white rounded shadow";
  const inputClass = isLight
    ? "flex-grow p-1 text-sm border border-gray-300 rounded bg-gray-100 text-black font-semibold"
    : "flex-grow p-1 text-sm border border-gray-600 rounded bg-gray-700 text-white font-semibold";
  const buttonSaveClass = isLight
    ? "px-2 py-1 bg-green-300 text-black text-xs rounded hover:bg-green-400"
    : "px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700";
  const buttonCancelClass = isLight
    ? "px-2 py-1 bg-gray-300 text-black text-xs rounded hover:bg-gray-400"
    : "px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700";

  // Determine the title color:
  // If userOptions has a specific textColor, use it.
  // In light mode, if the textColor is the default yellow (#ebb305), override it with black.
  let titleColor: string;
  if (userOptions && userOptions.textColor) {
    titleColor =
      isLight && userOptions.textColor.toLowerCase() === "#ebb305"
        ? "#000000"
        : userOptions.textColor;
  } else {
    titleColor = isLight ? '#000000' : '#ffffff';
  }

  // Local state for editing title, URL, scale, and scroll allowance
  const [editingTitle, setEditingTitle] = useState(false);
  const [widgetTitle, setWidgetTitle] = useState(widget.title || "Embedded Page");
  const [tempEmbedUrl, setTempEmbedUrl] = useState(widget.embedUrl || "");
  const [scale, setScale] = useState(widget.embedScale || 1);
  const [allowScroll, setAllowScroll] = useState(widget.embedAllowScroll || false);

  const saveWidgetTitle = () => {
    updateWidget(widget.id, (w) => ({
      ...w,
      title: widgetTitle,
    }));
    setEditingTitle(false);
  };

  const saveEmbedUrl = () => {
    let processedUrl = tempEmbedUrl.trim();
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = 'https://' + processedUrl;
    }
    updateWidget(widget.id, (w) => ({
      ...w,
      embedUrl: processedUrl,
    }));
  };

  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newScale = Number(e.target.value);
    setScale(newScale);
    updateWidget(widget.id, (w) => ({
      ...w,
      embedScale: newScale,
    }));
  };

  const handleAllowScrollChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAllow = e.target.checked;
    setAllowScroll(newAllow);
    updateWidget(widget.id, (w) => ({
      ...w,
      embedAllowScroll: newAllow,
    }));
  };

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        {editingTitle ? (
          <div className="flex items-center flex-grow">
            <input
              type="text"
              value={widgetTitle}
              onChange={(e) => setWidgetTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && saveWidgetTitle()}
              className={inputClass}
              autoFocus
            />
            <button
              onClick={saveWidgetTitle}
              className={`ml-1 ${buttonSaveClass}`}
              title="Save Title"
            >
              ✓
            </button>
            <button
              onClick={() => setEditingTitle(false)}
              className={`ml-1 ${buttonCancelClass}`}
              title="Cancel"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="flex items-center">
            <h4 className="font-bold text-xl" style={{ color: titleColor }}>
              {widget.title || "Embedded Page"}
            </h4>
            {isInEditMode && (
              <button
                onClick={() => setEditingTitle(true)}
                className="text-gray-300 hover:text-white ml-2"
                title="Edit Title"
              >
                ✎
              </button>
            )}
          </div>
        )}
        {isInEditMode && (
          <div className="flex items-center">
            <button
              onClick={() => {
                if (chrome && chrome.runtime && chrome.runtime.openOptionsPage) {
                  chrome.runtime.openOptionsPage();
                } else {
                  console.error('Chrome runtime API not available');
                }
              }}
              className="text-gray-300 hover:text-white ml-2"
              title="Extension Options"
            >
              Options
            </button>
            <button
              onClick={() => removeWidget(widget.id)}
              className="text-red-500 hover:text-red-600 ml-2"
              title="Remove Widget"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* Edit mode: Embed URL input, scale slider, and allow scroll checkbox */}
      {isInEditMode && (
        <>
          <div className="mb-2">
            <label className="block text-sm mb-1">Embed URL:</label>
            <input
              type="text"
              value={tempEmbedUrl}
              onChange={(e) => setTempEmbedUrl(e.target.value)}
              onBlur={saveEmbedUrl}
              className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white text-sm"
              placeholder="Paste URL to embed"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm mb-1">
              Scale: {Math.round(scale * 100)}%
            </label>
            <input
              type="range"
              min="0.5"
              max="1"
              step="0.05"
              value={scale}
              onChange={handleScaleChange}
              className="w-full"
            />
          </div>
          <div className="mb-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={allowScroll}
                onChange={handleAllowScrollChange}
                className="form-checkbox h-4 w-4 text-blue-500"
              />
              <span className="ml-2 text-sm">Allow Scroll</span>
            </label>
          </div>
        </>
      )}

      {/* View mode: Render the embedded page with scrollbars if allowed */}
      {!isInEditMode && widget.embedUrl && (
        <div
          className={`w-full ${allowScroll ? "overflow-auto" : "overflow-hidden"}`}
          style={{ height: '16rem' }}
        >
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              width: `${100 / scale}%`,
              height: `${100 / scale}%`,
            }}
          >
            <iframe
              src={widget.embedUrl}
              title={widget.title}
              className="w-full h-full rounded"
              style={{ border: 'none' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EmbedPageWidgetComponent;
