
import React, { useState, useMemo } from 'react';
import { chunk, unique, groupBy, flatten, shuffle, compact } from '../../modules/utilities/array-utils';

const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description: string }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        <p className="text-text-secondary mb-4">{description}</p>
        <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg">
            {children}
        </div>
    </div>
);

const FuturisticButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => (
    <button {...props} className={`bg-neon-teal/20 hover:bg-neon-teal/30 text-neon-teal border border-neon-teal font-bold py-2 px-4 rounded transition duration-300 ${className}`}>
        {children}
    </button>
);

const FuturisticInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal focus:border-neon-teal transition-all" />
);

const OutputBox: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-4 p-4 bg-base-100/50 rounded-md border border-base-300/50">
        <p className="text-text-secondary">{title}</p>
        <pre className="text-text-primary font-mono whitespace-pre-wrap">{children}</pre>
    </div>
);

const sampleDataForGrouping = [
    { name: 'apple', type: 'fruit' },
    { name: 'carrot', type: 'vegetable' },
    { name: 'banana', type: 'fruit' },
    { name: 'broccoli', type: 'vegetable' },
];

const ArrayUtilsExample: React.FC = () => {
  const [chunkInput, setChunkInput] = useState('1, 2, 3, 4, 5, 6, 7, 8, 9');
  const [chunkSize, setChunkSize] = useState(3);
  const [uniqueInput, setUniqueInput] = useState('apple, banana, orange, apple, grape, banana');
  const [flattenInput, setFlattenInput] = useState('[[1, 2], [3, 4, 5], [6]]');
  const [shuffleInput, setShuffleInput] = useState('A, B, C, D, E, F');
  const [shuffledArray, setShuffledArray] = useState<string[]>([]);
  const [compactInput, setCompactInput] = useState('1, 0, false, "hello", "", null, undefined, NaN, 42');

  const parsedChunkArray = useMemo(() => chunkInput.split(',').map(s => s.trim()).filter(Boolean), [chunkInput]);
  const parsedUniqueArray = useMemo(() => uniqueInput.split(',').map(s => s.trim()).filter(Boolean), [uniqueInput]);
  const parsedFlattenArray = useMemo(() => {
    try {
        return JSON.parse(flattenInput);
    } catch {
        return [];
    }
  }, [flattenInput]);
  
  const parsedShuffleArray = useMemo(() => shuffleInput.split(',').map(s => s.trim()).filter(Boolean), [shuffleInput]);
  const parsedCompactArray = useMemo(() => {
      // Don't actually parse here, let the function handle it.
      // For display we'll use a hardcoded representation.
      const values = [1, 0, false, "hello", "", null, undefined, NaN, 42];
      return compact(values);
  }, [compactInput])

  return (
    <div className="space-y-8">
      <FuturisticCard title="chunk(arr, size)" description="Splits an array into chunks of a specified size.">
          <label className="text-text-secondary block mb-1">Array (comma-separated):</label>
          <FuturisticInput
            type="text"
            value={chunkInput}
            onChange={(e) => setChunkInput(e.target.value)}
          />
          <div className="mt-2">
            <label className="text-text-secondary block mb-1">Chunk Size: {chunkSize}</label>
            <input
              type="range"
              min="1"
              max="10"
              value={chunkSize}
              onChange={(e) => setChunkSize(Number(e.target.value))}
              className="w-full accent-neon-teal"
            />
          </div>
          <OutputBox title="Output:">{JSON.stringify(chunk(parsedChunkArray, chunkSize), null, 2)}</OutputBox>
      </FuturisticCard>
      
      <FuturisticCard title="unique(arr)" description="Removes duplicate values from an array.">
            <label className="text-text-secondary block mb-1">Array (comma-separated):</label>
            <FuturisticInput
                type="text"
                value={uniqueInput}
                onChange={(e) => setUniqueInput(e.target.value)}
            />
            <OutputBox title="Output:">{JSON.stringify(unique(parsedUniqueArray), null, 2)}</OutputBox>
      </FuturisticCard>

      <FuturisticCard title="groupBy(arr, key)" description="Groups elements of an array of objects by a specified key.">
            <label className="text-text-secondary block mb-1">Input Array:</label>
            <pre className="text-gray-300 font-mono text-sm bg-base-100/50 p-2 rounded">{JSON.stringify(sampleDataForGrouping, null, 2)}</pre>
            <OutputBox title="Grouped by 'type':">{JSON.stringify(groupBy(sampleDataForGrouping, 'type'), null, 2)}</OutputBox>
      </FuturisticCard>

       <FuturisticCard title="flatten(arr)" description="Flattens a nested array into a single-level array.">
            <label className="text-text-secondary block mb-1">Nested Array (as JSON):</label>
            <FuturisticInput
                type="text"
                value={flattenInput}
                onChange={(e) => setFlattenInput(e.target.value)}
            />
            <OutputBox title="Output:">{JSON.stringify(flatten(parsedFlattenArray), null, 2)}</OutputBox>
      </FuturisticCard>

      <FuturisticCard title="shuffle(arr)" description="Randomly shuffles the elements of an array.">
          <label className="text-text-secondary block mb-1">Array (comma-separated):</label>
          <FuturisticInput
            type="text"
            value={shuffleInput}
            onChange={(e) => {
                setShuffleInput(e.target.value);
                setShuffledArray([]);
            }}
          />
          <div className="mt-4">
            <FuturisticButton onClick={() => setShuffledArray(shuffle(parsedShuffleArray))}>Shuffle It</FuturisticButton>
          </div>
          {shuffledArray.length > 0 && <OutputBox title="Shuffled Output:">{JSON.stringify(shuffledArray, null, 2)}</OutputBox>}
      </FuturisticCard>

      <FuturisticCard title="compact(arr)" description="Removes all falsy values (false, null, 0, '', undefined, NaN) from an array.">
            <label className="text-text-secondary block mb-1">Input Array:</label>
             <pre className="text-gray-300 font-mono text-sm bg-base-100/50 p-2 rounded">{compactInput}</pre>
            <OutputBox title="Compacted Output:">{JSON.stringify(parsedCompactArray, null, 2)}</OutputBox>
      </FuturisticCard>
    </div>
  );
};

export default ArrayUtilsExample;
