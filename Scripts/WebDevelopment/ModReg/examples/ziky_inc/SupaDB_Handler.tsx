import React from 'react';

const SupaDbExample: React.FC = () => {
    return (
        <div className="p-4 bg-gray-900 text-white rounded-lg border border-neon-teal">
            <h2 className="text-xl font-bold text-neon-teal mb-4">Supa-DB Handler Example</h2>
            <p className="mb-2">This is a serverless data manager mirroring the I-DB Handler but connects to Supabase.</p>
            <p className="text-gray-400 text-sm italic">
                To use this module, you need a live Supabase project. Initialize with: <br/>
                <code>manager.init(configUrl, supabaseUrl, supabaseAnonKey)</code>
            </p>
        </div>
    );
};

export default SupaDbExample;
