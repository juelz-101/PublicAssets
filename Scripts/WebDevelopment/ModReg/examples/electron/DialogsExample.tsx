import React, { useState } from 'react';
import { dialog, OpenDialogReturnValue, SaveDialogReturnValue, MessageBoxReturnValue } from '../../modules/electron/dialog-manager';
import { ipc } from '../../modules/electron/ipc-wrapper';

const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description: string }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        <p className="text-text-secondary mb-4">{description}</p>
        <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg space-y-4">
            {children}
        </div>
    </div>
);

const FuturisticButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'teal' | 'red' | 'blue' | 'yellow' }> = ({ children, className, variant = 'teal', ...props }) => {
    const colors = {
        teal: 'bg-neon-teal/20 hover:bg-neon-teal/30 text-neon-teal border-neon-teal',
        red: 'bg-neon-red/20 hover:bg-neon-red/30 text-neon-red border-neon-red',
        blue: 'bg-neon-blue/20 hover:bg-neon-blue/30 text-neon-blue border-neon-blue',
        yellow: 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 border-yellow-500',
    }
    return (
        <button {...props} className={`font-bold py-2 px-4 rounded transition duration-300 disabled:bg-base-300 disabled:text-text-secondary disabled:border-base-300 disabled:cursor-not-allowed ${colors[variant]} ${className}`}>
            {children}
        </button>
    );
}

const DialogsExample: React.FC = () => {
    const [lastResult, setLastResult] = useState<string>('No actions yet.');

    const handleOpenDialog = async () => {
        setLastResult('Opening dialog...');
        try {
            const result: OpenDialogReturnValue = await dialog.showOpenDialog({
                title: 'Select a Project File',
                properties: ['openFile', 'multiSelections'],
                filters: [{ name: 'Text Files', extensions: ['txt', 'md', 'json'] }]
            });
            setLastResult(JSON.stringify(result, null, 2));
        } catch (e: any) {
            setLastResult(`Error: ${e.message}`);
        }
    };

    const handleSaveDialog = async () => {
        setLastResult('Opening save dialog...');
        try {
            const result: SaveDialogReturnValue = await dialog.showSaveDialog({
                title: 'Save Configuration',
                defaultPath: 'config.json',
                filters: [{ name: 'JSON', extensions: ['json'] }]
            });
            setLastResult(JSON.stringify(result, null, 2));
        } catch (e: any) {
            setLastResult(`Error: ${e.message}`);
        }
    };

    const handleMessageBox = async () => {
        try {
            const result: MessageBoxReturnValue = await dialog.showMessageBox({
                type: 'question',
                buttons: ['Yes', 'No', 'Maybe'],
                defaultId: 0,
                title: 'Confirmation',
                message: 'Do you want to proceed with this operation?',
                detail: 'This action cannot be undone.'
            });
            setLastResult(`User clicked button index: ${result.response}`);
        } catch (e: any) {
            setLastResult(`Error: ${e.message}`);
        }
    };

    const handleErrorBox = () => {
        dialog.showErrorBox('Critical System Failure', 'The flux capacitor is out of alignment.');
        setLastResult('Error box displayed.');
    };

    const handleConfirm = async () => {
        const confirmed = await dialog.confirm('Delete all data?', 'This is a high-level wrapper for showMessageBox.');
        setLastResult(confirmed ? 'User CONFIRMED the action.' : 'User CANCELLED the action.');
    };

    const handleAbout = () => {
        dialog.showAboutPanel();
        setLastResult('About panel opened.');
    }

    return (
        <div className="space-y-8">
             <div className={`p-4 rounded-lg border ${ipc.isElectron() ? 'bg-neon-green/10 border-neon-green text-neon-green' : 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500'}`}>
                <p className="font-bold text-center">
                    {ipc.isElectron() ? "Native Electron Dialogs Active" : "Browser Mock Mode Active"}
                </p>
                {!ipc.isElectron() && <p className="text-center text-xs mt-1">File selection creates a dummy input, save uses window.prompt, and message box uses window.confirm.</p>}
            </div>

            <FuturisticCard title="File Dialogs" description="Interact with the file system using native dialogs.">
                <div className="flex gap-4">
                    <FuturisticButton onClick={handleOpenDialog} className="flex-1">
                        Open File(s)
                    </FuturisticButton>
                    <FuturisticButton onClick={handleSaveDialog} className="flex-1">
                        Save File
                    </FuturisticButton>
                </div>
            </FuturisticCard>

            <FuturisticCard title="System Alerts" description="Trigger native message boxes for information or confirmation.">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FuturisticButton onClick={handleMessageBox} variant="blue">
                        Complex Message Box
                    </FuturisticButton>
                    <FuturisticButton onClick={handleConfirm} variant="teal">
                        Confirm Action (Wrapper)
                    </FuturisticButton>
                    <FuturisticButton onClick={handleErrorBox} variant="red">
                        Show Error Box
                    </FuturisticButton>
                    <FuturisticButton onClick={handleAbout} variant="yellow">
                        About Panel
                    </FuturisticButton>
                 </div>
            </FuturisticCard>

            <FuturisticCard title="Result Log" description="Output from the last dialog action.">
                <pre className="bg-base-100/50 p-4 rounded text-text-primary font-mono text-sm whitespace-pre-wrap">
                    {lastResult}
                </pre>
            </FuturisticCard>
        </div>
    );
};

export default DialogsExample;
