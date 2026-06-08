import React from 'react';
import { SongDetail } from '../../types';
import StringArrayInput from './form/StringArrayInput';
import ObjectArrayInput from './form/ObjectArrayInput';
import JsonTextArea from './form/JsonTextArea';
import { FormInput, FormTextArea, FormWrapper } from './form/FormComponents';

interface SongFormProps {
    formData: Partial<SongDetail>;
    onChange: (formData: Partial<SongDetail>) => void;
}

const SongForm: React.FC<SongFormProps> = ({ formData, onChange }) => {
    const handleChange = (field: keyof SongDetail, value: any) => {
        onChange({ ...formData, [field]: value });
    };

    return (
        <FormWrapper title="New Song Details">
            <FormInput label="Title" value={formData.title || ''} onChange={e => handleChange('title', e.target.value)} placeholder="e.g., Dancing in the Sunlight" />
            <FormInput label="Artist" value={formData.artist || ''} onChange={e => handleChange('artist', e.target.value)} placeholder="e.g., Juelz-101 ft Emma MT" />
            <FormTextArea label="Description" value={formData.description || ''} onChange={e => handleChange('description', e.target.value)} placeholder="A brief description of the song." />
            <FormInput label="Thumbnail Path" value={formData.thumbnail || ''} onChange={e => handleChange('thumbnail', e.target.value)} placeholder="e.g., Website/images/Covers/AlbumArt/song.jpeg" />
            <FormInput label="Release Date" value={formData.release_date || ''} onChange={e => handleChange('release_date', e.target.value)} placeholder="e.g., 2024-08-15" />

            <StringArrayInput label="Genres" items={formData.genres || []} onChange={items => handleChange('genres', items)} />
            
            <ObjectArrayInput 
                label="Artist Links"
                items={formData.artist_links || []}
                onChange={items => handleChange('artist_links', items)}
                fields={[{ name: 'name', placeholder: 'Artist Name' }, { name: 'link', placeholder: 'Path to artist JSON' }]}
                itemTitleKey="name"
            />
            
            <ObjectArrayInput 
                label="Album Appearances"
                items={formData.albums || []}
                onChange={items => handleChange('albums', items)}
                fields={[
                    { name: 'name', placeholder: 'Album Name' }, 
                    { name: 'link', placeholder: 'Path to album JSON' },
                    { name: 'track', placeholder: 'Track #', type: 'number' },
                    { name: 'cd', placeholder: 'CD #', type: 'number' }
                ]}
                itemTitleKey="name"
            />

            <h3 className="text-lg font-semibold text-amber-300 mt-4 pt-4 border-t border-white/10">Audio Embeds</h3>
            <FormInput label="SoundCloud Embed URL" value={formData.audio?.soundcloud_embed || ''} onChange={e => handleChange('audio', { ...formData.audio, soundcloud_embed: e.target.value })} />
            <FormInput label="YouTube Embed URL" value={formData.audio?.youtube_embed || ''} onChange={e => handleChange('audio', { ...formData.audio, youtube_embed: e.target.value })} />

            <JsonTextArea label="Lyrics" value={formData.lyrics} onChange={obj => handleChange('lyrics', obj)} placeholder={'{\n  "verse_1": "Lyrics here...",\n  "chorus": "More lyrics..."\n}'}/>
            
            <StringArrayInput label="Image Gallery Paths" items={formData.image_gallery || []} onChange={items => handleChange('image_gallery', items)} />
            
            <ObjectArrayInput 
                label="External Links"
                items={formData.links || []}
                onChange={items => handleChange('links', items)}
                fields={[{ name: 'title', placeholder: 'e.g., Spotify' }, { name: 'link', placeholder: 'https://...' }]}
                itemTitleKey="title"
            />
            
            <StringArrayInput label="Tags" items={formData.tags || []} onChange={items => handleChange('tags', items)} />
            
            <JsonTextArea label="Behind the Scenes" value={formData.behind_the_scenes} onChange={obj => handleChange('behind_the_scenes', obj)} placeholder={'{\n  "inspiration": "The story behind the song...",\n  "production_notes": []\n}'}/>
        </FormWrapper>
    );
};

export default SongForm;
