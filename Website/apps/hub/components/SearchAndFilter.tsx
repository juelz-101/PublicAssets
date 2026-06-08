import React, { useState } from 'react';

interface SearchAndFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  filterOptions: string[];
  filterTypeLabel: string;
}

const SearchIcon = () => (
    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({ searchTerm, setSearchTerm, activeFilter, setActiveFilter, filterOptions, filterTypeLabel }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-2 transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-w-md opacity-100' : 'max-w-0 opacity-0'}`}>
         {/* Search Input */}
        <div className="relative flex-grow">
          <input
            type="search"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-3 pr-3 py-2 text-sm bg-gray-800/60 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:outline-none focus:border-amber-500 transition-all"
            aria-hidden={!isExpanded}
            tabIndex={isExpanded ? 0 : -1}
          />
        </div>
         {/* Generic Filter */}
        <div className="flex-shrink-0">
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="w-full sm:w-auto h-full px-3 py-2 text-sm bg-gray-800/60 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:outline-none focus:border-amber-500 transition-all appearance-none"
            aria-label={`Filter by ${filterTypeLabel}`}
            aria-hidden={!isExpanded}
            tabIndex={isExpanded ? 0 : -1}
          >
            {filterOptions.map(option => (
              <option key={option} value={option} className="bg-gray-800 text-white">{option}</option>
            ))}
          </select>
        </div>
      </div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-2.5 flex-shrink-0 bg-gray-800/60 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/80 transition-all"
        aria-label={isExpanded ? 'Close search filters' : 'Open search filters'}
        aria-expanded={isExpanded}
      >
        {isExpanded ? <CloseIcon /> : <SearchIcon />}
      </button>
    </div>
  );
};

export default SearchAndFilter;