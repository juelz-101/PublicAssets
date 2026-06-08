import React, { useState, useMemo } from 'react';
import DataTypeSelector from '../creator/DataTypeSelector';
import JsonPreview from '../creator/JsonPreview';
import SongForm from '../creator/SongForm';
import AlbumForm from '../creator/AlbumForm';
import ArtistForm from '../creator/ArtistForm';
import { SongDetail, AlbumDetail, ArtistDetail } from '../../types';

export type DataType = 'song' | 'album' | 'artist';

const CreatorTab: React.FC = () => {
    const [dataType, setDataType] = useState<DataType | null>('song');
    const [formData, setFormData] = useState<Partial<SongDetail | AlbumDetail | ArtistDetail>>({});

    const handleDataTypeChange = (type: DataType) => {
        setDataType(type);
        setFormData({});
    };

    const handleFormChange = (newFormData: any) => {
        setFormData(newFormData);
    };

    const renderForm = () => {
        if (!dataType) {
            return (
                <div className="flex items-center justify-center h-full text-gray-400">
                    <p>Select a data type to begin.</p>
                </div>
            );
        }

        switch (dataType) {
            case 'song':
                return <SongForm formData={formData as Partial<SongDetail>} onChange={handleFormChange} />;
            case 'album':
                return <AlbumForm formData={formData as Partial<AlbumDetail>} onChange={handleFormChange} />;
            case 'artist':
                return <ArtistForm formData={formData as Partial<ArtistDetail>} onChange={handleFormChange} />;
            default:
                return null;
        }
    };

    const formattedJson = useMemo(() => {
        try {
            return JSON.stringify(formData, null, 2);
        } catch (error) {
            return 'Error generating JSON...';
        }
    }, [formData]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-amber-400">Content Creator</h1>
                <p className="mt-1 text-gray-300 text-sm">
                    Use this tool to generate the JSON structure for new items. Fill out the form below and the result will appear on the right.
                </p>
            </div>
            
            <div className="bg-gray-900/50 p-4 rounded-xl ring-1 ring-white/10">
                 <DataTypeSelector selectedType={dataType} onTypeChange={handleDataTypeChange} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-900/50 rounded-xl ring-1 ring-white/10 p-6 overflow-y-auto max-h-[calc(100vh-20rem)]">
                    {renderForm()}
                </div>
                <div className="sticky top-24 self-start">
                     <JsonPreview jsonString={formattedJson} />
                </div>
            </div>
        </div>
    );
};

export default CreatorTab;
