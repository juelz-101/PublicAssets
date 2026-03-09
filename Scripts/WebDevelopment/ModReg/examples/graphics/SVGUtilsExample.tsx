

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { parseSVG, serializeSVG, applyAttributes, convertAllShapesToPaths, renderComponent } from '../../modules/graphics/svg-utils';
import { downloadFile, readFileAsText } from '../../modules/file-system/file-utils';

const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description?: string }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        {description && <p className="text-text-secondary mb-4">{description}</p>}
        <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg space-y-4">
            {children}
        </div>
    </div>
);

const FuturisticButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => (
    <button {...props} className={`bg-neon-teal/20 hover:bg-neon-teal/30 text-neon-teal border border-neon-teal font-bold py-2 px-4 rounded transition duration-300 disabled:bg-base-300 disabled:text-text-secondary disabled:border-base-300 disabled:cursor-not-allowed ${className}`}>
        {children}
    </button>
);

const defaultSVG = `<svg width="200" height="200" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="80" height="30" rx="5" fill="#08f7fe" stroke="#EAEAEA" stroke-width="2"/>
  <circle cx="50" cy="70" r="20" fill="#F50057" stroke="#EAEAEA" stroke-width="2"/>
</svg>`;

// Programmatic SVG component for the `renderComponent` example
function bus(x = 100, y = 100, w = 120, h = 60, fill = 'orange'): SVGGElement {
	const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	group.setAttribute('data-meta', 'bus');

	const body = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
	body.setAttribute('x', String(x));
	body.setAttribute('y', String(y));
	body.setAttribute('width', String(w));
	body.setAttribute('height', String(h));
	body.setAttribute('fill', fill);
    body.setAttribute('rx', String(h * 0.1));
	group.appendChild(body);

    const window = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
	window.setAttribute('x', String(x + 10));
	window.setAttribute('y', String(y + 10));
	window.setAttribute('width', String(w - 20));
	window.setAttribute('height', String(h * 0.4));
	window.setAttribute('fill', '#08f7fe');
    window.setAttribute('fill-opacity', '0.5');
	group.appendChild(window);

	const wheel1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
	wheel1.setAttribute('cx', String(x + w * 0.25));
	wheel1.setAttribute('cy', String(y + h));
	wheel1.setAttribute('r', String(h * 0.2));
	wheel1.setAttribute('fill', '#2A2A2A');
	group.appendChild(wheel1);

	const wheel2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
	wheel2.setAttribute('cx', String(x + w * 0.75));
	wheel2.setAttribute('cy', String(y + h));
	wheel2.setAttribute('r', String(h * 0.2));
	wheel2.setAttribute('fill', '#2A2A2A');
	group.appendChild(wheel2);

	return group;
}

const defaultJsCode = `function coolCar(x = 10, y = 50, w = 180, h = 80, fill = '#F50057') {
    // The NS constant is defined globally above.
	const group = document.createElementNS(NS, 'g');
	
	const body = document.createElementNS(NS, 'rect');
	body.setAttribute('x', String(x));
	body.setAttribute('y', String(y));
	body.setAttribute('width', String(w));
	body.setAttribute('height', String(h*0.8));
	body.setAttribute('fill', fill);
    body.setAttribute('rx', String(h * 0.1));
	group.appendChild(body);

    const top = document.createElementNS(NS, 'rect');
	top.setAttribute('x', String(x + w * 0.2));
	top.setAttribute('y', String(y - h * 0.4));
	top.setAttribute('width', String(w * 0.6));
	top.setAttribute('height', String(h * 0.5));
	top.setAttribute('fill', fill);
    top.setAttribute('rx', String(h * 0.1));
	group.appendChild(top);

	const wheel1 = document.createElementNS(NS, 'circle');
	wheel1.setAttribute('cx', String(x + w * 0.25));
	wheel1.setAttribute('cy', String(y + h*0.8));
	wheel1.setAttribute('r', String(h * 0.25));
	wheel1.setAttribute('fill', '#2A2A2A');
	group.appendChild(wheel1);

	const wheel2 = document.createElementNS(NS, 'circle');
	wheel2.setAttribute('cx', String(x + w * 0.75));
	wheel2.setAttribute('cy', String(y + h*0.8));
	wheel2.setAttribute('r', String(h * 0.25));
	wheel2.setAttribute('fill', '#2A2A2A');
	group.appendChild(wheel2);

	return group;
}`;

const defaultTsCode = `function coolCar(x: number = 10, y: number = 50, w: number = 180, h: number = 80, fill: string = '#F50057'): SVGGElement {
    // The NS constant is defined globally above.
	const group = document.createElementNS(NS, 'g');
	
	const body = document.createElementNS(NS, 'rect');
	body.setAttribute('x', String(x));
	body.setAttribute('y', String(y));
	body.setAttribute('width', String(w));
	body.setAttribute('height', String(h*0.8));
	body.setAttribute('fill', fill);
    body.setAttribute('rx', String(h * 0.1));
	group.appendChild(body);

    const top = document.createElementNS(NS, 'rect');
	top.setAttribute('x', String(x + w * 0.2));
	top.setAttribute('y', String(y - h * 0.4));
	top.setAttribute('width', String(w * 0.6));
	top.setAttribute('height', String(h * 0.5));
	top.setAttribute('fill', fill);
    top.setAttribute('rx', String(h * 0.1));
	group.appendChild(top);

	const wheel1 = document.createElementNS(NS, 'circle');
	wheel1.setAttribute('cx', String(x + w * 0.25));
	wheel1.setAttribute('cy', String(y + h*0.8));
	wheel1.setAttribute('r', String(h * 0.25));
	wheel1.setAttribute('fill', '#2A2A2A');
	group.appendChild(wheel1);

	const wheel2 = document.createElementNS(NS, 'circle');
	wheel2.setAttribute('cx', String(x + w * 0.75));
	wheel2.setAttribute('cy', String(y + h*0.8));
	wheel2.setAttribute('r', String(h * 0.25));
	wheel2.setAttribute('fill', '#2A2A2A');
	group.appendChild(wheel2);

	return group;
}`;

const defaultJsonCode = `[
  {
    "tag": "rect",
    "attrs": {
      "x": 10, "y": 10, "width": 180, "height": 80, "rx": 8,
      "fill": "var(--color-accent-primary)"
    }
  },
  {
    "tag": "circle",
    "attrs": { "cx": 60, "cy": 120, "r": 30, "fill": "var(--color-accent-secondary)" }
  },
  {
    "tag": "circle",
    "attrs": { "cx": 140, "cy": 120, "r": 30, "fill": "var(--color-accent-secondary)" }
  }
]`;

interface DynamicParam {
  name: string;
  type: 'number' | 'color' | 'string';
  value: any;
  min?: number;
  max?: number;
}


const SVGUtilsExample: React.FC = () => {
    const [rawSVG, setRawSVG] = useState(defaultSVG);
    const [svgPreview, setSvgPreview] = useState(defaultSVG);
    const [message, setMessage] = useState('Default SVG loaded.');
    const importFileRef = useRef<HTMLInputElement>(null);

    // State for attribute controls
    const [fillColor, setFillColor] = useState('#00ff9f');
    const [strokeColor, setStrokeColor] = useState('#EAEAEA');
    const [strokeWidth, setStrokeWidth] = useState(2);
    
    // State for renderComponent example
    const svgComponentRef = useRef<SVGSVGElement>(null);
    const [busX, setBusX] = useState(40);
    const [busY, setBusY] = useState(60);
    const [busW, setBusW] = useState(120);
    const [busH, setBusH] = useState(60);
    const [busFill, setBusFill] = useState('#FF7F50'); // neon-orange

    // State for dynamic component renderer
    const [activeTab, setActiveTab] = useState<'js'|'ts'|'json'>('js');
    const [nsVariable, setNsVariable] = useState('NS');
    const [svgNs, setSvgNs] = useState('http://www.w3.org/2000/svg');
    const [jsCode, setJsCode] = useState(defaultJsCode);
    const [tsCode, setTsCode] = useState(defaultTsCode);
    const [jsonCode, setJsonCode] = useState(defaultJsonCode);
    
    const [dynamicSvgOutput, setDynamicSvgOutput] = useState<string | null>(null);
    const [dynamicError, setDynamicError] = useState<string>('');
    const [dynamicParams, setDynamicParams] = useState<DynamicParam[]>([]);
    
    const codeState = useMemo(() => ({
        js: { code: jsCode, setCode: setJsCode },
        ts: { code: tsCode, setCode: setTsCode },
        json: { code: jsonCode, setCode: setJsonCode },
    }), [jsCode, tsCode, jsonCode]);

    const displayMessage = (msg: string, isError: boolean = false) => {
        setMessage(msg);
    };

    const handleApplyAttributes = () => {
        const svgElement = parseSVG(svgPreview);
        if (!svgElement) {
            displayMessage('Cannot apply attributes: SVG is invalid.', true);
            return;
        }

        const elementsToModify = svgElement.querySelectorAll('path, rect, circle, ellipse, polygon, line, polyline');
        elementsToModify.forEach(el => {
            applyAttributes(el, {
                fill: fillColor,
                stroke: strokeColor,
                'stroke-width': strokeWidth
            });
        });
        
        const newSvgString = serializeSVG(svgElement);
        setRawSVG(newSvgString);
        setSvgPreview(newSvgString);
        displayMessage('Attributes applied to all shapes.');
    };
    
    const handleConvertToPaths = () => {
        const svgElement = parseSVG(rawSVG);
        if (!svgElement) {
            displayMessage('Cannot convert: Invalid SVG input.', true);
            return;
        }
        
        convertAllShapesToPaths(svgElement);
        
        const newSvgString = serializeSVG(svgElement);
        setRawSVG(newSvgString);
        setSvgPreview(newSvgString);
        displayMessage('All shapes converted to paths.');
    };

    useEffect(() => {
        const svgElement = parseSVG(rawSVG);
        if(svgElement) {
            setSvgPreview(serializeSVG(svgElement));
            displayMessage('SVG preview updated.');
        } else {
             displayMessage('Invalid SVG syntax.', true);
        }
    }, [rawSVG]);

    useEffect(() => {
        const svg = svgComponentRef.current;
        if (!svg) return;
        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }
        renderComponent(svg, bus, busX, busY, busW, busH, busFill);
    }, [busX, busY, busW, busH, busFill]);
    
    const parseFunctionParams = useCallback((code: string): DynamicParam[] => {
        const params: DynamicParam[] = [];
        const paramsMatch = code.match(/function\s*[\w$]*\s*\(([^)]*)\)/);
        if (!paramsMatch) return [];

        const paramsString = paramsMatch[1];
        if (!paramsString) return [];

        const paramDeclarations = paramsString.split(',').map(p => p.trim());

        for (const decl of paramDeclarations) {
            const assignmentMatch = decl.match(/([\w$]+)\s*(?::\s*[\w<>]+)?\s*=\s*(.*)/);
            if (!assignmentMatch) continue;

            const name = assignmentMatch[1];
            let valueStr = assignmentMatch[2].trim();

            if (!isNaN(parseFloat(valueStr)) && isFinite(Number(valueStr))) {
                const value = parseFloat(valueStr);
                params.push({ name, type: 'number', value, min: 0, max: Math.max(10, value * 2) });
                continue;
            }

            if ((valueStr.startsWith("'") && valueStr.endsWith("'")) || (valueStr.startsWith('"') && valueStr.endsWith('"'))) {
                const value = valueStr.slice(1, -1);
                const isColor = /^#([0-9a-f]{3}){1,2}$/i.test(value) || value.startsWith('var(');
                if (isColor) {
                    params.push({ name, type: 'color', value });
                } else {
                    params.push({ name, type: 'string', value });
                }
                continue;
            }
        }
        return params;
    }, []);

    const handleParseAndRender = useCallback(() => {
        if (activeTab === 'js' || activeTab === 'ts') {
            const params = parseFunctionParams(codeState[activeTab].code);
            setDynamicParams(params);
        } else {
            setDynamicParams([]); // No params for JSON
        }
    }, [activeTab, codeState, parseFunctionParams]);
    
    const renderSvgFromJson = (jsonString: string): SVGElement => {
        const data = JSON.parse(jsonString);
        if (!Array.isArray(data)) throw new Error("JSON must be an array of shape objects.");
        // Fix: Cast to unknown first to satisfy TypeScript's strict type checking for `createElementNS`
        // when using a variable for the namespace.
        const group = document.createElementNS(svgNs, 'g') as unknown as SVGGElement;
        data.forEach(item => {
            if (item.tag && typeof item.tag === 'string') {
                const el = document.createElementNS(svgNs, item.tag);
                if (item.attrs && typeof item.attrs === 'object') {
                    for (const [key, value] of Object.entries(item.attrs)) {
                        el.setAttribute(key, String(value));
                    }
                }
                group.appendChild(el);
            }
        });
        return group;
    };
    
    const renderDynamicComponent = useCallback(() => {
        try {
            setDynamicError('');
            // Fix: Cast to unknown first to satisfy TypeScript's strict type checking for `createElementNS`
            // when using a variable for the namespace. This resolves the conversion error.
            const svgHost = document.createElementNS(svgNs, 'svg') as unknown as SVGSVGElement;
            svgHost.setAttribute('viewBox', '0 0 200 200');
            svgHost.setAttribute('width', '100%');
            svgHost.setAttribute('height', '100%');
            
            let componentElement: SVGElement;

            if (activeTab === 'js' || activeTab === 'ts') {
                const codeToRun = codeState[activeTab].code;
                const functionNameMatch = codeToRun.match(/function\s+([a-zA-Z0-9_]+)\s*\(/);
                if (!functionNameMatch || !functionNameMatch[1]) {
                    throw new Error("Could not find a named function (e.g., 'function myComponent() { ... }').");
                }
                const functionName = functionNameMatch[1];
                
                const globalConst = `const ${nsVariable} = "${svgNs}";`;
                const factory = new Function(`${globalConst}\n${codeToRun}; return ${functionName};`);
                const dynamicComponentFn = factory();

                if (typeof dynamicComponentFn !== 'function') throw new Error(`'${functionName}' is not a function.`);
                
                const args = dynamicParams.map(p => p.value);
                // Fix: Cast the result to SVGElement. The return type of the dynamically created
                // function is 'any', and TypeScript infers 'Element', causing a type mismatch.
                // This resolves the error on line 328.
                componentElement = dynamicComponentFn(...args) as SVGElement;
            } else {
                componentElement = renderSvgFromJson(codeState.json.code);
            }

            if (!(componentElement instanceof SVGElement)) throw new Error("The function or JSON must produce a valid SVGElement.");

            svgHost.appendChild(componentElement);
            setDynamicSvgOutput(serializeSVG(svgHost));

        } catch (e: any) {
            if (e instanceof Error) {
                console.error("Error rendering dynamic component:", e);
                setDynamicSvgOutput(null);
                setDynamicError(e.message);
            }
        }
    }, [activeTab, codeState, svgNs, nsVariable, dynamicParams]);

    useEffect(() => {
        renderDynamicComponent();
    }, [renderDynamicComponent]);
    
    const handleExport = () => {
        const stateToExport = {
            bus: { x: busX, y: busY, w: busW, h: busH, fill: busFill },
            renderer: {
                nsVariable,
                svgNs,
                code: { js: jsCode, ts: tsCode, json: jsonCode },
                activeTab,
                dynamicParams
            }
        };
        const jsonString = JSON.stringify(stateToExport, null, 2);
        downloadFile(jsonString, 'svg-utils-state.json', 'application/json');
        displayMessage('State exported successfully.');
    };
    
    const handleImportClick = () => importFileRef.current?.click();
    
    const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const text = await readFileAsText(file);
            const state = JSON.parse(text);

            if (state.bus) {
                setBusX(state.bus.x ?? busX);
                setBusY(state.bus.y ?? busY);
                setBusW(state.bus.w ?? busW);
                setBusH(state.bus.h ?? busH);
                setBusFill(state.bus.fill ?? busFill);
            }
            if (state.renderer) {
                setNsVariable(state.renderer.nsVariable ?? nsVariable);
                setSvgNs(state.renderer.svgNs ?? svgNs);
                setJsCode(state.renderer.code?.js ?? jsCode);
                setTsCode(state.renderer.code?.ts ?? tsCode);
                setJsonCode(state.renderer.code?.json ?? jsonCode);
                setActiveTab(state.renderer.activeTab ?? activeTab);
                setDynamicParams(state.renderer.dynamicParams ?? []);
            }
            displayMessage('State imported successfully.');
        } catch (error: any) {
            if (error instanceof Error) {
                displayMessage(`Import failed: ${error.message}`, true);
            } else {
                displayMessage(`Import failed: An unknown error occurred.`, true);
            }
        } finally {
            if (e.target) e.target.value = '';
        }
    };

    const TabButton: React.FC<{ children: React.ReactNode; onClick: () => void; isActive: boolean }> = ({ children, onClick, isActive }) => (
         <button
            onClick={onClick}
            className={`px-4 py-2 font-semibold transition-colors duration-200 border-b-2 ${
            isActive
                ? 'text-neon-teal border-neon-teal'
                : 'text-text-secondary border-transparent hover:text-text-primary'
            }`}
        >
            {children}
        </button>
    );

    const updateDynamicParam = (index: number, newValue: any) => {
        setDynamicParams(prevParams => {
            const newParams = [...prevParams];
            newParams[index] = { ...newParams[index], value: newValue };
            return newParams;
        });
    };

    return (
        <div className="space-y-8">
            <FuturisticCard title="Export / Import State" description="Save the state of the bus controls and the dynamic renderer to a JSON file, or load a previous session.">
                <div className="flex flex-wrap gap-2">
                    <FuturisticButton onClick={handleExport}>Export State to JSON</FuturisticButton>
                    <FuturisticButton onClick={handleImportClick}>Import State from JSON</FuturisticButton>
                    <input type="file" ref={importFileRef} onChange={handleFileSelected} accept=".json" className="hidden"/>
                </div>
            </FuturisticCard>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <FuturisticCard title="SVG Preview & Controls">
                     <div
                        className="w-full aspect-square bg-base-100/50 rounded-lg flex items-center justify-center p-4 border border-base-300"
                        dangerouslySetInnerHTML={{ __html: svgPreview }}
                     />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-neon-teal/20">
                           <div>
                                <label className="block text-text-secondary mb-1 text-sm">Fill Color</label>
                                <input type="color" value={fillColor} onChange={e => setFillColor(e.target.value)} className="w-full h-10 p-1 bg-base-100/50 border border-base-300 rounded"/>
                           </div>
                           <div>
                                <label className="block text-text-secondary mb-1 text-sm">Stroke Color</label>
                                <input type="color" value={strokeColor} onChange={e => setStrokeColor(e.target.value)} className="w-full h-10 p-1 bg-base-100/50 border border-base-300 rounded"/>
                           </div>
                           <div>
                                <label className="block text-text-secondary mb-1 text-sm">Stroke Width</label>
                                <input type="number" value={strokeWidth} onChange={e => setStrokeWidth(Number(e.target.value))} min="0" step="0.5" className="w-full h-10 p-2 bg-base-100/50 border border-base-300 rounded"/>
                           </div>
                      </div>
                      <FuturisticButton onClick={handleApplyAttributes} className="w-full">Apply Styles to All Shapes</FuturisticButton>
                 </FuturisticCard>
                 <FuturisticCard title="SVG Code" description="Edit the SVG code below. The preview will update live.">
                    <textarea
                        value={rawSVG}
                        onChange={(e) => setRawSVG(e.target.value)}
                        className="w-full h-64 bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal font-mono text-sm"
                        spellCheck="false"
                    />
                    <div className="flex flex-wrap gap-2">
                         <FuturisticButton onClick={handleConvertToPaths}>Convert Shapes to Paths</FuturisticButton>
                         <FuturisticButton onClick={() => setRawSVG(defaultSVG)}>Reset to Default</FuturisticButton>
                    </div>
                    <div className="p-2 bg-base-100/50 rounded text-sm text-text-secondary font-mono h-12">
                        {message}
                    </div>
                 </FuturisticCard>
            </div>
            <FuturisticCard title="renderComponent(parent, componentFn, ...args)" description="Renders a programmatic SVG component into a parent SVG. The 'bus' below is created by a function and re-rendered when its parameters change.">
                <svg ref={svgComponentRef} className="w-full aspect-square bg-base-100/50 rounded-lg border border-base-300" viewBox="0 0 200 200" />
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 pt-4 border-t border-neon-teal/20">
                    <div>
                        <label className="block text-text-secondary mb-1 text-sm">X Position: {busX}</label>
                        <input type="range" min="0" max="80" value={busX} onChange={e => setBusX(Number(e.target.value))} className="w-full accent-neon-teal"/>
                    </div>
                    <div>
                        <label className="block text-text-secondary mb-1 text-sm">Y Position: {busY}</label>
                        <input type="range" min="0" max="100" value={busY} onChange={e => setBusY(Number(e.target.value))} className="w-full accent-neon-teal"/>
                    </div>
                    <div>
                        <label className="block text-text-secondary mb-1 text-sm">Width: {busW}</label>
                        <input type="range" min="50" max="150" value={busW} onChange={e => setBusW(Number(e.target.value))} className="w-full accent-neon-teal"/>
                    </div>
                    <div>
                        <label className="block text-text-secondary mb-1 text-sm">Height: {busH}</label>
                        <input type="range" min="30" max="100" value={busH} onChange={e => setBusH(Number(e.target.value))} className="w-full accent-neon-teal"/>
                    </div>
                    <div className="col-span-2">
                        <label className="block text-text-secondary mb-1 text-sm">Fill Color</label>
                        <input type="color" value={busFill} onChange={e => setBusFill(e.target.value)} className="w-full h-10 p-1 bg-base-100/50 border border-base-300 rounded"/>
                    </div>
                </div>
            </FuturisticCard>
            <FuturisticCard
                title="Dynamic SVG Component Renderer"
                description="Write a JS/TS function with default parameters or a JSON structure. Parameters will become live controls."
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-4">
                        {activeTab !== 'json' && (
                             <div className="grid grid-cols-2 gap-2">
                                 <div>
                                    <label className="block text-text-secondary mb-1 text-sm">NS Variable Name:</label>
                                    <input
                                        type="text"
                                        value={nsVariable}
                                        onChange={(e) => setNsVariable(e.target.value)}
                                        className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal font-mono text-sm"
                                    />
                                 </div>
                                  <div>
                                    <label className="block text-text-secondary mb-1 text-sm">Namespace URI:</label>
                                    <select
                                        value={svgNs}
                                        onChange={(e) => setSvgNs(e.target.value)}
                                        className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal font-mono text-sm"
                                    >
                                        <option value="http://www.w3.org/2000/svg">SVG</option>
                                        <option value="http://www.w3.org/1999/xlink">XLINK</option>
                                    </select>
                                 </div>
                             </div>
                        )}
                        <div className="flex justify-between items-center border-b border-neon-teal/20">
                            <div className="flex">
                               <TabButton isActive={activeTab === 'js'} onClick={() => setActiveTab('js')}>JS</TabButton>
                               <TabButton isActive={activeTab === 'ts'} onClick={() => setActiveTab('ts')}>TS</TabButton>
                               <TabButton isActive={activeTab === 'json'} onClick={() => setActiveTab('json')}>JSON</TabButton>
                            </div>
                        </div>
                        <textarea
                            value={codeState[activeTab].code}
                            onChange={(e) => codeState[activeTab].setCode(e.target.value)}
                            className="w-full h-96 bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal font-mono text-sm"
                            spellCheck="false"
                        />
                         <div className="flex gap-2">
                            <FuturisticButton onClick={handleParseAndRender} className="flex-grow">
                                Parse & Render
                            </FuturisticButton>
                             <FuturisticButton onClick={() => {codeState[activeTab].setCode(''); setDynamicParams([]);}} className="flex-grow">
                                Clear
                            </FuturisticButton>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div
                            className="w-full aspect-square bg-base-100/50 rounded-lg flex items-center justify-center p-4 border border-base-300"
                            dangerouslySetInnerHTML={{ __html: dynamicSvgOutput || '' }}
                        />
                        {dynamicParams.length > 0 && (
                            <div className="p-4 bg-base-100/50 rounded-lg border border-base-300 space-y-4">
                                <h4 className="text-text-primary font-semibold">Live Controls</h4>
                                {dynamicParams.map((param, index) => (
                                    <div key={`${param.name}-${index}`}>
                                        <label className="block text-text-secondary mb-1 text-sm">{param.name}</label>
                                        {param.type === 'number' && (
                                            <div className="flex items-center space-x-2">
                                                <input type="range" min={param.min} max={param.max} value={param.value} onChange={e => updateDynamicParam(index, Number(e.target.value))} className="w-full accent-neon-pink"/>
                                                <input type="number" value={param.value} onChange={e => updateDynamicParam(index, Number(e.target.value))} className="w-20 bg-base-100/50 p-1 rounded border border-base-300"/>
                                            </div>
                                        )}
                                        {param.type === 'color' && (
                                            <input type="color" value={param.value} onChange={e => updateDynamicParam(index, e.target.value)} className="w-full h-10 p-1 bg-base-100/50 border border-base-300 rounded"/>
                                        )}
                                         {param.type === 'string' && (
                                            <input type="text" value={param.value} onChange={e => updateDynamicParam(index, e.target.value)} className="w-full bg-base-100/50 p-2 rounded border border-base-300"/>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        {(dynamicError) && (
                            <div className="p-2 bg-red-500/10 border border-red-500/30 rounded text-sm text-neon-red font-mono">
                                <p className="font-bold">Error:</p>
                                <p>{dynamicError}</p>
                            </div>
                        )}
                    </div>
                </div>
            </FuturisticCard>
        </div>
    );
};

export default SVGUtilsExample;