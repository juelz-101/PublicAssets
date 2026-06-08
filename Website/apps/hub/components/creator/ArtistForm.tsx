import React from 'react';
import { ArtistDetail } from '../../types';
import StringArrayInput from './form/StringArrayInput';
import ObjectArrayInput from './form/ObjectArrayInput';
import JsonTextArea from './form/JsonTextArea';
import { FormInput, FormTextArea, FormWrapper } from './form/FormComponents';

interface ArtistFormProps {
    formData: Partial<ArtistDetail>;
    onChange: (formData: Partial<ArtistDetail>) => void;
}

const ArtistForm: React.FC<ArtistFormProps> = ({ formData, onChange }) => {
    const handleChange = (field: keyof ArtistDetail, value: any) => {
        onChange({ ...formData, [field]: value });
    };

    return (
        <FormWrapper title="New Artist Details">
            <FormInput label="Artist Name" value={formData.artist || ''} onChange={e => handleChange('artist', e.target.value)} placeholder="e.g., Emma MT" />
            <FormTextArea label="Biography" value={formData.bio || ''} onChange={e => handleChange('bio', e.target.value)} placeholder="A detailed biography of the artist." />
            <FormInput label="Banner Image Path" value={formData.banner_image || ''} onChange={e => handleChange('banner_image', e.target.value)} placeholder="e.g., Website/images/banners/artist_banner.jpeg" />
            <FormInput label="Release Date (Debut)" value={formData.release_date || ''} onChange={e => handleChange('release_date', e.target.value)} placeholder="e.g., 2023-01-01" />

            <ObjectArrayInput 
                label="Songs by this Artist"
                items={formData.songs || []}
                onChange={items => handleChange('songs', items)}
                fields={[
                    { name: 'title', placeholder: 'Song Title' }, 
                    { name: 'link', placeholder: 'Path to song JSON' },
                    { name: 'thumbnail', placeholder: 'Path to song thumbnail' },
                ]}
                itemTitleKey="title"
            />
            
            <StringArrayInput label="Image Gallery Paths" items={formData.image_gallery || []} onChange={items => handleChange('image_gallery', items)} />
            
            <ObjectArrayInput 
                label="External Links"
                items={formData.links || []}
                onChange={items => handleChange('links', items)}
                fields={[{ name: 'title', placeholder: 'e.g., SoundCloud' }, { name: 'link', placeholder: 'https://...' }]}
                itemTitleKey="title"
            />
            
            <StringArrayInput label="Tags" items={formData.tags || []} onChange={items => handleChange('tags', items)} />

            <JsonTextArea label="Behind the Scenes" value={formData.behind_the_scenes} onChange={obj => handleChange('behind_the_scenes', obj)} placeholder={'{\n  "interview": "Q&A with the artist...",\n  "influences": []\n}'}/>
        </FormWrapper>
    );
};

export default ArtistForm;
