
import React, { useState } from 'react';
import { capitalize, truncate, camelCase, pascalCase, snakeCase, kebabCase } from '../../modules/utilities/string-utils';

const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description: string }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        <p className="text-text-secondary mb-4">{description}</p>
        <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg">
            {children}
        </div>
    </div>
);

// Fix: Redefined props to create a proper discriminated union. This ensures TypeScript
// can correctly infer whether the props are for an <input> or <textarea> based on the `type` property,
// which resolves the ambiguity and type errors.
type FuturisticInputProps =
  | (React.TextareaHTMLAttributes<HTMLTextAreaElement> & { type: 'textarea' })
  | (React.InputHTMLAttributes<HTMLInputElement> & { type: 'text' });

const FuturisticInput: React.FC<FuturisticInputProps> = (props) => {
    const commonClasses = "w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal focus:border-neon-teal transition-all";
    if (props.type === 'textarea') {
        const { type, ...rest } = props; // `type` is not a valid prop for <textarea>, so we remove it.
        return <textarea {...rest} className={commonClasses} />;
    }
    return <input {...props} className={commonClasses} />;
};

const OutputBox: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-4 p-4 bg-base-100/50 rounded-md border border-base-300/50">
        <p className="text-text-secondary">{title}</p>
        <p className="text-text-primary font-mono">{children}</p>
    </div>
);


const StringUtilsExample: React.FC = () => {
  const [capitalizeInput, setCapitalizeInput] = useState('hello world');
  const [truncateInput, setTruncateInput] = useState('This is a very long string that needs to be truncated.');
  const [truncateLength, setTruncateLength] = useState(20);
  const [caseInput, setCaseInput] = useState('hello-world_from-react');

  return (
    <div className="space-y-8">
      <FuturisticCard title="capitalize(str)" description="Capitalizes the first letter of a string.">
        <FuturisticInput
          type="text"
          value={capitalizeInput}
          onChange={(e) => setCapitalizeInput(e.target.value)}
        />
        <OutputBox title="Output:">{capitalize(capitalizeInput)}</OutputBox>
      </FuturisticCard>
      
      <FuturisticCard title="truncate(str, length)" description="Truncates a string to a specified length.">
        <FuturisticInput
          type="textarea"
          value={truncateInput}
          onChange={(e) => setTruncateInput(e.target.value)}
          rows={3}
        />
        <div className="mt-2">
          <label className="text-text-secondary block mb-1">Length: {truncateLength}</label>
          <input
            type="range"
            min="1"
            max="100"
            value={truncateLength}
            onChange={(e) => setTruncateLength(Number(e.target.value))}
            className="w-full accent-neon-teal"
          />
        </div>
        <OutputBox title="Output:">{truncate(truncateInput, truncateLength)}</OutputBox>
      </FuturisticCard>

      <FuturisticCard title="Case Conversions" description="Functions to convert strings between different case formats.">
        <FuturisticInput
          type="text"
          value={caseInput}
          onChange={(e) => setCaseInput(e.target.value)}
        />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-base-100/50 rounded">
                <p className="text-text-secondary text-sm">camelCase:</p>
                <p className="text-text-primary font-mono break-words">{camelCase(caseInput)}</p>
            </div>
             <div className="p-4 bg-base-100/50 rounded">
                <p className="text-text-secondary text-sm">pascalCase:</p>
                <p className="text-text-primary font-mono break-words">{pascalCase(caseInput)}</p>
            </div>
             <div className="p-4 bg-base-100/50 rounded">
                <p className="text-text-secondary text-sm">snake_case:</p>
                <p className="text-text-primary font-mono break-words">{snakeCase(caseInput)}</p>
            </div>
             <div className="p-4 bg-base-100/50 rounded">
                <p className="text-text-secondary text-sm">kebab-case:</p>
                <p className="text-text-primary font-mono break-words">{kebabCase(caseInput)}</p>
            </div>
        </div>
      </FuturisticCard>
    </div>
  );
};

export default StringUtilsExample;
