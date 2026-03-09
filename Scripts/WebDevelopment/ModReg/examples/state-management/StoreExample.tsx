
import React, { useState, useEffect, useMemo } from 'react';
import { createStore, Store } from '../../modules/state-management/store';

// 1. Define the shape of our state
interface AppState {
    count: number;
    user: {
        name: string;
        age: number;
    };
}

// 2. Create a store instance with initial state
const appStore = createStore<AppState>({
    count: 0,
    user: {
        name: 'Alex Rider',
        age: 25,
    },
});

// 3. Create a custom hook for easy integration with React
const useStore = <T, >(store: Store<T>) => {
    const [state, setState] = useState(store.getState());

    useEffect(() => {
        const unsubscribe = store.subscribe(setState);
        // On component unmount, unsubscribe to prevent memory leaks
        return () => unsubscribe();
    }, [store]);

    return state;
};

const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description?: string }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        {description && <p className="text-text-secondary mb-4">{description}</p>}
        <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg space-y-4">
            {children}
        </div>
    </div>
);

const FuturisticButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'teal' | 'red' }> = ({ children, className, variant = 'teal', ...props }) => {
    const colors = {
        teal: 'bg-neon-teal/20 hover:bg-neon-teal/30 text-neon-teal border-neon-teal',
        red: 'bg-neon-red/20 hover:bg-neon-red/30 text-neon-red border-neon-red',
    };
    return (
    <button {...props} className={`${colors[variant]} font-bold py-2 px-4 rounded transition duration-300 ${className}`}>
        {children}
    </button>
)};

// Component to display and control the counter
const CounterComponent: React.FC = () => {
    const { count } = useStore(appStore);

    const increment = () => appStore.setState(prev => ({ count: prev.count + 1 }));
    const decrement = () => appStore.setState(prev => ({ count: prev.count - 1 }));

    return (
        <FuturisticCard title="Counter">
            <p className="text-5xl text-center font-bold text-text-primary">{count}</p>
            <div className="flex justify-center space-x-2 mt-4">
                <FuturisticButton onClick={increment}>Increment</FuturisticButton>
                <FuturisticButton onClick={decrement}>Decrement</FuturisticButton>
            </div>
        </FuturisticCard>
    );
};

// Component to display and edit user profile
const UserProfileComponent: React.FC = () => {
    const { user } = useStore(appStore);
    const [localUser, setLocalUser] = useState(user);

    // Update local state if store changes from elsewhere
    useEffect(() => {
        setLocalUser(user);
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalUser(prev => ({ ...prev, [name]: name === 'age' ? Number(value) : value }));
    };

    const handleSave = () => {
        appStore.setState({ user: localUser });
    };

    return (
         <FuturisticCard title="User Profile">
            <div className="space-y-2">
                <div>
                    <label className="text-text-secondary">Name:</label>
                    <input name="name" value={localUser.name} onChange={handleChange} className="w-full bg-base-100/50 p-2 rounded border border-base-300 font-mono focus:outline-none focus:ring-2 focus:ring-neon-teal"/>
                </div>
                 <div>
                    <label className="text-text-secondary">Age:</label>
                    <input name="age" type="number" value={localUser.age} onChange={handleChange} className="w-full bg-base-100/50 p-2 rounded border border-base-300 font-mono focus:outline-none focus:ring-2 focus:ring-neon-teal"/>
                </div>
            </div>
            <div className="flex justify-end mt-4">
                <FuturisticButton onClick={handleSave}>Save Changes</FuturisticButton>
            </div>
        </FuturisticCard>
    );
};

// Component to display the raw state
const RawStateViewer: React.FC = () => {
    const state = useStore(appStore);
    return (
        <FuturisticCard title="Current Store State">
             <div className="flex justify-end mb-4">
                <FuturisticButton onClick={() => appStore.reset()} variant="red">Reset Store</FuturisticButton>
            </div>
            <pre className="text-text-primary font-mono whitespace-pre-wrap bg-base-100/50 p-2 rounded">
                {JSON.stringify(state, null, 2)}
            </pre>
        </FuturisticCard>
    )
}

const StoreExample: React.FC = () => {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <CounterComponent />
                <UserProfileComponent />
            </div>
            <RawStateViewer />
        </div>
    );
};

export default StoreExample;
