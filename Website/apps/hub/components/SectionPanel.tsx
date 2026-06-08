import React from 'react';

const SectionPanel: React.FC<{ children: React.ReactNode; className?: string; id?: string }> = ({ children, className = '', id }) => (
    <section 
        id={id} 
        className={`bg-gray-900/50 backdrop-blur-lg shadow-2xl ${className}`}
        style={{
            padding: 'var(--panel-padding)',
            borderRadius: 'var(--panel-radius)',
            // This replicates Tailwind's ring-1 with a dynamic color
            boxShadow: `0 0 0 1px var(--panel-ring-color), 0 25px 50px -12px rgb(0 0 0 / 0.25)`
        }}
    >
        {children}
    </section>
);

export default SectionPanel;
