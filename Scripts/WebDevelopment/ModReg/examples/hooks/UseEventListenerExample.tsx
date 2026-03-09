import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useEventListener } from '../../modules/hooks/use-event-listener';

const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description: string }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        <p className="text-text-secondary mb-4">{description}</p>
        <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg space-y-4">
            {children}
        </div>
    </div>
);

const OutputBox: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-2 p-4 bg-base-100/50 rounded">
        <p className="text-text-secondary">{title}</p>
        <p className="text-text-primary font-mono text-lg">{children}</p>
    </div>
);


const UseEventListenerExample: React.FC = () => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [lastKey, setLastKey] = useState<string | null>(null);
  const [scrollPos, setScrollPos] = useState(0);
  const [mainElement, setMainElement] = useState<HTMLElement | null>(null);
  
  const boxRef = useRef<HTMLDivElement>(null);
  
  // Find the main scrollable element after mount
  useEffect(() => {
    setMainElement(document.querySelector('main'));
  }, []);

  // 1. Listen to mousemove on a specific element (the box)
  const handleMouseMove = useCallback((event: Event) => {
    const mouseEvent = event as MouseEvent;
    const rect = boxRef.current?.getBoundingClientRect();
    if (rect) {
      setCoords({
        x: Math.round(mouseEvent.clientX - rect.left),
        y: Math.round(mouseEvent.clientY - rect.top)
      });
    }
  }, []);
  useEventListener('mousemove', handleMouseMove, boxRef);

  // 2. Listen to keydown on the window
  const handleKeyDown = useCallback((event: Event) => {
    const keyboardEvent = event as KeyboardEvent;
    setLastKey(keyboardEvent.key);
  }, []);
  useEventListener('keydown', handleKeyDown, window); // Explicitly pass window

  // 3. Listen to scroll on the main scrolling element of the page
  const handleScroll = useCallback(() => {
      if (mainElement) {
        setScrollPos(mainElement.scrollTop);
      }
  }, [mainElement]);
  useEventListener('scroll', handleScroll, mainElement);

  return (
    <div className="space-y-8">
      <FuturisticCard 
        title="useEventListener('mousemove', handler, elementRef)" 
        description="Tracks mouse position within the box below. The listener is attached to a specific div using a ref."
      >
        <div 
          ref={boxRef} 
          className="w-full h-48 bg-base-100/50 rounded-lg flex items-center justify-center border-2 border-dashed border-neon-teal/50 cursor-crosshair"
        >
            <p className="text-text-secondary">Hover over me</p>
        </div>
        <OutputBox title="Mouse Coords (relative to box):">
          {`{ x: ${coords.x}, y: ${coords.y} }`}
        </OutputBox>
      </FuturisticCard>
      
      <FuturisticCard
        title="useEventListener('keydown', handler, window)"
        description="Tracks the last key pressed. The listener is explicitly attached to the `window` object."
      >
        <p className="text-text-secondary text-center">Press any key on your keyboard.</p>
        <OutputBox title="Last Key Pressed:">
            {lastKey ? `'${lastKey}'` : '...'}
        </OutputBox>
      </FuturisticCard>

      <FuturisticCard
        title="useEventListener('scroll', handler, element)"
        description="Tracks the scroll position of the main content area, demonstrating attaching a listener to a dynamically found element."
      >
        <div className="h-48 text-center text-text-secondary flex items-center justify-center">
            <p>(You might need to resize your browser window to make this area scrollable)</p>
        </div>
         <OutputBox title="Main element scroll position:">
            {Math.round(scrollPos)}px
        </OutputBox>
      </FuturisticCard>
    </div>
  );
};

export default UseEventListenerExample;
