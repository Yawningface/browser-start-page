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
import defaultConfig from './default.json';
import indieHackerConfig from './indieHacker.json';
import microsoftConfig from './microsoft.json';
import googleConfig from './google.json';
import { useStorage } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';

export type Widget = {
  id: string;
  type: 'bookmark' | 'embed';
  title?: string;
  urls?: Array<{ url: string; displayName: string }>;
  embedUrl?: string;
  embedScale?: number;
  embedAllowScroll?: boolean;
};

export type Columns = { [key: string]: Widget[] };

export interface OptionsConfig {
  textColor: string;
  backgroundMode: 'default' | 'solid' | 'image';
  backgroundColor: string;
  backgroundImageUrl: string;
  fontFamily: string;
}

interface UnifiedConfig {
  columns: Columns;
  options: OptionsConfig;
}

const configMap: { [key: string]: UnifiedConfig } = {
  default: defaultConfig as UnifiedConfig,
  indieHacker: indieHackerConfig as UnifiedConfig,
  microsoft: microsoftConfig as UnifiedConfig,
  google: googleConfig as UnifiedConfig,
};

const presetBookmarkCategories: {
  [category: string]: Array<{ url: string; displayName: string }>;
} = {
  'AI Tools': [
    { url: 'https://chat.openai.com', displayName: 'ChatGPT' },
    { url: 'https://chat.mistral.ai/chat', displayName: 'Mistral Chat' },
    { url: 'https://www.perplexity.ai', displayName: 'Perplexity' },
    { url: 'https://claude.ai/new', displayName: 'Claude' },
    { url: 'https://grok.com/', displayName: 'Grok' },
  ],
  'Google Tools': [
    { url: 'https://drive.google.com', displayName: 'Drive' },
    { url: 'https://mail.google.com', displayName: 'Gmail' },
    { url: 'https://calendar.google.com', displayName: 'Calendar' },
  ],
  'Microsoft Tools': [
    { url: 'https://www.office.com', displayName: 'Office 365' },
    { url: 'https://www.outlook.com', displayName: 'Outlook' },
  ],
  'Social Media': [
    { url: 'https://www.facebook.com', displayName: 'Facebook' },
    { url: 'https://twitter.com', displayName: 'Twitter' },
    { url: 'https://www.instagram.com', displayName: 'Instagram' },
  ],
  Journals: [
    { url: 'https://www.bbc.com', displayName: 'BBC' },
    { url: 'https://www.nytimes.com', displayName: 'NY Times' },
    { url: 'https://www.theguardian.com', displayName: 'The Guardian' },
  ],
};

const presetEmbedPages: {
  [name: string]: { embedUrl: string; title: string; embedScale: number };
} = {
  Pomodoro: {
    embedUrl: 'https://notion.yawningface.org/pomodoro',
    title: 'Pomodoro',
    embedScale: 0.6,
  },
  'Day of the year': {
    embedUrl: 'https://notion.yawningface.org/day-of-year',
    title: 'Day of the year',
    embedScale: 0.6,
  },
  Chronometer: {
    embedUrl: 'https://notion.yawningface.org/chronometer',
    title: 'Chronometer',
    embedScale: 0.6,
  },
  'Deadline countdown': {
    embedUrl: 'https://notion.yawningface.org/deadline-countdown',
    title: 'Deadline countdown',
    embedScale: 0.6,
  },
  'Lofi music player': {
    embedUrl: 'https://notion.yawningface.org/lofi',
    title: 'Lofi music player',
    embedScale: 0.6,
  },
};

const getStoredConfig = (): UnifiedConfig => {
  const saved = localStorage.getItem('unifiedConfig');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error('Error parsing unifiedConfig from localStorage:', error);
    }
  }
  return configMap['default'];
};

const NewTab = () => {
  const [{ columns, options }, setUnifiedConfig] = useState<UnifiedConfig>(
    getStoredConfig()
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [showOtherOptions, setShowOtherOptions] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<string>('default');
  const [enableGoogleSearch, setEnableGoogleSearch] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<string>('AI Tools');
  const [selectedEmbedPreset, setSelectedEmbedPreset] =
    useState<string>('Pomodoro');
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';

  useEffect(() => {
    localStorage.setItem('unifiedConfig', JSON.stringify({ columns, options }));
  }, [columns, options]);

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
    setUnifiedConfig({ columns: newColumns, options });
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

    setUnifiedConfig({
      columns: {
        ...columns,
        [source.droppableId]: sourceColumn,
        [destination.droppableId]: destColumn,
      },
      options,
    });
  };

  const addBookmarkWidget = () => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type: 'bookmark',
      title: 'Bookmarks',
      urls: [],
    };
    setUnifiedConfig({
      columns: {
        ...columns,
        'col-1': [newWidget, ...columns['col-1']],
      },
      options,
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
    setUnifiedConfig({
      columns: {
        ...columns,
        'col-1': [newWidget, ...columns['col-1']],
      },
      options,
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
    setUnifiedConfig({
      columns: {
        ...columns,
        'col-1': [newWidget, ...columns['col-1']],
      },
      options,
    });
  };

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
    setUnifiedConfig({
      columns: {
        ...columns,
        'col-1': [newWidget, ...columns['col-1']],
      },
      options,
    });
  };

  const applyConfig = (configName: string) => {
    if (configMap[configName]) {
      const confirmChange = window.confirm(
        `WARNING: Applying the "${configName}" configuration will erase your current configuration. To keep your current setup, go to the Options page and export your configuration first. Do you want to proceed?`
      );
      if (confirmChange) {
        setUnifiedConfig(configMap[configName]);
        setSelectedConfig(configName);
      }
    }
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const openExtensionOptions = () => {
    if (chrome && chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      console.error('Chrome runtime API not available');
    }
  };

  const redirectToOptions = (action: 'import' | 'export') => {
    alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)}ing the configuration is handled in the Options page. You will be redirected now.`
    );
    if (chrome && chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      console.error('Chrome runtime API not available');
    }
  };

  const columnOrder = ['col-1', 'col-2', 'col-3', 'col-4'];

  // Apply fontFamily and textColor globally
  const defaultTextColor = isLight && options.textColor === '#000000' ? '#000000' : options.textColor;
  const containerStyle: React.CSSProperties = {
    fontFamily: options.fontFamily,
    color: defaultTextColor,
    backgroundColor:
      options.backgroundMode === 'solid' && options.backgroundColor
        ? options.backgroundColor
        : isLight
        ? '#f3f4f6'
        : '#111827',
    ...(options.backgroundMode === 'image' && options.backgroundImageUrl
      ? {
          backgroundImage: `url(${options.backgroundImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      : {}),
  };

  return (
    <>
      <style>
        {`
          .new-tab-container {
            font-family: ${options.fontFamily} !important;
            color: ${defaultTextColor} !important;
          }
          .new-tab-container a {
            color: ${defaultTextColor} !important;
          }
          .new-tab-container button:not(.black-text-button) {
            color: ${isLight ? '#000000' : '#FFFFFF'} !important;
          }
          .black-text-button {
            color: #000000 !important;
          }
          .edit-mode-icon {
            color: ${defaultTextColor} !important;
          }
        `}
      </style>
      <div className="p-4 min-h-screen new-tab-container" style={containerStyle}>
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
              className={`black-text-button px-3 py-2 font-bold rounded-md shadow ${
                isEditMode
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-yellow-500 hover:bg-yellow-600'
              }`}
              onClick={toggleEditMode}
            >
              {isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
            </button>
            <button
              className="black-text-button px-3 py-2 font-bold rounded-md shadow bg-gray-300 hover:bg-gray-400"
              onClick={openExtensionOptions}
              title="Extension Options"
            >
              Options
            </button>
          </div>
        </div>

        {!isEditMode && enableGoogleSearch && (
          <div className="my-4">
            <GoogleSearchBar />
          </div>
        )}

        {isEditMode && (
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              className="black-text-button px-3 py-2 bg-gray-200 font-bold rounded-md shadow hover:bg-gray-300 flex items-center"
              onClick={() => setShowOtherOptions(!showOtherOptions)}
            >
              {showOtherOptions ? (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                  Hide Other Options
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  Show Other Options
                </>
              )}
            </button>
            <button
              className="black-text-button px-3 py-2 bg-[#ebb305] font-bold rounded-md shadow hover:bg-[#d4a20f]"
              onClick={addBookmarkWidget}
            >
              + Add Bookmark Widget
            </button>
            <button
              className="black-text-button px-3 py-2 bg-[#ebb305] font-bold rounded-md shadow hover:bg-[#d4a20f]"
              onClick={addEmbedWidget}
            >
              + Add Embed Widget
            </button>
          </div>
        )}

        {isEditMode && showOtherOptions && (
          <div className="flex flex-col gap-4 mt-4">
            <div className="flex items-center gap-2">
              <label className="font-bold">
                Explore pre-made configurations for inspiration
              </label>
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
            <div className="flex items-center gap-2">
              <button
                className="black-text-button px-3 py-1 bg-blue-500 text-xs rounded"
                onClick={() => setEnableGoogleSearch((prev) => !prev)}
                title="Toggle Google Search"
              >
                {enableGoogleSearch
                  ? 'Disable Google Search'
                  : 'Enable Google Search'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="black-text-button px-3 py-2 bg-[#ebb305] font-bold rounded-md shadow hover:bg-[#d4a20f]"
                onClick={() => redirectToOptions('export')}
              >
                Export Data
              </button>
              <button
                className="black-text-button px-3 py-2 bg-indigo-500 font-bold rounded-md shadow hover:bg-indigo-600"
                onClick={() => redirectToOptions('import')}
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
                className="black-text-button px-3 py-2 bg-indigo-500 rounded hover:bg-indigo-600"
                onClick={() => addPresetBookmarkWidget(selectedPreset)}
              >
                Add Preset Bookmark Widget
              </button>
            </div>
            <div className="flex items-center gap-2">
              <label className="font-bold">Preset Embeds:</label>
              <select
                value={selectedEmbedPreset}
                onClick={() => addPresetEmbedWidget(selectedEmbedPreset)}
                className="p-2 border rounded bg-gray-200 text-black"
              >
                {Object.keys(presetEmbedPages).map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
              <button
                className="black-text-button px-3 py-2 bg-indigo-500 rounded hover:bg-indigo-600"
                onClick={() => addPresetEmbedWidget(selectedEmbedPreset)}
              >
                + Add Preset Embed Widget
              </button>
            </div>
          </div>
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
                            const draggableStyle = provided.draggableProps
                              .style as React.CSSProperties;
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
                      <p className="text-transparent select-none">
                        Drop widgets here
                      </p>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>
    </>
  );
};

export default NewTab;