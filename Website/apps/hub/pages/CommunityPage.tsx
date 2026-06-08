// pages/CommunityPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { CommunityPageData, CommunitySideTab, CommunityPerson, CommunityEvent } from '../types';
import { Manifest } from '../services/contentService';
import SideNav from '../components/SideNav';
import IntroductionTab from '../components/music/IntroductionTab';
import CommunityCard from '../components/community/CommunityCard';

interface CommunityPageProps {
  data: CommunityPageData;
  manifest: Manifest | null;
  showDebugContent: boolean;
}

const sideTabs: CommunitySideTab[] = [
  CommunitySideTab.Introduction,
  CommunitySideTab.People,
  CommunitySideTab.Events,
];

const SESSION_STORAGE_KEY = 'zikyinc_community_active_tab';

const CommunityPage: React.FC<CommunityPageProps> = ({ data, manifest, showDebugContent }) => {
  const [activeTab, setActiveTab] = useState<CommunitySideTab>(() => {
    const savedTab = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (savedTab && Object.values(CommunitySideTab).includes(savedTab as CommunitySideTab)) {
        return savedTab as CommunitySideTab;
    }
    return CommunitySideTab.Introduction;
  });

  useEffect(() => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, activeTab);
  }, [activeTab]);

  if (!data) {
    return (
      <div className="p-8 text-center text-amber-400">
        <h2 className="text-2xl font-bold">Community page content is not available.</h2>
      </div>
    );
  }

  const handleViewDetails = (link: string) => {
    console.log('Viewing details for:', link);
  };

  const filteredPeople = useMemo(() => {
    if (!data.people) return [];
    const allPeople = [
        ...(data.people.organisers || []),
        ...(data.people.volunteers || []),
        ...(data.people.guests || [])
    ];
    return allPeople.filter(person => showDebugContent || !person.debug);
  }, [data.people, showDebugContent]);

  const filteredEvents = useMemo(() => {
    return (data.events || []).filter(event => showDebugContent || !event.debug);
  }, [data.events, showDebugContent]);

  const newCommunityItems = useMemo(() => {
      if (!data) return [];
      const items: any[] = [];
      const filterNew = (arr: any[] | undefined) => (arr || []).filter(item => item.new === true);
      
      const allPeople = [
        ...(data.people?.organisers || []),
        ...(data.people?.volunteers || []),
        ...(data.people?.guests || [])
      ];
      
      items.push(...filterNew(allPeople));
      items.push(...filterNew(data.events));
      
      return items;
  }, [data]);

  const renderContent = () => {
    switch (activeTab) {
      case CommunitySideTab.Introduction:
        const introMarkdown = data.introduction && typeof data.introduction === 'object'
            ? `# ${(data.introduction as any).title}\n\n${(data.introduction as any).text}`
            : (data.introduction || (data as any).intro || '');
        return (
            <IntroductionTab 
                htmlContent={introMarkdown} 
                manifest={manifest} 
                pageType="community" 
                newItems={newCommunityItems}
                onViewDetails={handleViewDetails}
            />
        );

      case CommunitySideTab.People:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-amber-300 mb-4 border-b-2 border-white/10 pb-2">Our People</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPeople.map(person => (
                <CommunityCard key={person.link} item={person} type="person" manifest={manifest} onViewDetails={handleViewDetails} />
              ))}
            </div>
          </div>
        );

      case CommunitySideTab.Events:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-amber-300 mb-4 border-b-2 border-white/10 pb-2">Upcoming Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEvents.map(event => (
                <CommunityCard key={event.link} item={event} type="event" manifest={manifest} onViewDetails={handleViewDetails} />
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 lg:gap-8 h-full py-8">
      <aside className="w-full md:w-48 lg:w-56 flex-shrink-0">
        <SideNav<CommunitySideTab> tabs={sideTabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      </aside>
      <div className="flex-grow min-w-0 overflow-y-auto overflow-x-hidden">
        <div className="px-4 sm:px-6 lg:px-8 pb-28">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;