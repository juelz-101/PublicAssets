import React, { useState, useEffect } from 'react';
import { JoinTeamSection, DynamicFormData } from '../../types';
import { Manifest } from '../../services/contentService';
import { fetchFromGitHubRaw } from '../../modules/io/import-utils';
import DynamicForm from './DynamicForm';
import SectionPanel from '../SectionPanel';
import MarkdownRenderer from '../MarkdownRenderer';

const JoinOurCrewTab: React.FC<{ data: JoinTeamSection; manifest: Manifest | null }> = ({ data, manifest }) => {
    const [formData, setFormData] = useState<DynamicFormData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!manifest || !data.openings_link) return;
        
        const fetchFormData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const { user, repo, branch } = manifest.data.git;
                const content = await fetchFromGitHubRaw(user, repo, branch, data.openings_link);
                setFormData(JSON.parse(content));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load form data.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFormData();
    }, [manifest, data.openings_link]);

    if (!data) return null;

    return (
        <div className="space-y-8">
            <SectionPanel id={data.id}>
                 <h2 className="text-3xl font-bold text-amber-400 mb-4">{data.title}</h2>
                 <div className="text-gray-300">
                    <MarkdownRenderer markdown={data.text} />
                 </div>
            </SectionPanel>

            {isLoading && <p className="text-center text-amber-300">Loading form...</p>}
            {error && <p className="text-center text-red-400">Error: {error}</p>}
            {formData && <DynamicForm data={formData} />}
        </div>
    );
};

export default JoinOurCrewTab;