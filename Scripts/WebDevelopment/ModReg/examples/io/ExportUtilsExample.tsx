
import React, { useState } from 'react';
import { exportToCsv } from '../../modules/io/export-utils';

const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description: string }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        <p className="text-text-secondary mb-4">{description}</p>
        <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg space-y-4">
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
    <input {...props} className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal focus:border-neon-teal transition-all font-mono" />
);

const sampleData = [
    { id: 1, name: 'Alice', email: 'alice@example.com', role: 'Admin' },
    { id: 2, name: 'Bob Smith', email: 'bob.smith@example.com', role: 'Editor, Contributor' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com', role: 'Viewer' },
    { id: 4, name: 'Diana "Dee"', email: 'dee@example.com', role: 'Viewer' },
];

const ExportUtilsExample: React.FC = () => {
    const [fileName, setFileName] = useState('users.csv');

    const handleExport = () => {
        exportToCsv(sampleData, fileName);
    };

    return (
        <div className="space-y-8">
            <FuturisticCard
                title="exportToCsv"
                description="Converts an array of objects into a CSV string and triggers a browser download."
            >
                <div>
                    <label className="block text-text-secondary mb-2">Sample Data to Export:</label>
                    <div className="overflow-x-auto bg-base-100/50 p-2 rounded">
                        <table className="min-w-full text-left text-sm">
                            <thead className="border-b border-neon-teal/30">
                                <tr>
                                    <th className="p-2">ID</th>
                                    <th className="p-2">Name</th>
                                    <th className="p-2">Email</th>
                                    <th className="p-2">Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sampleData.map(user => (
                                    <tr key={user.id} className="border-b border-base-300/50">
                                        <td className="p-2 font-mono">{user.id}</td>
                                        <td className="p-2">{user.name}</td>
                                        <td className="p-2 font-mono">{user.email}</td>
                                        <td className="p-2">{user.role}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-end gap-4">
                    <div className="flex-grow w-full md:w-auto">
                        <label className="block text-text-secondary mb-1">Filename:</label>
                        <FuturisticInput
                            value={fileName}
                            onChange={e => setFileName(e.target.value)}
                            placeholder="e.g., export.csv"
                        />
                    </div>
                    <FuturisticButton onClick={handleExport} className="w-full md:w-auto">
                        Export to CSV
                    </FuturisticButton>
                </div>
            </FuturisticCard>
        </div>
    );
};

export default ExportUtilsExample;
