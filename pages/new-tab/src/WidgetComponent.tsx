import React, { useState } from 'react';
import { Widget } from './NewTab';
import { useStorage } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';

type WidgetProps = {
  widget?: Widget;
  updateWidget: (widgetId: string, updater: (w: Widget) => Widget | null) => void;
  removeWidget: (widgetId: string) => void;
  isInEditMode: boolean;
};

// Default user options (should match Options page defaults)
const defaultOptions = {
  textColor: "#ebb305", // default yellow
  fontFamily: "Arial",
};

const WidgetComponent: React.FC<WidgetProps> = ({ widget, updateWidget, removeWidget, isInEditMode }) => {
  // Read the current theme from storage
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';

  if (!widget) {
    console.error('WidgetComponent received an undefined widget.');
    return <div className="p-2 bg-red-100 text-red-800">Error: Widget not found.</div>;
  }

  // Read user options from localStorage (for text color and font)
  const storedOptions = localStorage.getItem('userOptions');
  const userOptions = storedOptions ? JSON.parse(storedOptions) : defaultOptions;

  // Determine the title color.
  // If in light mode and the stored textColor is the default yellow (#ebb305), override with black.
  let titleColor: string;
  if (userOptions && userOptions.textColor) {
    titleColor = isLight && userOptions.textColor.toLowerCase() === "#ebb305"
      ? "#000000"
      : userOptions.textColor;
  } else {
    titleColor = isLight ? "#000000" : "#ffffff";
  }

  // Set overall widget style using the user-defined font and text color.
  const widgetStyle: React.CSSProperties = {
    fontFamily: userOptions.fontFamily,
    color: userOptions.textColor,
  };

  // Default to empty array if urls is undefined
  const initialUrls = widget.urls || [];

  const [url, setUrl] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editUrl, setEditUrl] = useState('');
  const [editName, setEditName] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [widgetTitle, setWidgetTitle] = useState(widget.title || "Bookmarks");
  const [showFavicons, setShowFavicons] = useState(true);

  const addUrl = () => {
    if (!url.trim()) return;
    let processedUrl = url.trim();
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = 'https://' + processedUrl;
    }
    
    let displayName;
    try {
      const urlObj = new URL(processedUrl);
      displayName = urlObj.hostname;
    } catch {
      displayName = processedUrl;
    }

    updateWidget(widget.id, (w) => ({
      ...w,
      urls: [...(w.urls || []), { url: processedUrl, displayName }],
    }));
    setUrl('');
  };

  const removeUrl = (index: number) => {
    updateWidget(widget.id, (w) => ({
      ...w,
      urls: (w.urls || []).filter((_, i) => i !== index),
    }));
  };

  const startEditing = (index: number) => {
    setEditIndex(index);
    setEditUrl((widget.urls || [])[index].url);
    setEditName((widget.urls || [])[index].displayName);
  };

  const saveBookmark = () => {
    if (editIndex === null) return;
    let processedUrl = editUrl.trim();
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = 'https://' + processedUrl;
    }
    
    updateWidget(widget.id, (w) => ({
      ...w,
      urls: (w.urls || []).map((item, i) =>
        i === editIndex ? { url: processedUrl, displayName: editName } : item
      ),
    }));
    setEditIndex(null);
    setEditUrl('');
    setEditName('');
  };

  const saveWidgetTitle = () => {
    updateWidget(widget.id, (w) => ({
      ...w,
      title: widgetTitle
    }));
    setEditingTitle(false);
  };

  const getFaviconUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}`;
    } catch {
      return `https://www.google.com/s2/favicons?domain=example.com`;
    }
  };

  const handleDeleteClick = () => {
    setShowConfirmDelete(true);
  };

  const confirmDelete = () => {
    removeWidget(widget.id);
    setShowConfirmDelete(false);
  };

  const cancelDelete = () => {
    setShowConfirmDelete(false);
  };

  const cancelEditing = () => {
    setEditIndex(null);
    setEditUrl('');
    setEditName('');
  };

  const startEditingTitle = () => {
    setEditingTitle(true);
  };

  const cancelEditingTitle = () => {
    setWidgetTitle(widget.title || "Bookmarks");
    setEditingTitle(false);
  };

  // The container styling changes with the theme.
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

  return (
    <div className={containerClass} style={widgetStyle}>
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
              onClick={cancelEditingTitle}
              className={`ml-1 ${buttonCancelClass}`}
              title="Cancel"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="flex items-center">
            {/* Updated title: remove text-yellow-500 and use inline style */}
            <h4 className="font-bold text-xl" style={{ color: titleColor }}>
              {widget.title || "Bookmarks"}
            </h4>
            {isInEditMode && (
              <button
                onClick={startEditingTitle}
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
              className="text-red-500 hover:text-red-600 ml-2"
              onClick={handleDeleteClick}
              title="Remove Widget"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {isInEditMode && (
        <div className="mb-2">
          <label className="inline-flex items-center">
            <input 
              type="checkbox"
              checked={showFavicons}
              onChange={() => setShowFavicons(!showFavicons)}
              className="form-checkbox h-4 w-4 text-blue-500"
            />
            <span className="ml-2 text-sm">Show Favicons</span>
          </label>
        </div>
      )}

      {showConfirmDelete && (
        <div className="mb-2 p-2 bg-red-900 rounded">
          <p className="text-white text-sm mb-2">Are you sure you want to remove this widget?</p>
          <div className="flex justify-end">
            <button 
              className="px-2 py-1 bg-gray-600 text-white text-xs rounded mr-2"
              onClick={cancelDelete}
            >
              Cancel
            </button>
            <button 
              className="px-2 py-1 bg-red-600 text-white text-xs rounded"
              onClick={confirmDelete}
            >
              Remove
            </button>
          </div>
        </div>
      )}

      <div className="mb-2">
        {(widget.urls || []).length > 0 ? (
          (widget.urls || []).map((item, index) => (
            <div key={index} className={`text-sm mb-2 ${isInEditMode ? 'p-2 border border-gray-700 rounded' : ''}`}>
              {editIndex === index ? (
                <div className="flex flex-col">
                  <div className="mb-1">
                    <label className="text-xs text-gray-400 block mb-1">Display Name:</label>
                    <div className="flex">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className={
                          isLight
                            ? "flex-grow p-1 text-sm border border-gray-300 rounded bg-gray-100 text-black"
                            : "flex-grow p-1 text-sm border border-gray-600 rounded bg-gray-700 text-white"
                        }
                      />
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <label className="text-xs text-gray-400 block mb-1">URL:</label>
                    <div className="flex">
                      <input
                        type="text"
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        className={
                          isLight
                            ? "flex-grow p-1 text-sm border border-gray-300 rounded bg-gray-100 text-black"
                            : "flex-grow p-1 text-sm border border-gray-600 rounded bg-gray-700 text-white"
                        }
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={cancelEditing}
                      className={buttonCancelClass}
                      title="Cancel"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveBookmark}
                      className={`ml-2 ${buttonSaveClass}`}
                      title="Save"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center">
                    {showFavicons && (
                      <img 
                        src={getFaviconUrl(item.url)} 
                        alt=""
                        className="w-4 h-4 mr-2"
                      />
                    )}
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline break-all"
                      style={{ color: titleColor }}
                    >
                      {item.displayName}
                    </a>
                    
                    {isInEditMode && (
                      <div className="ml-auto flex">
                        <button
                          onClick={() => startEditing(index)}
                          className="text-gray-300 hover:text-white mr-1"
                          title="Edit Bookmark"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => removeUrl(index)}
                          className="text-gray-300 hover:text-white"
                          title="Remove Bookmark"
                        >
                          ✖
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {isInEditMode && (
                    <div className="mt-1 pl-6 text-xs text-gray-400 break-all">
                      {item.url}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm">No bookmarks yet.</p>
        )}
      </div>

      {isInEditMode && (
        <div className="flex items-center">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addUrl()}
            placeholder="Add URL"
            className={
              isLight
                ? "flex-grow p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 text-sm bg-gray-100 text-black"
                : "flex-grow p-2 border border-gray-600 rounded focus:outline-none focus:ring focus:border-blue-300 text-sm bg-gray-700 text-white"
            }
          />
          <button
            onClick={addUrl}
            className={
              isLight
                ? "ml-2 px-3 py-2 bg-green-300 text-black rounded hover:bg-green-400 text-sm"
                : "ml-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            }
            title="Add Bookmark"
          >
            ➕
          </button>
        </div>
      )}
    </div>
  );
};

export default WidgetComponent;
