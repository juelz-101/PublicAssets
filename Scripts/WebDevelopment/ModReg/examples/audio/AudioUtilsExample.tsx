import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
    getAudioContext, 
    playFrequency, 
    createMicrophoneSource, 
    createAnalyser, 
    getFrequencyData, 
    getWaveformData 
} from '../../modules/audio/audio-utils';
import { createAnimationLoop, AnimationLoop } from '../../modules/graphics/animation-loop';
import { drawRect, clearCanvas, getContext } from '../../modules/graphics/canvas-utils';
import { useEventListener } from '../../modules/hooks/use-event-listener';

// Component styles
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
    <button {...props} className={`bg-neon-teal/20 hover:bg-neon-teal/30 text-neon-teal border border-neon-teal font-bold py-2 px-4 rounded transition duration-300 disabled:bg-base-300 disabled:text-text-secondary disabled:border-base-300 disabled:cursor-not-allowed ${className}`}>
        {children}
    </button>
);

// Notes for the simple synth
const notes: Record<string, number> = {
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
    'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'C5': 523.25,
};

const AudioUtilsExample: React.FC = () => {
    const [oscillatorType, setOscillatorType] = useState<OscillatorType>('sine');
    const [micStatus, setMicStatus] = useState<'off' | 'on' | 'error'>('off');
    const [visualizerMode, setVisualizerMode] = useState<'frequency' | 'waveform'>('frequency');

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationLoopRef = useRef<AnimationLoop | null>(null);
    const audioStreamRef = useRef<{ source: MediaStreamAudioSourceNode, stream: MediaStream, analyser: AnalyserNode } | null>(null);

    const handlePlayNote = (freq: number) => {
        // Ensure context is running from user gesture
        getAudioContext(); 
        playFrequency(freq, 0.5, oscillatorType);
    };

    const stopMicrophone = useCallback(() => {
        if (audioStreamRef.current) {
            audioStreamRef.current.stream.getTracks().forEach(track => track.stop());
            audioStreamRef.current.source.disconnect();
            audioStreamRef.current = null;
        }
        animationLoopRef.current?.stop();
        setMicStatus('off');
        
        const ctx = getContext(canvasRef.current);
        if (ctx) clearCanvas(ctx);
    }, []);

    const startMicrophone = async () => {
        try {
            const context = getAudioContext();
            const { source, stream } = await createMicrophoneSource(context);
            const analyser = createAnalyser(context, 2048);
            source.connect(analyser);
            
            audioStreamRef.current = { source, stream, analyser };
            setMicStatus('on');
            
            animationLoopRef.current?.start();

        } catch (error) {
            console.error("Microphone access denied or error:", error);
            setMicStatus('error');
        }
    };
    
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = getContext(canvas);
        if (!ctx) return;
        
        animationLoopRef.current = createAnimationLoop(() => {
            if (!audioStreamRef.current || !canvas) return;
            const { analyser } = audioStreamRef.current;
            clearCanvas(ctx);

            if (visualizerMode === 'frequency') {
                const dataArray = getFrequencyData(analyser);
                const barWidth = (canvas.width / dataArray.length) * 2.5;
                let x = 0;
                for (let i = 0; i < dataArray.length; i++) {
                    const barHeight = (dataArray[i] / 255) * canvas.height;
                    const hue = (i / dataArray.length) * 120 + 180; // from blue to green
                    drawRect(ctx, x, canvas.height - barHeight, barWidth, barHeight, { fillStyle: `hsl(${hue}, 100%, 70%)` });
                    x += barWidth + 1;
                }
            } else { // waveform
                const dataArray = getWaveformData(analyser);
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'var(--color-accent-primary)';
                ctx.beginPath();
                const sliceWidth = canvas.width * 1.0 / dataArray.length;
                let x = 0;
                for (let i = 0; i < dataArray.length; i++) {
                    const v = dataArray[i] / 128.0;
                    const y = v * canvas.height / 2;
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                    x += sliceWidth;
                }
                ctx.lineTo(canvas.width, canvas.height / 2);
                ctx.stroke();
            }
        });

        // Cleanup on unmount
        return () => {
            stopMicrophone();
        };

    }, [visualizerMode, stopMicrophone]);
    
     useEventListener('resize', () => {
        const canvas = canvasRef.current;
        if (canvas && canvas.parentElement) {
            canvas.width = canvas.parentElement.clientWidth;
        }
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas && canvas.parentElement) {
            canvas.width = canvas.parentElement.clientWidth;
        }
    }, []);

    return (
        <div className="space-y-8">
            <FuturisticCard title="Oscillator" description="Play simple tones. The AudioContext is created on the first button press.">
                <div>
                    <label className="block text-text-secondary mb-2">Waveform:</label>
                     <select
                        value={oscillatorType}
                        onChange={(e) => setOscillatorType(e.target.value as OscillatorType)}
                        className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal"
                    >
                        <option value="sine">Sine</option>
                        <option value="square">Square</option>
                        <option value="sawtooth">Sawtooth</option>
                        <option value="triangle">Triangle</option>
                    </select>
                </div>
                <div className="flex flex-wrap gap-2">
                    {Object.entries(notes).map(([noteName, freq]) => (
                        <FuturisticButton key={noteName} onClick={() => handlePlayNote(freq)}>
                            {noteName}
                        </FuturisticButton>
                    ))}
                </div>
            </FuturisticCard>
            
            <FuturisticCard title="Microphone Visualizer" description="Analyze live audio from your microphone.">
                <div className="flex flex-wrap gap-4 items-center">
                    {micStatus !== 'on' ? (
                        <FuturisticButton onClick={startMicrophone}>Start Microphone</FuturisticButton>
                    ) : (
                        <FuturisticButton onClick={stopMicrophone}>Stop Microphone</FuturisticButton>
                    )}
                    <div className="flex items-center space-x-2 p-2 rounded-lg bg-base-100/50">
                        <label className="text-text-secondary">Mode:</label>
                        <button onClick={() => setVisualizerMode('frequency')} className={`px-3 py-1 text-sm rounded ${visualizerMode === 'frequency' ? 'bg-neon-teal/30 text-neon-teal' : 'text-text-secondary'}`}>Frequency</button>
                        <button onClick={() => setVisualizerMode('waveform')} className={`px-3 py-1 text-sm rounded ${visualizerMode === 'waveform' ? 'bg-neon-teal/30 text-neon-teal' : 'text-text-secondary'}`}>Waveform</button>
                    </div>
                     {micStatus === 'error' && <p className="text-neon-red">Could not access microphone.</p>}
                </div>
                <canvas ref={canvasRef} height="200" className="bg-base-100/50 rounded-lg w-full mt-4" aria-label="Audio visualizer"></canvas>
            </FuturisticCard>
        </div>
    );
};

export default AudioUtilsExample;
