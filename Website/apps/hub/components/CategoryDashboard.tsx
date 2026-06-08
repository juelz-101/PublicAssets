// components/CategoryDashboard.tsx
import React from 'react';
import { NavItem } from '../types';
import { Manifest } from '../services/contentService';
import GitHubImage from './GitHubImage';

interface CategoryDashboardProps<T extends string> {
    title: string;
    subtitle?: string;
    items: NavItem<T>[];
    onItemClick: (id: T) => void;
    manifest: Manifest | null;
    // Optional mapper to pull data from the current page JSON
    dataMapper?: (id: T) => { thumbnail?: string; summary?: string; name?: string };
}

const CategoryDashboard = <T extends string>({ 
    title, 
    subtitle, 
    items, 
    onItemClick, 
    manifest, 
    dataMapper 
}: CategoryDashboardProps<T>) => {
    return (
        <div className="space-y-10 animate-fade-in-up">
            <div className="border-b border-white/10 pb-6">
                <h2 className="text-4xl sm:text-5xl font-extrabold text-amber-400 tracking-tight">{title}</h2>
                {subtitle && <p className="text-gray-400 mt-3 text-lg">{subtitle}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {items.map((item) => {
                    const mappedData = dataMapper ? dataMapper(item.id) : {};
                    const displayName = mappedData.name || item.label;
                    const summary = mappedData.summary || "Explore more in this section.";
                    
                    return (
                        <div 
                            key={item.id}
                            onClick={() => onItemClick(item.id)}
                            className="bg-gray-900/50 backdrop-blur-lg rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-xl group cursor-pointer hover:ring-amber-500/50 transition-all duration-300 flex flex-col glow-on-hover glow-primary"
                        >
                            <div className="h-44 overflow-hidden relative">
                                <GitHubImage 
                                    manifest={manifest}
                                    path={mappedData.thumbnail || ''}
                                    alt={displayName}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    placeholderCat="gaming"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-70" />
                            </div>
                            <div className="p-6 flex-grow flex flex-col">
                                <h3 className="text-2xl font-bold text-amber-300 mb-3 group-hover:text-amber-400 transition-colors">
                                    {displayName}
                                </h3>
                                <p className="text-gray-300 text-sm leading-relaxed mb-6 line-clamp-3">
                                    {summary}
                                </p>
                                <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5">
                                    <span className="text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] group-hover:translate-x-1 transition-transform">
                                        Explore Section &rarr;
                                    </span>
                                    {item.children && (
                                        <span className="text-gray-500 text-[10px] font-bold">
                                            {item.children.length} Sub-sections
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CategoryDashboard;
