
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { on, off, toggleClass, delegate, qs, qsa, setStyle } from '../../modules/dom/dom-utils';

const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description: string }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        <p className="text-text-secondary mb-4">{description}</p>
        <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg space-y-4">
            {children}
        </div>
    </div>
);

const FuturisticButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'teal' | 'red' | 'green' | 'blue' | 'indigo' | 'cyan' | 'sky' | 'purple' }> = ({ children, className, variant = 'teal', ...props }) => {
    const colors = {
        teal: 'bg-neon-teal/20 hover:bg-neon-teal/30 text-neon-teal border-neon-teal',
        red: 'bg-neon-red/20 hover:bg-neon-red/30 text-neon-red border-neon-red',
        green: 'bg-neon-green/20 hover:bg-neon-green/30 text-neon-green border-neon-green',
        blue: 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-400',
        indigo: 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border-indigo-400',
        cyan: 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border-cyan-400',
        sky: 'bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 border-sky-400',
        purple: 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border-purple-400',
    }
    return (
        <button {...props} className={`font-bold py-2 px-4 rounded transition duration-300 border ${colors[variant]} ${className}`}>
            {children}
        </button>
    );
};


const DomUtilsExample: React.FC = () => {
    const [logs, setLogs] = useState<string[]>([]);
    const [isListenerOn, setIsListenerOn] = useState(false);
    const [selector, setSelector] = useState('li.item-a');
    
    const onOffButtonRef = useRef<HTMLButtonElement>(null);
    const toggleBoxRef = useRef<HTMLDivElement>(null);
    const delegateListRef = useRef<HTMLUListElement>(null);
    const queryScopeRef = useRef<HTMLDivElement>(null);
    const styleBoxRef = useRef<HTMLDivElement>(null);
    
    const log = (message: string) => {
        setLogs(prev => [`${new Date().toLocaleTimeString()}: ${message}`, ...prev].slice(0, 10));
    };

    const handleButtonClick = useCallback(() => {
        log("Button clicked!");
    }, []);
    
    useEffect(() => {
        const button = onOffButtonRef.current;
        if (!button) return;

        if (isListenerOn) {
            on(button, 'click', handleButtonClick);
            log("Attached 'click' listener.");
        } else {
            off(button, 'click', handleButtonClick);
        }
        
        return () => {
            if (button) {
                off(button, 'click', handleButtonClick);
            }
        };
    }, [isListenerOn, handleButtonClick]);

    const handleToggleClick = () => {
        if (toggleBoxRef.current) {
            toggleClass(toggleBoxRef.current, 'bg-base-200/40');
            const wasAdded = toggleClass(toggleBoxRef.current, 'bg-neon-teal/30');
            log(`Class 'bg-neon-teal/30' is now ${wasAdded ? 'ON' : 'OFF'}.`);
        }
    };
    
    useEffect(() => {
        const list = delegateListRef.current;
        if (!list) return;

        const handleItemClick = (e: Event) => {
            const target = (e.target as Element).closest('li');
            if (target) {
                log(`Delegated click on: ${target.textContent}`);
            }
        };
        log("Attaching delegated 'click' listener to list.");
        const removeDelegatedListener = delegate(list, 'li', 'click', handleItemClick);
        return () => {
            log("Removing delegated listener from list.");
            removeDelegatedListener();
        };
    }, []);

    const addListItem = () => {
        const list = delegateListRef.current;
        if(list) {
            const newItem = document.createElement('li');
            const itemCount = list.children.length + 1;
            newItem.textContent = `Item ${itemCount}`;
            newItem.className = "p-2 bg-base-300/50 rounded cursor-pointer hover:bg-base-300/80 transition-colors";
            list.appendChild(newItem);
            log(`Added Item ${itemCount}.`);
        }
    };

    const runQuerySelector = () => {
        if (!queryScopeRef.current) return;
        qsa('.highlight', queryScopeRef.current).forEach(el => el.classList.remove('highlight', 'ring-2', 'ring-neon-pink'));
        
        try {
            const singleResult = qs(selector, queryScopeRef.current);
            if(singleResult) {
                log(`qs('${selector}') found: ${singleResult.tagName} with text "${singleResult.textContent}"`);
                singleResult.classList.add('highlight', 'ring-2', 'ring-neon-pink');
            } else {
                log(`qs('${selector}') found nothing.`);
            }
        } catch (e) {
            log(`Invalid selector for qs: ${selector}`);
        }
    };

    const runQuerySelectorAll = () => {
        if (!queryScopeRef.current) return;
        qsa('.highlight', queryScopeRef.current).forEach(el => el.classList.remove('highlight', 'ring-2', 'ring-neon-pink'));
        
        try {
            const allResults = qsa(selector, queryScopeRef.current);
            log(`qsa('${selector}') found ${allResults.length} elements.`);
            allResults.forEach(el => {
                el.classList.add('highlight', 'ring-2', 'ring-neon-pink');
            });
        } catch (e) {
            log(`Invalid selector for qsa: ${selector}`);
        }
    };
    
    const applyRandomStyles = () => {
        const box = styleBoxRef.current;
        if(!box) return;

        const randomHue = Math.floor(Math.random() * 360);
        const randomBorderRadius = Math.floor(Math.random() * 50);
        const randomScale = (Math.random() * 0.4 + 0.8).toFixed(2); // 0.8 to 1.2
        const styles = {
            backgroundColor: `hsla(${randomHue}, 70%, 50%, 0.3)`,
            borderColor: `hsla(${randomHue}, 70%, 50%, 1)`,
            borderRadius: `${randomBorderRadius}px`,
            transform: `scale(${randomScale}) rotate(${randomHue}deg)`,
        };

        setStyle(box, styles);
        log(`Applied new styles. Hue: ${randomHue}`);
    };

    return (
        <div className="space-y-8">
            <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20">
                <h4 className="text-lg font-semibold text-text-primary mb-2">Event Log</h4>
                <div className="bg-base-100/50 rounded p-3 h-40 overflow-y-auto flex flex-col-reverse">
                    <pre className="text-sm text-text-secondary whitespace-pre-wrap font-mono">
                        {logs.join('\n')}
                    </pre>
                </div>
            </div>
            
            <FuturisticCard title="qs(selector) / qsa(selector)" description="Convenient shorthands for `querySelector` and `querySelectorAll`.">
                <div>
                    <label className="block text-text-secondary mb-1">CSS Selector:</label>
                    <input type="text" value={selector} onChange={e => setSelector(e.target.value)} className="w-full bg-base-100/50 p-2 rounded border border-base-300 font-mono focus:outline-none focus:ring-2 focus:ring-neon-teal" />
                </div>
                 <div className="flex space-x-2">
                    <FuturisticButton onClick={runQuerySelector} variant="cyan">Run qs()</FuturisticButton>
                    <FuturisticButton onClick={runQuerySelectorAll} variant="sky">Run qsa()</FuturisticButton>
                </div>
                <div ref={queryScopeRef} className="p-4 rounded bg-base-100/50 space-y-2">
                    <p className="text-text-secondary">Search Area</p>
                    <ul>
                        <li className="item-a p-1 rounded transition-all">List Item (class="item-a")</li>
                        <li className="item-b p-1 rounded transition-all">List Item (class="item-b")</li>
                        <li className="item-a p-1 rounded transition-all">Another List Item (class="item-a")</li>
                    </ul>
                </div>
            </FuturisticCard>

            <FuturisticCard title="on(element, event, handler) / off(...)" description="Attach and detach event listeners from a DOM element.">
                 <div className="flex items-center space-x-4">
                    <button ref={onOffButtonRef} className="bg-base-300/80 hover:bg-base-300 text-text-primary font-bold py-2 px-4 rounded transition">
                        Test Button
                    </button>
                    <FuturisticButton onClick={() => {
                        setIsListenerOn(prev => !prev);
                        log(isListenerOn ? "Detaching listener..." : "Attaching listener...");
                    }} variant={isListenerOn ? 'red' : 'green'}>
                        {isListenerOn ? 'Deactivate Listener' : 'Activate Listener'}
                    </FuturisticButton>
                </div>
            </FuturisticCard>
            
            <FuturisticCard title="toggleClass(element, className)" description="Toggle a CSS class on an element to change its appearance.">
                <FuturisticButton onClick={handleToggleClick} variant="blue">
                    Toggle Style
                </FuturisticButton>
                <div ref={toggleBoxRef} className="p-4 rounded bg-base-200/40 transition-colors duration-300 text-center mt-4">
                    This box will change color.
                </div>
            </FuturisticCard>
            
            <FuturisticCard title="setStyle(element, styles)" description="Apply multiple inline CSS properties to an element at once.">
                <FuturisticButton onClick={applyRandomStyles} variant="purple">
                    Apply Random Styles
                </FuturisticButton>
                <div ref={styleBoxRef} className="p-8 rounded bg-base-200/40 transition-all duration-500 text-center mt-4 border-2 border-transparent">
                    This box will be styled.
                </div>
            </FuturisticCard>

            <FuturisticCard title="delegate(parent, selector, event, handler)" description="Efficiently handle events on child elements, including ones added dynamically.">
                 <FuturisticButton onClick={addListItem} variant="indigo">
                    Add List Item
                </FuturisticButton>
                <ul ref={delegateListRef} className="space-y-2 p-2 rounded bg-base-100/50 mt-4">
                    <li className="p-2 bg-base-300/50 rounded cursor-pointer hover:bg-base-300/80 transition-colors">Item 1</li>
                    <li className="p-2 bg-base-300/50 rounded cursor-pointer hover:bg-base-300/80 transition-colors">Item 2</li>
                    <li className="p-2 bg-base-300/50 rounded cursor-pointer hover:bg-base-300/80 transition-colors">Item 3</li>
                </ul>
            </FuturisticCard>
        </div>
    );
};

export default DomUtilsExample;
