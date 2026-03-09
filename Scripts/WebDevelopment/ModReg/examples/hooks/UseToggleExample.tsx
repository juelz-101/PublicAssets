
import React from 'react';
import { useToggle } from '../../modules/hooks/use-toggle';

const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description: string }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        <p className="text-text-secondary mb-4">{description}</p>
        <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg space-y-4">
            {children}
        </div>
    </div>
);

const FuturisticButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => (
    <button {...props} className={`bg-neon-teal/20 hover:bg-neon-teal/30 text-neon-teal border border-neon-teal font-bold py-2 px-4 rounded transition duration-300 ${className}`}>
        {children}
    </button>
);

const UseToggleExample: React.FC = () => {
    const [isOn, toggleIsOn] = useToggle(false);
    const [showDetails, toggleShowDetails] = useToggle(true);

    return (
        <div className="space-y-8">
            <FuturisticCard
                title="Simple Toggle"
                description="A basic on/off switch using the useToggle hook."
            >
                <div className="flex items-center justify-between p-3 bg-base-100/50 rounded-lg">
                    <p className="font-semibold text-text-primary">
                        Status: <span className={isOn ? 'text-neon-green' : 'text-neon-red'}>{isOn ? 'ON' : 'OFF'}</span>
                    </p>
                    <FuturisticButton onClick={toggleIsOn}>
                        Toggle
                    </FuturisticButton>
                </div>
            </FuturisticCard>
            
            <FuturisticCard
                title="Conditional Rendering"
                description="Use the hook to easily show or hide components."
            >
                <FuturisticButton onClick={toggleShowDetails}>
                    {showDetails ? 'Hide' : 'Show'} Details
                </FuturisticButton>
                {showDetails && (
                    <div className="mt-4 p-4 bg-base-100/50 rounded-md animate-fade-in">
                        <h4 className="font-semibold text-text-primary">Secret Information</h4>
                        <p className="text-text-secondary mt-2">This component is now visible because the toggle state is true. Toggling it again will unmount this component.</p>
                    </div>
                )}
            </FuturisticCard>
        </div>
    );
};

export default UseToggleExample;
