
import React, { useState, useCallback, useRef } from 'react';
import { debounce, throttle, retry, sleep, timeout } from '../../modules/async/async-utils';

const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description: string }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        <p className="text-text-secondary mb-4">{description}</p>
        <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg space-y-4">
            {children}
        </div>
    </div>
);

const FuturisticButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'teal' | 'blue' | 'indigo' | 'purple' | 'green' }> = ({ children, className, variant = 'teal', ...props }) => {
    const colors = {
        teal: 'bg-neon-teal/20 hover:bg-neon-teal/30 text-neon-teal border-neon-teal',
        blue: 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-400',
        indigo: 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border-indigo-400',
        purple: 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border-purple-400',
        green: 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-400',
    };
    return (
        <button {...props} className={`font-bold py-2 px-4 rounded transition duration-300 border disabled:bg-base-300 disabled:text-text-secondary disabled:border-base-300 disabled:cursor-not-allowed ${colors[variant]} ${className}`}>
            {children}
        </button>
    );
};


const AsyncUtilsExample: React.FC = () => {
    const [logs, setLogs] = useState<string[]>([]);
    const [debounceInput, setDebounceInput] = useState('');
    const [throttleClicks, setThrottleClicks] = useState(0);
    const [retryStatus, setRetryStatus] = useState('Idle');
    const [isSleeping, setIsSleeping] = useState(false);
    const [timeoutStatus, setTimeoutStatus] = useState('Idle');
    
    const log = useCallback((message: string) => {
        setLogs(prev => [`${new Date().toLocaleTimeString()}: ${message}`, ...prev].slice(0, 15));
    }, []);

    const debouncedLog = useCallback(debounce((value: string) => {
        log(`Debounced: Input settled with value "${value}"`);
    }, 500), [log]);

    const handleDebounceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setDebounceInput(value);
        log(`Input changed: "${value}"`);
        debouncedLog(value);
    };

    const throttledLog = useCallback(throttle(() => {
        setThrottleClicks(prev => prev + 1);
        log('Throttled: Click event fired!');
    }, 1000), [log]);

    const failingApiCall = useRef(0);
    const handleRetry = async () => {
        failingApiCall.current = 0;
        setRetryStatus('Retrying...');
        log('Starting retry operation...');

        const apiCall = (): Promise<string> => {
            return new Promise((resolve, reject) => {
                failingApiCall.current++;
                log(`Attempt #${failingApiCall.current}...`);
                if (failingApiCall.current < 3) {
                    setTimeout(() => reject(new Error('API call failed!')), 500);
                } else {
                    setTimeout(() => resolve('API call succeeded!'), 500);
                }
            });
        };
        
        try {
            const result = await retry(apiCall, 3, 1000);
            setRetryStatus(`Success: ${result}`);
            log(`Retry success: ${result}`);
        } catch (error: any) {
            setRetryStatus(`Failed: ${error.message}`);
            log(`Retry failed after all attempts.`);
        }
    };

    const handleSleep = async () => {
        setIsSleeping(true);
        log('Sleeping for 2 seconds...');
        await sleep(2000);
        log('...awoke!');
        setIsSleeping(false);
    };
    
    const handleTimeout = async (taskDuration: number, timeoutDuration: number) => {
        setTimeoutStatus(`Running a ${taskDuration}ms task with a ${timeoutDuration}ms timeout...`);
        log(`Starting task that takes ${taskDuration}ms...`);
        
        const longTask = new Promise(resolve => setTimeout(() => resolve('Task finished successfully'), taskDuration));
        
        try {
            const result = await timeout(longTask, timeoutDuration);
            setTimeoutStatus(`Success: ${result}`);
            log(`Task Succeeded: ${result}`);
        } catch (error: any) {
            setTimeoutStatus(`Failed: ${error.message}`);
            log(`Task Failed: ${error.message}`);
        }
    };


    return (
        <div className="space-y-8">
            <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20">
                <h4 className="text-lg font-semibold text-text-primary mb-2">Event Log</h4>
                <div className="bg-base-100/50 rounded p-3 h-48 overflow-y-auto flex flex-col-reverse">
                    <pre className="text-sm text-text-secondary whitespace-pre-wrap font-mono">
                        {logs.join('\n')}
                    </pre>
                </div>
            </div>

            <FuturisticCard title="sleep(ms)" description="Pauses execution for a specified duration in an async function.">
                <FuturisticButton onClick={handleSleep} disabled={isSleeping} variant="purple">
                    {isSleeping ? 'Sleeping...' : 'Run sleep(2000)'}
                </FuturisticButton>
            </FuturisticCard>
            
            <FuturisticCard title="timeout(promise, ms)" description="Races a promise against a timer. Useful for aborting long-running tasks.">
                <div className="flex space-x-2">
                    <FuturisticButton onClick={() => handleTimeout(1000, 2000)} disabled={timeoutStatus.startsWith('Running...')} variant="green">
                        Task Succeeds (1s task, 2s timeout)
                    </FuturisticButton>
                    <FuturisticButton onClick={() => handleTimeout(2000, 1000)} disabled={timeoutStatus.startsWith('Running...')} variant="teal">
                        Task Times Out (2s task, 1s timeout)
                    </FuturisticButton>
                </div>
                <p className="text-text-secondary mt-4">Status: <span className="font-semibold text-text-primary">{timeoutStatus}</span></p>
            </FuturisticCard>

            <FuturisticCard title="debounce(func, wait)" description="Delays function execution until after a certain time has passed without it being called.">
                <label htmlFor="debounce-input" className="block text-text-secondary">Type here:</label>
                <input
                    id="debounce-input"
                    type="text"
                    value={debounceInput}
                    onChange={handleDebounceChange}
                    className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal mt-2"
                    placeholder="Type quickly..."
                />
            </FuturisticCard>
            
            <FuturisticCard title="throttle(func, wait)" description="Ensures a function is only executed at most once every specified period.">
                <FuturisticButton onClick={throttledLog} variant="blue">
                    Click Me Rapidly
                </FuturisticButton>
                <p className="text-text-secondary mt-4">Throttled Clicks Count: <span className="font-bold text-text-primary">{throttleClicks}</span></p>
            </FuturisticCard>

            <FuturisticCard title="retry(asyncFn, retries, delay)" description="Automatically re-attempts a failing promise-based function.">
                <FuturisticButton onClick={handleRetry} disabled={retryStatus.startsWith('Retrying...')} variant="indigo">
                    Run Failing API Call
                </FuturisticButton>
                <p className="text-text-secondary mt-4">Status: <span className="font-semibold text-text-primary">{retryStatus}</span></p>
            </FuturisticCard>
        </div>
    );
};

export default AsyncUtilsExample;
