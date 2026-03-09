
import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as effects from '../../modules/audio/audio-effects';
import { getAudioContext, createAnalyser, getFrequencyData, getWaveformData } from '../../modules/audio/audio-utils';
import { createAnimationLoop, AnimationLoop } from '../../modules/graphics/animation-loop';
import { drawRect, clearCanvas, getContext } from '../../modules/graphics/canvas-utils';

// --- Type Definitions ---
type EffectType = 'Filter' | 'Delay' | 'Panner' | 'Compressor' | 'Reverb';
interface Effect {
    id: string;
    type: EffectType;
    nodes: any; // Store all relevant nodes for the effect
    params: Record<string, any>;
}

// --- Helper Components ---
const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description?: string }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        {description && <p className="text-text-secondary mb-4">{description}</p>}
        <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg space-y-4">
            {children}
        </div>
    </div>
);
const ParameterSlider: React.FC<{ label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; unit?: string }> = 
({ label, value, onChange, min, max, step, unit="" }) => (
    <div>
        <label className="flex justify-between text-sm text-text-secondary font-mono">
            <span>{label}</span>
            <span>{value.toFixed(2)}{unit}</span>
        </label>
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-neon-pink" />
    </div>
);

// --- Main Example Component ---
const AudioEffectsExample: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeEffects, setActiveEffects] = useState<Effect[]>([]);
    const [visualizerMode, setVisualizerMode] = useState<'frequency' | 'waveform'>('frequency');

    const audioContextRef = useRef<AudioContext | null>(null);
    const mainVolumeRef = useRef<GainNode | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const schedulerIntervalRef = useRef<number | null>(null);
    const animationLoopRef = useRef<AnimationLoop | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    // --- Audio Initialization and Scheduling ---
    const setupAudio = useCallback(() => {
        if (audioContextRef.current) return;
        const context = getAudioContext();
        audioContextRef.current = context;
        mainVolumeRef.current = context.createGain();
        analyserRef.current = createAnalyser(context);
        mainVolumeRef.current.connect(analyserRef.current);
        analyserRef.current.connect(context.destination);
    }, []);

    const playSound = useCallback((time: number, type: 'kick' | 'snare' | 'hat') => {
        const context = audioContextRef.current;
        if (!context || !mainVolumeRef.current) return;

        if (type === 'kick') {
            const osc = context.createOscillator();
            const gain = context.createGain();
            osc.frequency.setValueAtTime(150, time);
            osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.1);
            gain.gain.setValueAtTime(1, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
            osc.connect(gain);
            gain.connect(mainVolumeRef.current);
            osc.start(time);
            osc.stop(time + 0.1);
        } else if (type === 'snare') {
            const noise = context.createBufferSource();
            const bufferSize = context.sampleRate * 0.1;
            const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
            noise.buffer = buffer;
            const gain = context.createGain();
            gain.gain.setValueAtTime(0.5, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);
            noise.connect(gain);
            gain.connect(mainVolumeRef.current);
            noise.start(time);
            noise.stop(time + 0.1);
        } else if (type === 'hat') {
            const noise = context.createBufferSource();
            const bufferSize = context.sampleRate * 0.05;
            const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
            noise.buffer = buffer;
            const filter = context.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.value = 10000;
            const gain = context.createGain();
            gain.gain.setValueAtTime(0.2, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.03);
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(mainVolumeRef.current);
            noise.start(time);
            noise.stop(time + 0.05);
        }
    }, []);

    const schedule = useCallback(() => {
        let nextNoteTime = audioContextRef.current!.currentTime;
        const scheduleAheadTime = 0.1;
        let current16thNote = 0;

        const nextNote = () => {
            const secondsPerBeat = 60.0 / 120; // 120 BPM
            nextNoteTime += 0.25 * secondsPerBeat;
            current16thNote = (current16thNote + 1) % 16;
        };

        const scheduleLoop = () => {
            while (nextNoteTime < audioContextRef.current!.currentTime + scheduleAheadTime) {
                if (current16thNote % 4 === 0) playSound(nextNoteTime, 'kick');
                if (current16thNote % 2 === 0) playSound(nextNoteTime, 'hat');
                if (current16thNote === 4 || current16thNote === 12) playSound(nextNoteTime, 'snare');
                nextNote();
            }
        };

        if (schedulerIntervalRef.current) clearInterval(schedulerIntervalRef.current);
        schedulerIntervalRef.current = window.setInterval(scheduleLoop, 25);
    }, [playSound]);

    // --- Audio Routing ---
    useEffect(() => {
        const context = audioContextRef.current;
        if (!context || !mainVolumeRef.current || !analyserRef.current) return;

        // Disconnect everything after the main volume
        mainVolumeRef.current.disconnect();

        let lastNode: AudioNode = mainVolumeRef.current;
        activeEffects.forEach(effect => {
            const input = effect.nodes.input || effect.nodes;
            const output = effect.nodes.output || effect.nodes;
            lastNode.connect(input);
            lastNode = output;
        });

        lastNode.connect(analyserRef.current);

    }, [activeEffects]);

    // --- Visualization ---
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = getContext(canvas);
        if (!ctx) return;

        animationLoopRef.current = createAnimationLoop(() => {
            if (!analyserRef.current || !canvas) return;
            clearCanvas(ctx);
            if (visualizerMode === 'frequency') {
                const dataArray = getFrequencyData(analyserRef.current);
                const barWidth = (canvas.width / dataArray.length) * 2;
                let x = 0;
                for (let i = 0; i < dataArray.length; i++) {
                    const barHeight = (dataArray[i] / 255) * canvas.height;
                    drawRect(ctx, x, canvas.height - barHeight, barWidth, barHeight, { fillStyle: 'var(--color-neon-teal)' });
                    x += barWidth + 1;
                }
            } else {
                const dataArray = getWaveformData(analyserRef.current);
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'var(--color-neon-teal)';
                ctx.beginPath();
                const sliceWidth = canvas.width * 1.0 / dataArray.length;
                let x = 0;
                for (let i = 0; i < dataArray.length; i++) {
                    const v = dataArray[i] / 128.0;
                    const y = v * canvas.height / 2;
                    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                    x += sliceWidth;
                }
                ctx.lineTo(canvas.width, canvas.height / 2);
                ctx.stroke();
            }
        });
        if (isPlaying) animationLoopRef.current.start(); else animationLoopRef.current.stop();
        return () => animationLoopRef.current?.stop();
    }, [visualizerMode, isPlaying]);

    // --- UI Handlers ---
    const togglePlay = () => {
        setupAudio();
        const context = audioContextRef.current!;
        if (context.state === 'suspended') context.resume();
        if (!isPlaying) {
            schedule();
            animationLoopRef.current?.start();
        } else {
            if (schedulerIntervalRef.current) clearInterval(schedulerIntervalRef.current);
            animationLoopRef.current?.stop();
        }
        setIsPlaying(!isPlaying);
    };

    const addEffect = (type: EffectType) => {
        setupAudio(); // Ensure the audio context is initialized
        const context = audioContextRef.current!;
        let newEffect: Effect;
        const id = `${type}-${Date.now()}`;
        switch(type) {
            case 'Filter':
                const filter = effects.createFilter(context);
                newEffect = { id, type, nodes: filter, params: { frequency: filter.frequency.value, q: filter.Q.value, type: filter.type } };
                break;
            case 'Delay':
                const delayNodes = effects.createDelay(context);
                newEffect = { id, type, nodes: delayNodes, params: { time: 0.5, feedback: 0.4 } };
                break;
            case 'Reverb':
                const reverbNodes = effects.createReverb(context);
                newEffect = { id, type, nodes: reverbNodes, params: { mix: 0.5 } };
                break;
            // Add other effects here
            default: return;
        }
        setActiveEffects(prev => [...prev, newEffect]);
    };

    const removeEffect = (id: string) => {
        const effectToRemove = activeEffects.find(e => e.id === id);
        if (effectToRemove) {
            // Fix: Correctly handle disconnection for various effect structures.
            // Some effects store a single node, others an object of nodes.
            // This also resolves a type error from passing `unknown` to `disconnectNodes`.
            const { nodes } = effectToRemove;
            if (nodes instanceof AudioNode) {
                effects.disconnectNodes(nodes);
            } else if (nodes && typeof nodes === 'object') {
                const nodeArray = Object.values(nodes).filter(
                    (v): v is AudioNode => v instanceof AudioNode
                );
                effects.disconnectNodes(...nodeArray);
            }
        }
        setActiveEffects(prev => prev.filter(e => e.id !== id));
    };

    const handleParamChange = (id: string, param: string, value: number) => {
        const effect = activeEffects.find(e => e.id === id);
        if (!effect) return;
        const context = audioContextRef.current!;

        // Update audio node parameter
        switch (effect.type) {
            case 'Filter':
                if (param === 'frequency') (effect.nodes as BiquadFilterNode).frequency.linearRampToValueAtTime(value, context.currentTime + 0.01);
                if (param === 'q') (effect.nodes as BiquadFilterNode).Q.linearRampToValueAtTime(value, context.currentTime + 0.01);
                break;
            case 'Delay':
                if (param === 'time') (effect.nodes.delayNode as DelayNode).delayTime.linearRampToValueAtTime(value, context.currentTime + 0.01);
                if (param === 'feedback') (effect.nodes.feedbackNode as GainNode).gain.linearRampToValueAtTime(value, context.currentTime + 0.01);
                break;
            case 'Reverb':
                 if (param === 'mix') {
                    (effect.nodes.wet as GainNode).gain.linearRampToValueAtTime(value, context.currentTime + 0.01);
                    (effect.nodes.dry as GainNode).gain.linearRampToValueAtTime(1 - value, context.currentTime + 0.01);
                }
                break;
        }

        // Update state for UI
        setActiveEffects(prev => prev.map(e => e.id === id ? { ...e, params: { ...e.params, [param]: value } } : e));
    };
    
    const handleDrop = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        const newEffects = [...activeEffects];
        const draggedItem = newEffects.splice(dragItem.current, 1)[0];
        newEffects.splice(dragOverItem.current, 0, draggedItem);
        dragItem.current = null;
        dragOverItem.current = null;
        setActiveEffects(newEffects);
    };

    return (
        <div className="space-y-8">
            <FuturisticCard title="Drum Machine & Effects Rack">
                <button onClick={togglePlay} className="w-full bg-neon-teal/20 hover:bg-neon-teal/30 text-neon-teal border border-neon-teal font-bold py-2 px-4 rounded transition">{isPlaying ? 'Stop' : 'Play'}</button>
                <canvas ref={canvasRef} height="100" className="bg-base-100/50 rounded-lg w-full mt-4" />
                <div className="flex items-center space-x-2 p-2 rounded-lg bg-base-100/50 justify-center">
                    <label className="text-text-secondary">Visualizer:</label>
                    <button onClick={() => setVisualizerMode('frequency')} className={`px-3 py-1 text-sm rounded ${visualizerMode === 'frequency' ? 'bg-neon-teal/30 text-neon-teal' : ''}`}>Frequency</button>
                    <button onClick={() => setVisualizerMode('waveform')} className={`px-3 py-1 text-sm rounded ${visualizerMode === 'waveform' ? 'bg-neon-teal/30 text-neon-teal' : ''}`}>Waveform</button>
                </div>
            </FuturisticCard>

            <FuturisticCard title="Effects Chain" description="Drag and drop to reorder effects.">
                <div className="space-y-2">
                    {activeEffects.map((effect, index) => (
                        <div 
                            key={effect.id} 
                            className="bg-base-100/50 p-3 rounded-lg border border-neon-teal/20"
                            draggable
                            onDragStart={() => dragItem.current = index}
                            onDragEnter={() => dragOverItem.current = index}
                            onDragEnd={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                        >
                            <div className="flex justify-between items-center cursor-move">
                                <h4 className="font-bold text-text-primary">{effect.type}</h4>
                                <button onClick={() => removeEffect(effect.id)} className="text-neon-red/70 hover:text-neon-red">✖</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                {effect.type === 'Filter' && <>
                                    <ParameterSlider label="Frequency" value={effect.params.frequency} onChange={v => handleParamChange(effect.id, 'frequency', v)} min={20} max={20000} step={1} unit="hz"/>
                                    <ParameterSlider label="Q-Factor" value={effect.params.q} onChange={v => handleParamChange(effect.id, 'q', v)} min={0.1} max={20} step={0.1}/>
                                </>}
                                 {effect.type === 'Delay' && <>
                                    <ParameterSlider label="Time" value={effect.params.time} onChange={v => handleParamChange(effect.id, 'time', v)} min={0} max={2} step={0.01} unit="s"/>
                                    <ParameterSlider label="Feedback" value={effect.params.feedback} onChange={v => handleParamChange(effect.id, 'feedback', v)} min={0} max={0.95} step={0.01}/>
                                </>}
                                {effect.type === 'Reverb' && <>
                                    <ParameterSlider label="Mix" value={effect.params.mix} onChange={v => handleParamChange(effect.id, 'mix', v)} min={0} max={1} step={0.01}/>
                                </>}
                            </div>
                        </div>
                    ))}
                    {activeEffects.length === 0 && <p className="text-center text-text-secondary italic">No effects added</p>}
                </div>
                <div className="flex flex-wrap gap-2 pt-4 border-t border-neon-teal/20">
                    <button onClick={() => addEffect('Filter')} className="bg-base-300/50 hover:bg-base-300/80 text-text-primary px-3 py-1 rounded">Add Filter</button>
                    <button onClick={() => addEffect('Delay')} className="bg-base-300/50 hover:bg-base-300/80 text-text-primary px-3 py-1 rounded">Add Delay</button>
                    <button onClick={() => addEffect('Reverb')} className="bg-base-300/50 hover:bg-base-300/80 text-text-primary px-3 py-1 rounded">Add Reverb</button>
                </div>
            </FuturisticCard>
        </div>
    );
};

export default AudioEffectsExample;
