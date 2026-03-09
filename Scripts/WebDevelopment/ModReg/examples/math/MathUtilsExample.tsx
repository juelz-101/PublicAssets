
import React, { useState, useMemo } from 'react';
import { clamp, lerp, randomRange, formatCurrency, mapRange, average } from '../../modules/math/math-utils';

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
     <input {...props} className="w-full bg-base-100/50 border border-base-300 rounded p-1 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal" />
);

const OutputBox: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-2 p-4 bg-base-100/50 rounded">
        <p className="text-text-secondary">{title}</p>
        <p className="text-text-primary font-mono text-2xl">{children}</p>
    </div>
);


const MathUtilsExample: React.FC = () => {
    const [clampValue, setClampValue] = useState(50);
    const [clampMin, setClampMin] = useState(0);
    const [clampMax, setClampMax] = useState(100);
    const [lerpStart, setLerpStart] = useState(0);
    const [lerpEnd, setLerpEnd] = useState(100);
    const [lerpAmt, setLerpAmt] = useState(0.5);
    const [randomMin, setRandomMin] = useState(1);
    const [randomMax, setRandomMax] = useState(100);
    const [randomNumber, setRandomNumber] = useState(randomRange(randomMin, randomMax));
    const [currencyValue, setCurrencyValue] = useState(1234.56);
    const [currencyType, setCurrencyType] = useState('USD');
    const [mapValue, setMapValue] = useState(50);
    const [mapInMin, setMapInMin] = useState(0);
    const [mapInMax, setMapInMax] = useState(100);
    const [mapOutMin, setMapOutMin] = useState(0);
    const [mapOutMax, setMapOutMax] = useState(1000);
    const [avgInput, setAvgInput] = useState('10, 20, 30, 40, 50');

    const clampedResult = useMemo(() => clamp(clampValue, clampMin, clampMax), [clampValue, clampMin, clampMax]);
    const lerpResult = useMemo(() => lerp(lerpStart, lerpEnd, lerpAmt), [lerpStart, lerpEnd, lerpAmt]);
    const currencyResult = useMemo(() => {
        const locale = currencyType === 'JPY' ? 'ja-JP' : currencyType === 'EUR' ? 'de-DE' : 'en-US';
        return formatCurrency(currencyValue, locale, currencyType);
    }, [currencyValue, currencyType]);
    const mapRangeResult = useMemo(() => mapRange(mapValue, mapInMin, mapInMax, mapOutMin, mapOutMax), [mapValue, mapInMin, mapInMax, mapOutMin, mapOutMax]);
    const averageResult = useMemo(() => {
        const numbers = avgInput.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
        return average(numbers);
    }, [avgInput]);

    return (
        <div className="space-y-8">
            <FuturisticCard title="clamp(num, min, max)" description="Keeps a number within a specified range.">
                <div>
                    <label className="block text-text-secondary mb-1">Value: {clampValue}</label>
                    <input type="range" min={-50} max={150} value={clampValue} onChange={e => setClampValue(Number(e.target.value))} className="w-full accent-neon-teal" />
                </div>
                <div className="flex space-x-4">
                    <div className="flex-1">
                        <label className="block text-text-secondary mb-1">Min:</label>
                        <FuturisticInput type="number" value={clampMin} onChange={e => setClampMin(Number(e.target.value))} />
                    </div>
                    <div className="flex-1">
                        <label className="block text-text-secondary mb-1">Max:</label>
                        <FuturisticInput type="number" value={clampMax} onChange={e => setClampMax(Number(e.target.value))} />
                    </div>
                </div>
                <OutputBox title="Clamped Output:">{clampedResult}</OutputBox>
            </FuturisticCard>
            
            <FuturisticCard title="average(numbers)" description="Calculates the average of a list of numbers.">
                <div>
                    <label className="block text-text-secondary mb-1">Numbers (comma-separated):</label>
                    <FuturisticInput type="text" value={avgInput} onChange={e => setAvgInput(e.target.value)} />
                </div>
                <OutputBox title="Average:">{averageResult.toFixed(2)}</OutputBox>
            </FuturisticCard>

            <FuturisticCard title="mapRange(...)" description="Maps a number from one range to another.">
                <div>
                    <label className="block text-text-secondary mb-1">Input Value ({mapInMin} to {mapInMax}): {mapValue}</label>
                    <input type="range" min={mapInMin} max={mapInMax} value={mapValue} onChange={e => setMapValue(Number(e.target.value))} className="w-full accent-neon-teal" />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-text-secondary mb-1">Input Min:</label><FuturisticInput type="number" value={mapInMin} onChange={e => setMapInMin(Number(e.target.value))} /></div>
                    <div><label className="block text-text-secondary mb-1">Input Max:</label><FuturisticInput type="number" value={mapInMax} onChange={e => setMapInMax(Number(e.target.value))} /></div>
                    <div><label className="block text-text-secondary mb-1">Output Min:</label><FuturisticInput type="number" value={mapOutMin} onChange={e => setMapOutMin(Number(e.target.value))} /></div>
                    <div><label className="block text-text-secondary mb-1">Output Max:</label><FuturisticInput type="number" value={mapOutMax} onChange={e => setMapOutMax(Number(e.target.value))} /></div>
                </div>
                <OutputBox title={`Mapped Output (from ${mapOutMin} to ${mapOutMax}):`}>{mapRangeResult.toFixed(2)}</OutputBox>
            </FuturisticCard>

            <FuturisticCard title="lerp(start, end, amt)" description="Linearly interpolates between two numbers. Great for animations.">
                <div className="flex space-x-4">
                     <div className="flex-1"><label className="block text-text-secondary mb-1">Start: {lerpStart}</label><input type="range" min={-100} max={100} value={lerpStart} onChange={e => setLerpStart(Number(e.target.value))} className="w-full accent-neon-teal" /></div>
                     <div className="flex-1"><label className="block text-text-secondary mb-1">End: {lerpEnd}</label><input type="range" min={-100} max={100} value={lerpEnd} onChange={e => setLerpEnd(Number(e.target.value))} className="w-full accent-neon-teal" /></div>
                </div>
                <div>
                    <label className="block text-text-secondary mb-1">Amount: {lerpAmt.toFixed(2)}</label>
                    <input type="range" min="0" max="1" step="0.01" value={lerpAmt} onChange={e => setLerpAmt(Number(e.target.value))} className="w-full accent-neon-teal" />
                </div>
                <OutputBox title="Interpolated Output:">{lerpResult.toFixed(2)}</OutputBox>
            </FuturisticCard>

            <FuturisticCard title="randomRange(min, max)" description="Generates a random integer within an inclusive range.">
                <div className="flex space-x-4 items-center">
                     <div className="flex-1"><label className="block text-text-secondary mb-1">Min:</label><FuturisticInput type="number" value={randomMin} onChange={e => setRandomMin(Number(e.target.value))} /></div>
                     <div className="flex-1"><label className="block text-text-secondary mb-1">Max:</label><FuturisticInput type="number" value={randomMax} onChange={e => setRandomMax(Number(e.target.value))} /></div>
                    <button onClick={() => setRandomNumber(randomRange(randomMin, randomMax))} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-400 font-bold py-2 px-4 rounded transition self-end">
                        Generate
                    </button>
                </div>
                <OutputBox title="Random Output:">{randomNumber}</OutputBox>
            </FuturisticCard>

            <FuturisticCard title="formatCurrency(...)" description="Formats a number into a locale-specific currency string.">
                <div className="flex space-x-4 items-center">
                    <div>
                        <label className="block text-text-secondary mb-1">Number:</label>
                        <FuturisticInput type="number" value={currencyValue} onChange={e => setCurrencyValue(Number(e.target.value))} />
                    </div>
                     <div>
                        <label className="block text-text-secondary mb-1">Currency:</label>
                        <select value={currencyType} onChange={e => setCurrencyType(e.target.value)} className="bg-base-100/50 border border-base-300 rounded p-1.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal">
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="JPY">JPY (¥)</option>
                        </select>
                    </div>
                </div>
                <OutputBox title="Formatted Output:">{currencyResult}</OutputBox>
            </FuturisticCard>
        </div>
    );
};

export default MathUtilsExample;
