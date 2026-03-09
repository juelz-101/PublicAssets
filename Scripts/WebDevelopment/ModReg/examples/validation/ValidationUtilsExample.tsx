
import React, { useState, useMemo } from 'react';
import { isEmail, isURL, isStrongPassword, isJSON, isNumeric, isHexColor } from '../../modules/validation/validation-utils';

const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description: string }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        <p className="text-text-secondary mb-4">{description}</p>
        <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg">
            {children}
        </div>
    </div>
);

const ValidationIndicator: React.FC<{ isValid: boolean }> = ({ isValid }) => (
  <span className={`ml-2 font-semibold ${isValid ? 'text-neon-green' : 'text-neon-red'}`} style={{textShadow: isValid ? '0 0 5px #00ff9f' : '0 0 5px #ff073a'}}>
    {isValid ? 'Valid' : 'Invalid'}
  </span>
);

const PasswordCriteria: React.FC<{ text: string; met: boolean }> = ({ text, met }) => (
    <li className={`flex items-center transition-colors ${met ? 'text-neon-green' : 'text-text-secondary'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            {met ? (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            ) : (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            )}
        </svg>
        {text}
    </li>
);

const ValidationUtilsExample: React.FC = () => {
  const [emailInput, setEmailInput] = useState('test@example.com');
  const [urlInput, setUrlInput] = useState('https://example.com');
  const [passwordInput, setPasswordInput] = useState('');
  const [jsonInput, setJsonInput] = useState('{ "name": "John", "age": 30 }');
  const [numericInput, setNumericInput] = useState('12345');
  const [hexInput, setHexInput] = useState('#08f7fe');

  const isEmailValid = useMemo(() => isEmail(emailInput), [emailInput]);
  const isUrlValid = useMemo(() => isURL(urlInput), [urlInput]);
  const isJsonValid = useMemo(() => isJSON(jsonInput), [jsonInput]);
  const isNumericValid = useMemo(() => isNumeric(numericInput), [numericInput]);
  const isHexValid = useMemo(() => isHexColor(hexInput), [hexInput]);
  
  const passwordCheck = useMemo(() => {
    const value = passwordInput || '';
    return {
        length: value.length >= 8,
        lowercase: /[a-z]/.test(value),
        uppercase: /[A-Z]/.test(value),
        number: /[0-9]/.test(value),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(value),
        all: isStrongPassword(value),
    };
  }, [passwordInput]);

  return (
    <div className="space-y-8">
      <FuturisticCard title="isEmail(email)" description="Checks if the input string is a valid email format.">
          <div className="flex items-center">
            <input
              type="text"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal"
              placeholder="Enter an email address"
            />
            <ValidationIndicator isValid={isEmailValid} />
          </div>
      </FuturisticCard>

      <FuturisticCard title="isURL(url)" description="Checks if the input string is a valid URL.">
          <div className="flex items-center">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal"
              placeholder="Enter a URL"
            />
            <ValidationIndicator isValid={isUrlValid} />
          </div>
      </FuturisticCard>
      
       <FuturisticCard title="isNumeric(str)" description="Checks if the input string contains only numbers.">
          <div className="flex items-center">
            <input
              type="text"
              value={numericInput}
              onChange={(e) => setNumericInput(e.target.value)}
              className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal"
              placeholder="Enter a numeric string"
            />
            <ValidationIndicator isValid={isNumericValid} />
          </div>
      </FuturisticCard>

       <FuturisticCard title="isHexColor(str)" description="Checks for a valid hex color code (#FFF, #f0f0f0).">
          <div className="flex items-center">
            <input
              type="text"
              value={hexInput}
              onChange={(e) => setHexInput(e.target.value)}
              className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal font-mono"
              placeholder="Enter a hex color"
            />
             <div className="w-8 h-8 rounded ml-2 border border-base-300" style={{ backgroundColor: isHexValid ? hexInput : 'transparent' }} />
            <ValidationIndicator isValid={isHexValid} />
          </div>
      </FuturisticCard>

      <FuturisticCard title="isJSON(str)" description="Checks if the input string is valid JSON.">
          <div className="flex items-start">
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal font-mono"
              placeholder="Enter JSON string"
              rows={3}
            />
            <ValidationIndicator isValid={isJsonValid} />
          </div>
      </FuturisticCard>
      
      <FuturisticCard title="isStrongPassword(password)" description="Checks if the password meets multiple strength criteria.">
            <div className="flex items-center">
                <input
                    type="text"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal"
                    placeholder="Enter a password"
                />
                 <ValidationIndicator isValid={passwordCheck.all} />
            </div>
             <ul className="mt-4 space-y-2 bg-base-100/50 p-3 rounded">
                <PasswordCriteria text="At least 8 characters" met={passwordCheck.length} />
                <PasswordCriteria text="Contains a lowercase letter (a-z)" met={passwordCheck.lowercase} />
                <PasswordCriteria text="Contains an uppercase letter (A-Z)" met={passwordCheck.uppercase} />
                <PasswordCriteria text="Contains a number (0-9)" met={passwordCheck.number} />
                <PasswordCriteria text="Contains a special character (!@#...)" met={passwordCheck.special} />
            </ul>
      </FuturisticCard>
    </div>
  );
};

export default ValidationUtilsExample;
