import React, { useState, useEffect } from 'react';
import { NavItem } from '../types';

interface SideNavProps<T extends string> {
  tabs: (T | NavItem<T>)[];
  activeTab: T;
  setActiveTab: (tab: T) => void;
}

const SideNav = <T extends string>({ tabs, activeTab, setActiveTab }: SideNavProps<T>) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Automatically expand parent if a child is active
  useEffect(() => {
    tabs.forEach(tab => {
        if (typeof tab !== 'string' && tab.children) {
            if (tab.children.some(child => child.id === activeTab) || tab.id === activeTab) {
                setExpandedItems(prev => new Set(prev).add(tab.id));
            }
        }
    });
  }, [activeTab, tabs]);

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const renderItem = (item: T | NavItem<T>, depth = 0) => {
    const isObject = typeof item !== 'string';
    const id = isObject ? item.id : item;
    const label = isObject ? item.label : item;
    const hasChildren = isObject && item.children && item.children.length > 0;
    const isActive = activeTab === id;
    const isExpanded = expandedItems.has(id);

    const handleClick = () => {
      setActiveTab(id as T);
      if (hasChildren && !isExpanded) {
        setExpandedItems(prev => new Set(prev).add(id));
      }
    };

    return (
      <div key={id} className="flex flex-col w-full">
        <div className="flex items-center group w-full">
            <button
                onClick={handleClick}
                className={`relative flex-grow px-4 py-3 text-sm text-left font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${
                    isActive
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
                style={{ paddingLeft: `${1 + depth * 1}rem` }}
                aria-current={isActive ? 'page' : undefined}
            >
                {isActive && (
                    <span 
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-amber-400 rounded-r-full" 
                        style={{ boxShadow: '0 0 8px rgba(251, 191, 36, 0.8)' }} 
                    />
                )}
                <span>{label}</span>
            </button>
            
            {hasChildren && (
                <button 
                    onClick={(e) => { e.stopPropagation(); toggleExpand(id); }}
                    className="p-3 text-gray-500 hover:text-amber-400 transition-colors"
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                >
                    <svg 
                        className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            )}
        </div>

        {hasChildren && isExpanded && (
          <div className="flex flex-col mt-1 mb-2 ml-2 border-l border-white/5">
            {item.children!.map(child => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="flex flex-row md:flex-col gap-1 p-2 bg-gray-900/50 backdrop-blur-lg rounded-2xl ring-1 ring-white/10 shadow-2xl overflow-x-auto md:overflow-x-visible custom-scrollbar">
      {tabs.map(tab => renderItem(tab))}
    </nav>
  );
};

export default SideNav;
