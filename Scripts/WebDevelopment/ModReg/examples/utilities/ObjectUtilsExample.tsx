
import React, { useState, useMemo } from 'react';
import { get, pick, omit, isEqual, cloneDeep } from '../../modules/utilities/object-utils';

const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description: string }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        <p className="text-text-secondary mb-4">{description}</p>
        <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg space-y-4">
            {children}
        </div>
    </div>
);

const FuturisticInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal focus:border-neon-teal transition-all" />
);

const FuturisticTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
    <textarea {...props} className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal focus:border-neon-teal transition-all font-mono" />
);

const OutputBox: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-2 p-4 bg-base-100/50 rounded-md border border-base-300/50">
        <p className="text-text-secondary">{title}</p>
        <pre className="text-text-primary font-mono whitespace-pre-wrap">{children}</pre>
    </div>
);

const sampleObject = {
    user: {
        id: 1,
        name: 'John Doe',
        address: {
            street: '123 Main St',
            city: 'Anytown',
        },
        roles: ['admin', 'editor'],
    },
    posts: [
        { id: 101, title: 'First Post' },
    ],
    metadata: {
        isActive: true,
    }
};

const ObjectUtilsExample: React.FC = () => {
    // State for get()
    const [getObject, setGetObject] = useState(JSON.stringify(sampleObject, null, 2));
    const [getPath, setGetPath] = useState('posts[0].title');
    const [getDefaultValue, setGetDefaultValue] = useState('Not Found');

    // State for pick()/omit()
    const [pickOmitObject, setPickOmitObject] = useState(JSON.stringify(sampleObject.user, null, 2));
    const [pickOmitKeys, setPickOmitKeys] = useState('id, name');

    // State for isEqual()
    const [isEqualObj1, setIsEqualObj1] = useState(JSON.stringify({ a: 1, b: [2, 3] }));
    const [isEqualObj2, setIsEqualObj2] = useState(JSON.stringify({ a: 1, b: [2, 3] }));

    // State for cloneDeep()
    const [cloneObject, setCloneObject] = useState(JSON.stringify(sampleObject, null, 2));

    const parsedGetObject = useMemo(() => {
        try { return JSON.parse(getObject); } catch { return { error: 'Invalid JSON' }; }
    }, [getObject]);
    
    const getResult = useMemo(() => {
        try {
            return JSON.stringify(get(parsedGetObject, getPath, getDefaultValue), null, 2);
        } catch { return 'Error executing get()'; }
    }, [parsedGetObject, getPath, getDefaultValue]);

    const parsedPickOmitObject = useMemo(() => {
        try { return JSON.parse(pickOmitObject); } catch { return { error: 'Invalid JSON' }; }
    }, [pickOmitObject]);

    const keysArray = useMemo(() => pickOmitKeys.split(',').map(k => k.trim()), [pickOmitKeys]);
    
    const pickResult = useMemo(() => JSON.stringify(pick(parsedPickOmitObject, keysArray), null, 2), [parsedPickOmitObject, keysArray]);
    const omitResult = useMemo(() => JSON.stringify(omit(parsedPickOmitObject, keysArray), null, 2), [parsedPickOmitObject, keysArray]);
    
    const isEqualResult = useMemo(() => {
        try {
            const obj1 = JSON.parse(isEqualObj1);
            const obj2 = JSON.parse(isEqualObj2);
            return isEqual(obj1, obj2).toString();
        } catch { return 'Invalid JSON in one of the inputs'; }
    }, [isEqualObj1, isEqualObj2]);

    const cloneResult = useMemo(() => {
        try {
            const obj = JSON.parse(cloneObject);
            const cloned = cloneDeep(obj);
            // Quick check to show it's a new object
            const isSameReference = obj === cloned;
            return `Is same reference: ${isSameReference}\n\nCloned Object:\n${JSON.stringify(cloned, null, 2)}`;
        } catch { return 'Invalid JSON input'; }
    }, [cloneObject]);


    return (
        <div className="space-y-8">
            <FuturisticCard title="get(obj, path, defaultValue)" description="Safely retrieves nested properties from an object using a dot-notation path.">
                <div>
                    <label className="text-text-secondary block mb-1">Object (JSON):</label>
                    <FuturisticTextarea value={getObject} onChange={e => setGetObject(e.target.value)} rows={8} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="text-text-secondary block mb-1">Path:</label>
                        <FuturisticInput value={getPath} onChange={e => setGetPath(e.target.value)} placeholder="e.g., user.address.city or posts[0].title" />
                    </div>
                     <div>
                        <label className="text-text-secondary block mb-1">Default Value:</label>
                        <FuturisticInput value={getDefaultValue} onChange={e => setGetDefaultValue(e.target.value)} />
                    </div>
                </div>
                <OutputBox title="Result:">{getResult}</OutputBox>
            </FuturisticCard>
            
            <FuturisticCard title="pick(obj, keys) / omit(obj, keys)" description="Creates new objects by either including or excluding specific keys.">
                 <div>
                    <label className="text-text-secondary block mb-1">Object (JSON):</label>
                    <FuturisticTextarea value={pickOmitObject} onChange={e => setPickOmitObject(e.target.value)} rows={5} />
                </div>
                <div>
                    <label className="text-text-secondary block mb-1">Keys (comma-separated):</label>
                    <FuturisticInput value={pickOmitKeys} onChange={e => setPickOmitKeys(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <OutputBox title="pick() Result:">{pickResult}</OutputBox>
                     <OutputBox title="omit() Result:">{omitResult}</OutputBox>
                </div>
            </FuturisticCard>
            
            <FuturisticCard title="isEqual(obj1, obj2)" description="Performs a deep comparison of two objects to see if they are structurally identical.">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-text-secondary block mb-1">Object 1 (JSON):</label>
                        <FuturisticTextarea value={isEqualObj1} onChange={e => setIsEqualObj1(e.target.value)} rows={4} />
                    </div>
                     <div>
                        <label className="text-text-secondary block mb-1">Object 2 (JSON):</label>
                        <FuturisticTextarea value={isEqualObj2} onChange={e => setIsEqualObj2(e.target.value)} rows={4} />
                    </div>
                </div>
                <OutputBox title="Result:">{isEqualResult}</OutputBox>
            </FuturisticCard>

            <FuturisticCard title="cloneDeep(obj)" description="Creates a deep copy of an object, ensuring no shared references.">
                <div>
                    <label className="text-text-secondary block mb-1">Object (JSON):</label>
                    <FuturisticTextarea value={cloneObject} onChange={e => setCloneObject(e.target.value)} rows={8} />
                </div>
                <OutputBox title="Result:">{cloneResult}</OutputBox>
            </FuturisticCard>
        </div>
    );
};

export default ObjectUtilsExample;
