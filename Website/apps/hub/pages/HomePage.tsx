import React from 'react';
import { HomePageData } from '../types';
import { Manifest } from '../services/contentService';
import GitHubImage from '../components/GitHubImage';
import SectionPanel from '../components/SectionPanel';
import MarkdownRenderer from '../components/MarkdownRenderer';

interface HomePageProps {
  data: HomePageData;
  manifest: Manifest | null;
}

const HomePage: React.FC<HomePageProps> = ({ data, manifest }) => {
  if (!data) {
    return (
      <div className="p-8 text-center text-amber-400">
        <h2 className="text-2xl font-bold">Home page content is not available.</h2>
      </div>
    );
  }

  const { welcome: hero, about, featured, cta } = data;

  return (
    <div className="h-full overflow-y-auto py-8">
      <div className="space-y-12 sm:space-y-16 lg:space-y-24 pb-20">
        {/* Hero Section */}
        {hero && (
          <SectionPanel className="text-center glow-on-hover glow-dark-primary">
            <h2 className="text-4xl sm:text-6xl font-extrabold text-amber-400 mb-4 tracking-tight">{hero.title}</h2>
            <div className="max-w-4xl mx-auto my-6">
              <GitHubImage 
                manifest={manifest}
                path={hero.image}
                alt="ZIKYinc Header"
                className="rounded-lg shadow-lg w-full object-cover"
              />
            </div>
            <div className="max-w-3xl mx-auto text-gray-200">
              <h3 className="text-2xl font-bold text-amber-300 mb-3">{hero.subtitle}</h3>
              <div className="text-lg leading-relaxed text-gray-300">
                <MarkdownRenderer markdown={hero.text} />
              </div>
            </div>
          </SectionPanel>
        )}

        {/* About Overview Section */}
        {about?.whatWeDo && (
          <SectionPanel className="glow-on-hover glow-dark-primary">
            <div className="max-w-3xl mx-auto text-center">
                <h3 className="text-3xl font-bold text-amber-400 mb-6 border-b-2 border-white/10 pb-3">{about.whatWeDo.title}</h3>
                <div className="flex justify-center flex-wrap items-center gap-6 mb-6">
                  {about.whatWeDo.logos.map((logo, index) => (
                      <GitHubImage
                        key={index}
                        manifest={manifest}
                        path={logo}
                        alt={`ZIKYinc Logo ${index + 1}`}
                        className="h-24 w-24 object-contain"
                      />
                  ))}
                </div>
                <ul className="list-disc list-inside space-y-3 text-gray-200 text-lg text-left max-w-md mx-auto">
                  {about.whatWeDo.services.map((service, index) => <li key={index}><MarkdownRenderer markdown={service} inline /></li>)}
                </ul>
            </div>
          </SectionPanel>
        )}
        
        {/* Featured Content Section */}
        {featured && (
          <SectionPanel className="glow-on-hover glow-dark-primary">
            <h3 className="text-4xl text-center font-bold text-amber-400 mb-8">{featured.title}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {featured.images.map((img, index) => (
                <div key={index} className="rounded-lg overflow-hidden shadow-lg group glow-on-hover glow-primary">
                    <GitHubImage
                    manifest={manifest}
                    path={img}
                    alt={`Featured collaboration ${index + 1}`}
                    className="w-full object-cover aspect-square transition-transform duration-300 group-hover:scale-110"
                    placeholderCat="music"
                    placeholderType="songs"
                    />
                </div>
              ))}
            </div>
          </SectionPanel>
        )}

        {/* Call to Action Section */}
        {cta && (
          <SectionPanel className="text-center glow-on-hover glow-dark-primary">
            <h3 className="text-4xl font-bold text-amber-400 mb-3">{cta.title}</h3>
            <div className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              <MarkdownRenderer markdown={cta.text} />
            </div>
            <div className="flex justify-center space-x-4">
              {cta.buttons.map((button, index) => (
                <button key={index} className="px-8 py-3 text-lg font-semibold text-gray-900 bg-amber-400 rounded-lg hover:bg-amber-500 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 shadow-lg hover:shadow-xl hover:scale-105">
                  {button.text}
                </button>
              ))}
            </div>
          </SectionPanel>
        )}
      </div>
    </div>
  );
};

export default HomePage;