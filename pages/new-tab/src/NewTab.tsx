import React, { useState, useEffect } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';
import WidgetComponent from './WidgetComponent';
import EmbedPageWidgetComponent from './EmbedPageWidgetComponent';
import GoogleSearchBar from './GoogleSearchBar';

// Import JSON configurations
import defaultConfig from './default.json';
import indieHackerConfig from './indieHacker.json';
import microsoftConfig from './microsoft.json';
import googleConfig from './google.json';


export type Widget = {
  id: string;
  type: "bookmark" | "embed";
  title?: string;
  urls?: Array<{
    url: string;
    displayName: string;
  }>;
  embedUrl?: string;
  embedScale?: number;
  embedAllowScroll?: boolean;
};

export type Columns = {
  [key: string]: Widget[];
};

// Configuration map with type assertion
const configMap: { [key: string]: Columns } = {
  default: defaultConfig as Columns,
  indieHacker: indieHackerConfig as Columns,
  microsoft: microsoftConfig as Columns,
  google: googleConfig as Columns,

};

const getStoredColumns = (): Columns => {
  const saved = localStorage.getItem('columns');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error('Error parsing columns from localStorage:', error);
    }
  }
  // Return default configuration for new installs
  return configMap['default'];
};

interface OptionsConfig {
  textColor: string;
  backgroundMode: "default" | "solid" | "image";
  backgroundColor: string;
  backgroundImageUrl: string;
  fontFamily: string;
}

const DEFAULT_OPTIONS: OptionsConfig = {
  textColor: "#ebb305",
  backgroundMode: "default",
  backgroundColor: "#ffffff",
  backgroundImageUrl: "",
  fontFamily: "Arial",
};

const presetBookmarkCategories: {
  [category: string]: Array<{ url: string; displayName: string }>;
} = {
  "AI Tools": [
    { url: "https://chat.openai.com", displayName: "ChatGPT" },
    { url: "https://chat.mistral.ai/chat", displayName: "Mistral Chat" },
    { url: "https://www.perplexity.ai", displayName: "Perplexity" },
    { url: "https://claude.ai/new", displayName: "Claude" },
    { url: "https://grok.com/", displayName: "Grok" },
  ],
  "Google Tools": [
    { url: "https://drive.google.com", displayName: "Drive" },
    { url: "https://mail.google.com", displayName: "Gmail" },
    { url: "https://calendar.google.com", displayName: "Calendar" },
  ],
  "Microsoft Tools": [
    { url: "https://www.office.com", displayName: "Office 365" },
    { url: "https://outlook.live.com", displayName: "Outlook" },
  ],
  "Social Media": [
    { url: "https://www.facebook.com", displayName: "Facebook" },
    { url: "https://twitter.com", displayName: "Twitter" },
    { url: "https://www.instagram.com", displayName: "Instagram" },
  ],
  "Journals": [
    { url: "https://www.bbc.com", displayName: "BBC" },
    { url: "https://www.nytimes.com", displayName: "NY Times" },
    { url: "https://www.theguardian.com", displayName: "The Guardian" },
  ],
};

const presetEmbedPages: {
  [name: string]: { embedUrl: string; title: string; embedScale: number };
} = {
  "Pomodoro": {
    embedUrl: "https://notion.yawningface.org/pomodoro",
    title: "Pomodoro",
    embedScale: 0.6,
  },
  "Day of the year": {
    embedUrl: "https://notion.yawningface.org/day-of-year",
    title: "Day of the year",
    embedScale: 0.6,
  },
  "Chronometer": {
    embedUrl: "https://notion.yawningface.org/chronometer",
    title: "Chronometer",
    embedScale: 0.6,
  },
  "Deadline countdown": {
    embedUrl: "https://notion.yawningface.org/deadline-countdown",
    title: "Deadline countdown",
    embedScale: 0.6,
  },
  "Lofi music player": {
    embedUrl: "https://notion.yawningface.org/lofi",
    title: "Lofi music player",
    embedScale: 0.6,
  },
};

import { useStorage } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';

const NewTab = () => {
  const [columns, setColumns] = useState<Columns>(getStoredColumns());
  const [isEditMode, setIsEditMode] = useState(false);
  const [showOtherOptions, setShowOtherOptions] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<string>('default');
  
  // Load user options from localStorage (set via Options page)
  const [options, setOptions] = useState<OptionsConfig>(() => {
    const stored = localStorage.getItem('userOptions');
    return stored ? JSON.parse(stored) : DEFAULT_OPTIONS;
  });
  
  // Google search enabled by default
  const [enableGoogleSearch, setEnableGoogleSearch] = useState(true);
  
  // Use the theme from storage (light/dark) to decide defaults if no custom background is set.
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';
  
  useEffect(() => {
    localStorage.setItem('columns', JSON.stringify(columns));
  }, [columns]);

  const updateWidget = (
    widgetId: string,
    updater: (widget: Widget) => Widget | null
  ) => {
    const newColumns: Columns = { ...columns };
    for (const colId in newColumns) {
      newColumns[colId] = newColumns[colId]
        .map((w) => (w.id === widgetId ? updater(w) : w))
        .filter((w): w is Widget => w !== null);
    }
    setColumns(newColumns);
  };

  const removeWidget = (widgetId: string) => {
    updateWidget(widgetId, () => null);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;

    const sourceColumn = Array.from(columns[source.droppableId]);
    const destColumn =
      source.droppableId === destination.droppableId
        ? sourceColumn
        : Array.from(columns[destination.droppableId]);

    const [movedWidget] = sourceColumn.splice(source.index, 1);
    destColumn.splice(destination.index, 0, movedWidget);

    setColumns({
      ...columns,
      [source.droppableId]: sourceColumn,
      [destination.droppableId]: destColumn,
    });
  };

  const addBookmarkWidget = () => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type: 'bookmark',
      title: 'Bookmarks',
      urls: [],
    };
    setColumns({
      ...columns,
      'col-1': [newWidget, ...columns['col-1']],
    });
  };

  const addEmbedWidget = () => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type: 'embed',
      title: 'Embedded Page',
      embedUrl: '',
      embedScale: 1,
    };
    setColumns({
      ...columns,
      'col-1': [newWidget, ...columns['col-1']],
    });
  };

  const addPresetBookmarkWidget = (category: string) => {
    const presetBookmarks = presetBookmarkCategories[category];
    if (!presetBookmarks) return;
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type: 'bookmark',
      title: category,
      urls: presetBookmarks,
    };
    setColumns({
      ...columns,
      'col-1': [newWidget, ...columns['col-1']],
    });
  };

  const [selectedPreset, setSelectedPreset] = useState<string>("AI Tools");

  const [selectedEmbedPreset, setSelectedEmbedPreset] = useState<string>("Pomodoro");

  const addPresetEmbedWidget = (presetName: string) => {
    const preset = presetEmbedPages[presetName];
    if (!preset) return;
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type: 'embed',
      title: preset.title,
      embedUrl: preset.embedUrl,
      embedScale: preset.embedScale,
    };
    setColumns({
      ...columns,
      'col-1': [newWidget, ...columns['col-1']],
    });
  };

  const applyConfig = (configName: string) => {
    if (configMap[configName]) {
      setColumns(configMap[configName]);
      localStorage.setItem('columns', JSON.stringify(configMap[configName]));
      setSelectedConfig(configName);
    }
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(columns, null, 2);
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'bookmarks-export.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = () => {
      const file = input.files ? input.files[0] : null;
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedData = JSON.parse(e.target?.result as string);
            setColumns(importedData);
            alert('Configuration imported successfully!');
          } catch (error) {
            alert('Failed to import configuration: Invalid file.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const openExtensionOptions = () => {
    if (chrome && chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      console.error('Chrome runtime API not available');
    }
  };

  const columnOrder = ['col-1', 'col-2', 'col-3', 'col-4'];

  let containerStyle: React.CSSProperties = {
    fontFamily: options.fontFamily,
  };

  if (options.backgroundMode === "solid" && options.backgroundColor) {
    containerStyle = {
      ...containerStyle,
      backgroundColor: options.backgroundColor,
      color: options.textColor,
    };
  } else if (options.backgroundMode === "image" && options.backgroundImageUrl) {
    containerStyle = {
      ...containerStyle,
      backgroundImage: `url(${options.backgroundImageUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      color: options.textColor,
    };
  } else {
    containerStyle = {
      ...containerStyle,
      backgroundColor: isLight ? "#f3f4f6" : "#111827",
      color: isLight ? "#1f2937" : "#f3f4f6",
    };
  }

  return (
    <div className="p-4 min-h-screen" style={containerStyle}>
      {/* Navbar */}
      <div
        className={`flex items-center justify-between p-2 rounded ${
          isEditMode ? 'bg-blue-900 text-white' : 'bg-transparent'
        }`}
      >
        {isEditMode ? (
          <p className="text-sm">
            You are in edit mode. You can add, edit, and remove widgets.
          </p>
        ) : (
          <div className="flex-1" />
        )}
        <div className="flex items-center space-x-2">
          <button
            className={`px-3 py-2 font-bold rounded-md shadow ${
              isEditMode
                ? 'bg-red-500 text-black hover:bg-red-600'
                : 'bg-yellow-500 text-black hover:bg-yellow-600'
            }`}
            onClick={toggleEditMode}
          >
            {isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
          </button>
          <button
            className="px-3 py-2 font-bold rounded-md shadow bg-gray-300 text-black hover:bg-gray-400"
            onClick={openExtensionOptions}
            title="Extension Options"
          >
            Options
          </button>
        </div>
      </div>

      {/* Google Search Area */}
      {isEditMode ? (
        <div className="my-4">
          <button 
            onClick={() => setEnableGoogleSearch(prev => !prev)}
            className="px-3 py-1 bg-blue-500 text-white text-xs rounded"
            title="Toggle Google Search"
          >
            {enableGoogleSearch ? "Disable Google Search" : "Enable Google Search"}
          </button>
        </div>
      ) : (
        enableGoogleSearch && (
          <div className="my-4">
            <GoogleSearchBar />
          </div>
        )
      )}

      {isEditMode && (
        <>
          {/* Configuration Selector */}
          <div className="flex items-center gap-2 mt-4">
            <label className="font-bold">Select Configuration:</label>
            <select
              value={selectedConfig}
              onChange={(e) => {
                const configName = e.target.value;
                setSelectedConfig(configName);
                applyConfig(configName);
              }}
              className="p-2 border rounded bg-gray-200 text-black"
            >
              {Object.keys(configMap).map((key) => (
                <option key={key} value={key}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Primary Edit Controls */}
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              className="px-3 py-2 bg-[#ebb305] text-[#101827] font-bold rounded-md shadow hover:bg-[#d4a20f]"
              onClick={addBookmarkWidget}
            >
              + Add Bookmark Widget
            </button>
            <button
              className="px-3 py-2 bg-[#ebb305] text-[#101827] font-bold rounded-md shadow hover:bg-[#d4a20f]"
              onClick={addEmbedWidget}
            >
              + Add Embed Widget
            </button>
          </div>
          {/* Other Options Accordion */}
          <div className="mt-4">
            <button 
              className="px-3 py-2 bg-gray-300 text-black rounded-md shadow hover:bg-gray-400"
              onClick={() => setShowOtherOptions(!showOtherOptions)}
            >
              {showOtherOptions ? "Hide Other Options" : "Show Other Options"}
            </button>
            {showOtherOptions && (
              <div className="flex flex-col gap-4 mt-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    className="px-3 py-2 bg-[#ebb305] text-[#101827] font-bold rounded-md shadow hover:bg-[#d4a20f]"
                    onClick={exportData}
                  >
                    Export Data
                  </button>
                  <button
                    onClick={importData}
                    className="px-3 py-2 bg-indigo-500 text-white font-bold rounded-md shadow hover:bg-indigo-600"
                  >
                    Import Configuration
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <label className="font-bold">Preset Bookmarks:</label>
                  <select
                    value={selectedPreset}
                    onChange={(e) => setSelectedPreset(e.target.value)}
                    className="p-2 border rounded bg-gray-200 text-black"
                  >
                    {Object.keys(presetBookmarkCategories).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => addPresetBookmarkWidget(selectedPreset)}
                    className="px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                  >
                    Add Preset Bookmark Widget
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <label className="font-bold">Preset Embeds:</label>
                  <select
                    value={selectedEmbedPreset}
                    onChange={(e) => setSelectedEmbedPreset(e.target.value)}
                    className="p-2 border rounded bg-gray-200 text-black"
                  >
                    {Object.keys(presetEmbedPages).map((key) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => addPresetEmbedWidget(selectedEmbedPreset)}
                    className="px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                  >
                    + Add Preset Embed Widget
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-4 gap-4 mt-4">
          {columnOrder.map((colId) => (
            <Droppable droppableId={colId} key={colId}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex flex-col gap-2 p-2 min-h-[300px] ${
                    isEditMode
                      ? snapshot.isDraggingOver
                        ? 'border-2 border-yellow-600'
                        : 'border border-yellow-500'
                      : ''
                  }`}
                >
                  {columns[colId].length > 0 ? (
                    columns[colId].map((widget, index) => (
                      <Draggable
                        key={widget.id}
                        draggableId={widget.id}
                        index={index}
                        isDragDisabled={!isEditMode}
                      >
                        {(provided, snapshot) => {
                          const draggableStyle = provided.draggableProps.style as React.CSSProperties;
                          return (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="w-full"
                              style={{
                                ...draggableStyle,
                                width: draggableStyle.width || '100%',
                              }}
                            >
                              {widget.type === 'embed' ? (
                                <EmbedPageWidgetComponent
                                  widget={widget}
                                  updateWidget={updateWidget}
                                  removeWidget={removeWidget}
                                  isInEditMode={isEditMode}
                                />
                              ) : (
                                <WidgetComponent
                                  widget={widget}
                                  updateWidget={updateWidget}
                                  removeWidget={removeWidget}
                                  isInEditMode={isEditMode}
                                />
                              )}
                            </div>
                          );
                        }}
                      </Draggable>
                    ))
                  ) : (
                    <p className="text-transparent select-none">Drop widgets here</p>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default NewTab;