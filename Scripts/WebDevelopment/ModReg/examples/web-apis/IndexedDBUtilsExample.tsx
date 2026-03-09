
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DBManager, StoreSchema } from '../../modules/web-apis/indexed-db-utils';

// Define the shape of our data
interface Note {
  id: string;
  title: string;
  content: string;
  lastModified: number;
}

// Define the database schema
const dbSchema: StoreSchema[] = [
  {
    name: 'notes',
    keyPath: 'id',
    indexes: [
      { name: 'title', keyPath: 'title', options: { unique: false } },
      { name: 'lastModified', keyPath: 'lastModified', options: { unique: false } },
    ],
  },
];

// Create a single instance of the DBManager
const dbManager = new DBManager('NotesDB', 1);

const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description?: string }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        {description && <p className="text-text-secondary mb-4">{description}</p>}
        <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg space-y-4">
            {children}
        </div>
    </div>
);

const FuturisticButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'teal' | 'red' | 'blue' | 'indigo' }> = ({ children, className, variant = 'teal', ...props }) => {
    const colors = {
        teal: 'bg-neon-teal/20 hover:bg-neon-teal/30 text-neon-teal border-neon-teal',
        red: 'bg-neon-red/20 hover:bg-neon-red/30 text-neon-red border-neon-red',
        blue: 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-400',
        indigo: 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border-indigo-400',
    };
    return (
        <button {...props} className={`font-bold py-2 px-4 rounded transition duration-300 border disabled:bg-base-300 disabled:text-text-secondary disabled:border-base-300 disabled:cursor-not-allowed ${colors[variant]} ${className}`}>
            {children}
        </button>
    );
};


const IndexedDBUtilsExample: React.FC = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [currentNote, setCurrentNote] = useState<Partial<Note>>({ id: crypto.randomUUID(), title: '', content: '' });
    const [logs, setLogs] = useState<string[]>(['Initializing...']);
    const [dbStatus, setDbStatus] = useState<'closed' | 'open'>('closed');

    const log = (message: string) => {
        setLogs(prev => [`${new Date().toLocaleTimeString()}: ${message}`, ...prev].slice(0, 10));
    };

    const fetchNotes = useCallback(async () => {
        try {
            const allNotes = await dbManager.getAll<Note>('notes');
            setNotes(allNotes.sort((a, b) => b.lastModified - a.lastModified));
            log('Fetched all notes.');
        } catch (error) {
            log('Error fetching notes.');
            console.error(error);
        }
    }, []);

    const openDB = useCallback(async () => {
        try {
            await dbManager.open(dbSchema);
            setDbStatus('open');
            log('Database opened successfully.');
            await fetchNotes();
        } catch (error) {
            log('Failed to open database.');
            console.error(error);
        }
    }, [fetchNotes]);

    useEffect(() => {
        openDB();
        return () => {
            dbManager.close();
            log('Database connection closed on component unmount.');
        };
    }, [openDB]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCurrentNote(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentNote.title || !currentNote.content) {
            log('Title and content are required.');
            return;
        }

        const noteToSave: Note = {
            id: currentNote.id || crypto.randomUUID(),
            title: currentNote.title,
            content: currentNote.content,
            lastModified: Date.now(),
        };

        try {
            await dbManager.update('notes', noteToSave);
            log(`Note "${noteToSave.title}" saved.`);
            resetForm();
            await fetchNotes();
        } catch (error) {
            log('Error saving note.');
            console.error(error);
        }
    };
    
    const handleDeleteNote = async (id: string) => {
        try {
            await dbManager.delete('notes', id);
            log(`Note with ID ${id.substring(0, 8)}... deleted.`);
            await fetchNotes();
        } catch (error) {
            log('Error deleting note.');
            console.error(error);
        }
    };
    
    const handleClearAll = async () => {
        try {
            await dbManager.clear('notes');
            log('All notes cleared.');
            await fetchNotes();
        } catch (error) {
            log('Error clearing notes.');
            console.error(error);
        }
    };

    const loadNoteForEdit = (note: Note) => {
        setCurrentNote(note);
        log(`Loaded "${note.title}" for editing.`);
    };

    const resetForm = () => {
        setCurrentNote({ id: crypto.randomUUID(), title: '', content: '' });
    };
    
    const isEditing = useMemo(() => notes.some(n => n.id === currentNote.id), [notes, currentNote.id]);

    return (
        <div className="space-y-8">
            <FuturisticCard title="Database Status & Logs" description="Manage your database connection and see a log of recent operations.">
                <p>Status: <span className={`font-bold ${dbStatus === 'open' ? 'text-neon-green' : 'text-neon-red'}`}>{dbStatus.toUpperCase()}</span></p>
                <div className="bg-base-100/50 rounded p-3 h-32 overflow-y-auto flex flex-col-reverse mt-2">
                    <pre className="text-sm text-text-secondary whitespace-pre-wrap font-mono">{logs.join('\n')}</pre>
                </div>
            </FuturisticCard>
            
            <FuturisticCard title={isEditing ? 'Edit Note' : 'Add Note'}>
                <form onSubmit={handleSaveNote} className="space-y-4">
                    <input type="hidden" name="id" value={currentNote.id} />
                    <div>
                        <label className="block text-text-secondary mb-1">Title:</label>
                        <input name="title" value={currentNote.title} onChange={handleInputChange} className="w-full bg-base-100/50 p-2 rounded border border-base-300 focus:outline-none focus:ring-2 focus:ring-neon-teal"/>
                    </div>
                    <div>
                        <label className="block text-text-secondary mb-1">Content:</label>
                        <textarea name="content" value={currentNote.content} onChange={handleInputChange} rows={4} className="w-full bg-base-100/50 p-2 rounded border border-base-300 focus:outline-none focus:ring-2 focus:ring-neon-teal"/>
                    </div>
                    <div className="flex gap-2">
                        <FuturisticButton type="submit" variant="blue">{isEditing ? 'Update Note' : 'Add Note'}</FuturisticButton>
                        <FuturisticButton type="button" onClick={resetForm}>New Note</FuturisticButton>
                    </div>
                </form>
            </FuturisticCard>
            
            <FuturisticCard title="Stored Notes">
                <div className="flex justify-end mb-4">
                    <FuturisticButton onClick={handleClearAll} variant="red" disabled={notes.length === 0}>Clear All Notes</FuturisticButton>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {notes.length === 0 ? (
                        <p className="text-text-secondary italic text-center">No notes found.</p>
                    ) : (
                        notes.map(note => (
                            <div key={note.id} className="bg-base-100/50 p-3 rounded-lg flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-text-primary">{note.title}</h4>
                                    <p className="text-text-secondary text-sm">{note.content.substring(0, 50)}...</p>
                                    <p className="text-xs text-text-secondary/70 mt-1">Last Modified: {new Date(note.lastModified).toLocaleString()}</p>
                                </div>
                                <div className="flex gap-2 flex-shrink-0 ml-4">
                                    <FuturisticButton onClick={() => loadNoteForEdit(note)} variant="indigo" className="py-1 px-2 text-sm">Edit</FuturisticButton>
                                    <FuturisticButton onClick={() => handleDeleteNote(note.id)} variant="red" className="py-1 px-2 text-sm">Delete</FuturisticButton>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </FuturisticCard>
        </div>
    );
};

export default IndexedDBUtilsExample;
