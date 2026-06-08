import React, { useState, useEffect } from 'react';
import { AboutPageData, AboutSideTab } from '../types';
import { Manifest } from '../services/contentService';
import SideNav from '../components/SideNav';
import WhoWeAreTab from '../components/about/WhoWeAreTab';
import MeetTheTeamTab from '../components/about/MeetTheTeamTab';
import ContactUsTab from '../components/about/ContactUsTab';
import SubmitWorkTab from '../components/about/SubmitWorkTab';
import JoinOurCrewTab from '../components/about/JoinOurCrewTab';

interface AboutPageProps {
    data: AboutPageData;
    manifest: Manifest | null;
}

const sideTabs: AboutSideTab[] = [
  AboutSideTab.WhoWeAre,
  AboutSideTab.MeetTheTeam,
  AboutSideTab.ContactUs,
  AboutSideTab.SubmitYourWork,
  AboutSideTab.JoinOurCrew,
];

const SESSION_STORAGE_KEY = 'zikyinc_about_active_tab';

const AboutPage: React.FC<AboutPageProps> = ({ data, manifest }) => {
    const [activeTab, setActiveTab] = useState<AboutSideTab>(() => {
        const savedTab = sessionStorage.getItem(SESSION_STORAGE_KEY);
        return (savedTab as AboutSideTab) || AboutSideTab.WhoWeAre;
    });

    useEffect(() => {
        sessionStorage.setItem(SESSION_STORAGE_KEY, activeTab);
    }, [activeTab]);

    if (!data) {
        return (
            <div className="p-8 text-center text-amber-400">
                <h2 className="text-2xl font-bold">About page content is not available.</h2>
            </div>
        );
    }
    
    const { about_us, meet_the_team, contact_us, submit_your_work, join_the_team } = data;

    const renderContent = () => {
        switch(activeTab) {
            case AboutSideTab.WhoWeAre:
                return <WhoWeAreTab data={about_us} />;
            case AboutSideTab.MeetTheTeam:
                return <MeetTheTeamTab data={meet_the_team} manifest={manifest} />;
            case AboutSideTab.ContactUs:
                return <ContactUsTab data={contact_us} />;
            case AboutSideTab.SubmitYourWork:
                return <SubmitWorkTab data={submit_your_work} manifest={manifest} />;
            case AboutSideTab.JoinOurCrew:
                return <JoinOurCrewTab data={join_the_team} manifest={manifest} />;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8 h-full py-8">
            <aside className="w-full md:w-48 lg:w-56 flex-shrink-0">
                <SideNav<AboutSideTab> tabs={sideTabs} activeTab={activeTab} setActiveTab={setActiveTab} />
            </aside>
            <div className="flex-grow min-w-0 overflow-y-auto overflow-x-hidden">
                <div className="px-4 sm:px-6 lg:px-8 pb-28">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default AboutPage;