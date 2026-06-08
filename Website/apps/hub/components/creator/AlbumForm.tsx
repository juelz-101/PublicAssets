import React from 'react';
import { AlbumDetail } from '../../types';
import StringArrayInput from './form/StringArrayInput';
import ObjectArrayInput from './form/ObjectArrayInput';
import JsonTextArea from './form/JsonTextArea';
import { FormInput, FormTextArea, FormWrapper } from './form/FormComponents';

interface AlbumFormProps {
    formData: Partial<AlbumDetail>;
    onChange: (formData: Partial<AlbumDetail>) => void;
}

const AlbumForm: React.FC<AlbumFormProps> = ({ formData, onChange }) => {
    const handleChange = (field: keyof AlbumDetail, value: any) => {
        onChange({ ...formData, [field]: value });
    };

    return (
        <FormWrapper title="New Album Details">
            <FormInput label="Title" value={formData.title || ''} onChange={e => handleChange('title', e.target.value)} placeholder="e.g., Brutalistening" />
            <StringArrayInput label="Artists" items={formData.artists || []} onChange={items => handleChange('artists', items)} placeholder="e.g., Emma MT"/>
            <FormTextArea label="Description" value={formData.description || ''} onChange={e => handleChange('description', e.target.value)} placeholder="A detailed description of the album." />
            <FormInput label="Banner Image Path" value={formData.banner || ''} onChange={e => handleChange('banner', e.target.value)} placeholder="e.g., Website/images/banners/album_banner.jpeg" />
            <FormInput label="Release Date" value={formData.release_date || ''} onChange={e => handleChange('release_date', e.target.value)} placeholder="e.g., 2024-09-01" />

            <StringArrayInput label="Image Gallery Paths" items={formData.image_gallery || []} onChange={items => handleChange('image_gallery', items)} />
            
            <ObjectArrayInput 
                label="External Links"
                items={formData.links || []}
                onChange={items => handleChange('links', items)}
                fields={[{ name: 'title', placeholder: 'e.g., Bandcamp' }, { name: 'link', placeholder: 'https://...' }]}
                itemTitleKey="title"
            />
            
            <StringArrayInput label="Tags" items={formData.tags || []} onChange={items => handleChange('tags', items)} />

            <JsonTextArea label="Behind the Scenes" value={formData.behind_the_scenes} onChange={obj => handleChange('behind_the_scenes', obj)} placeholder={'{\n  "concept": "The core idea of the album...",\n  "recording_process": "Notes about how it was made."\n}'}/>
        </FormWrapper>
    );
};

export default AlbumForm;
