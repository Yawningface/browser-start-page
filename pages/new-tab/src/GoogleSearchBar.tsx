import React, { useState, FormEvent } from 'react';
import { useStorage } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';

const GoogleSearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';

  // Retrieve user options (if any) to get a custom text color
  const [userOptions] = useState<any>(() => {
    const stored = localStorage.getItem('userOptions');
    return stored ? JSON.parse(stored) : null;
  });
  
  // Default text color from OptionsConfig is "#ebb305" (yellow).
  // In light mode, override yellow with black unless the user explicitly chose another color.
  let textColor: string;
  if (userOptions && userOptions.textColor) {
    // If it's yellow and we are in light mode, use black instead
    textColor = isLight && userOptions.textColor.toLowerCase() === "#ebb305" 
      ? "#000000" 
      : userOptions.textColor;
  } else {
    textColor = isLight ? "#000000" : "#ffffff";
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }
  };

  // Conditional classes for the search bar container and button based on theme
  const searchBarContainerClass = isLight 
    ? "flex items-center bg-white rounded-full px-4 py-2 shadow-sm" 
    : "flex items-center bg-gray-700 rounded-full px-4 py-2 shadow-sm";

  const buttonClass = isLight 
    ? "px-4 py-2 bg-gray-50 text-black text-sm hover:bg-gray-100 border border-gray-300 rounded"
    : "px-4 py-2 bg-gray-600 text-white text-sm hover:bg-gray-500 border border-gray-500 rounded";

  return (
    <div className="flex flex-col items-center pt-2 pb-6">
      {/* Smaller Google logo */}
      <img
        src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_160x56dp.png"
        alt="Google Logo"
        className="mb-4 w-40" // shrinks the logo width
      />

      <form onSubmit={handleSubmit} className="w-full max-w-xl px-4">
        {/* Search Bar */}
        <div className={searchBarContainerClass}>
          {/* Magnifying Glass Icon */}
          <svg
            className="w-5 h-5 text-gray-400 mr-3"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ color: textColor }}
            className="flex-grow bg-transparent focus:outline-none placeholder-gray-400"
            placeholder="Search Google"
          />
        </div>

        {/* Search Button */}
        <div className="flex justify-center mt-4">
          <button type="submit" className={buttonClass}>
            Google Search
          </button>
        </div>
      </form>
    </div>
  );
};

export default GoogleSearchBar;
