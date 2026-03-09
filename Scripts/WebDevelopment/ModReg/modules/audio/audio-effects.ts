
import { getAudioContext } from './audio-utils';

export type EffectNode = BiquadFilterNode | GainNode | DelayNode | DynamicsCompressorNode | StereoPannerNode | ConvolverNode;

/**
 * Creates a Gain node.
 */
export const createGain = (context: AudioContext): GainNode => {
    return context.createGain();
};

/**
 * Creates a BiquadFilter node.
 */
export const createFilter = (context: AudioContext): BiquadFilterNode => {
    return context.createBiquadFilter();
};

/**
 * Creates a Delay node with a feedback loop.
 * @returns An object containing the input node, output node, and the delay node itself for parameter control.
 */
export const createDelay = (context: AudioContext): { input: GainNode; output: GainNode; delayNode: DelayNode; feedbackNode: GainNode } => {
    const input = context.createGain();
    const output = context.createGain();
    const delayNode = context.createDelay(5.0); // Max delay of 5 seconds
    const feedbackNode = context.createGain();
    
    input.connect(delayNode);
    delayNode.connect(feedbackNode);
    feedbackNode.connect(delayNode); // The feedback connection
    
    input.connect(output); // Dry signal
    delayNode.connect(output); // Wet signal

    return { input, output, delayNode, feedbackNode };
};

/**
 * Creates a StereoPanner node.
 */
export const createPanner = (context: AudioContext): StereoPannerNode => {
    // For wider browser support, check for createStereoPanner existence.
    if (context.createStereoPanner) {
        return context.createStereoPanner();
    }
    // Basic fallback for older browsers.
    return (context as any).createPanner();
};

/**
 * Creates a DynamicsCompressor node.
 */
export const createCompressor = (context: AudioContext): DynamicsCompressorNode => {
    return context.createDynamicsCompressor();
};

/**
 * Creates a Reverb effect using a ConvolverNode and a programmatically generated impulse response.
 * @returns An object containing the input/output nodes, the convolver, and wet/dry gain nodes for mixing.
 */
export const createReverb = (context: AudioContext, duration: number = 2, decay: number = 2): { input: GainNode; output: GainNode; convolver: ConvolverNode; wet: GainNode, dry: GainNode } => {
    const convolver = context.createConvolver();
    const sampleRate = context.sampleRate;
    const length = sampleRate * duration;
    const impulse = context.createBuffer(2, length, sampleRate);

    const impulseL = impulse.getChannelData(0);
    const impulseR = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
        const n = length - i;
        impulseL[i] = (Math.random() * 2 - 1) * Math.pow(n / length, decay);
        impulseR[i] = (Math.random() * 2 - 1) * Math.pow(n / length, decay);
    }
    convolver.buffer = impulse;

    const input = context.createGain();
    const wet = context.createGain();
    const dry = context.createGain();
    const output = context.createGain();

    input.connect(dry);
    input.connect(convolver);
    convolver.connect(wet);

    dry.connect(output);
    wet.connect(output);
    
    dry.gain.value = 0.5;
    wet.gain.value = 0.5;

    return { input, output, convolver, wet, dry };
};

/**
 * Connects an array of AudioNodes in sequence.
 * @param nodes The AudioNodes to connect in order.
 */
export const connectNodes = (...nodes: AudioNode[]): void => {
    for (let i = 0; i < nodes.length - 1; i++) {
        if (nodes[i] && nodes[i+1]) {
           nodes[i].connect(nodes[i+1]);
        }
    }
};

/**
 * Disconnects all outgoing connections from a set of AudioNodes.
 * @param nodes The AudioNodes to disconnect.
 */
export const disconnectNodes = (...nodes: AudioNode[]): void => {
    for (const node of nodes) {
        if (node) {
            node.disconnect();
        }
    }
};
