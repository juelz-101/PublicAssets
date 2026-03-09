import React, { useState, useMemo } from 'react';
import { calculateGoldenRatio } from '../../modules/design/layout-calculator';

// --- Helper Components ---

const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description?: string }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        {description && <p className="text-text-secondary mb-4">{description}</p>}
        <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg space-y-4">
            {children}
        </div>
    </div>
);

const ToolbarSlider: React.FC<{ label: string; value: number; onChange: (value: number) => void; min: number; max: number; step: number }> =
    ({ label, value, onChange, min, max, step }) => (
        <div className="flex flex-col">
            <label className="flex justify-between text-sm text-text-secondary">
                <span>{label}</span>
                <span>{value}px</span>
            </label>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-base-300 accent-neon-pink"
            />
        </div>
    );

const OutputBox: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="p-4 bg-base-100/50 rounded-md border border-base-300/50 text-center">
        <p className="text-text-secondary text-sm uppercase tracking-wider">{title}</p>
        <p className="text-text-primary font-mono text-2xl">{children}</p>
    </div>
);

// --- Main Component ---

const LayoutCalculatorExample: React.FC = () => {
    const [totalSize, setTotalSize] = useState(600);
    const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');

    const goldenSplit = useMemo(() => calculateGoldenRatio(totalSize), [totalSize]);

    const containerStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: orientation === 'horizontal' ? 'row' : 'column',
        width: orientation === 'horizontal' ? `${totalSize}px` : '100%',
        height: orientation === 'vertical' ? `${totalSize}px` : '300px',
        maxWidth: '100%',
        border: '2px dashed var(--color-neon-teal-transparent)',
        transition: 'all 0.3s ease-in-out',
    };
    
    const majorStyle: React.CSSProperties = {
        flexBasis: `${goldenSplit.major}px`,
    };
    
    const minorStyle: React.CSSProperties = {
        flexBasis: `${goldenSplit.minor}px`,
    };

    return (
        <div className="space-y-8">
            <FuturisticCard title="Golden Ratio Layout Calculator" description="A classic design tool to create aesthetically pleasing layouts. The total dimension is split into two sections (major and minor) according to the golden ratio (~1.618).">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <ToolbarSlider label="Total Size" value={totalSize} onChange={setTotalSize} min={200} max={1000} step={10} />
                    </div>
                    <div>
                        <label className="block text-text-secondary mb-2 text-sm">Orientation</label>
                        <div className="flex gap-2">
                             <button onClick={() => setOrientation('horizontal')} className={`flex-grow p-2 rounded transition-colors ${orientation === 'horizontal' ? 'bg-neon-teal/20 text-neon-teal' : 'bg-base-300/50 text-text-secondary'}`}>Horizontal</button>
                             <button onClick={() => setOrientation('vertical')} className={`flex-grow p-2 rounded transition-colors ${orientation === 'vertical' ? 'bg-neon-teal/20 text-neon-teal' : 'bg-base-300/50 text-text-secondary'}`}>Vertical</button>
                        </div>
                    </div>
                </div>
            </FuturisticCard>
            
            <FuturisticCard title="Visualizer & Results">
                <div style={containerStyle} className="bg-base-100/50 mx-auto">
                    <div style={majorStyle} className="bg-neon-teal/20 flex items-center justify-center transition-all duration-300 ease-in-out">
                         <span className="text-neon-teal font-bold">Major</span>
                    </div>
                    <div style={minorStyle} className="bg-neon-pink/20 flex items-center justify-center transition-all duration-300 ease-in-out">
                         <span className="text-neon-pink font-bold">Minor</span>
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <OutputBox title="Major">{goldenSplit.major.toFixed(2)}px</OutputBox>
                    <OutputBox title="Minor">{goldenSplit.minor.toFixed(2)}px</OutputBox>
                </div>
            </FuturisticCard>
        </div>
    );
};

export default LayoutCalculatorExample;
