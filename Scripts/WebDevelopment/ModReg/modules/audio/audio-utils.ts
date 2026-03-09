let audioContext: AudioContext | null = null;

/**
 * Safely creates and returns a singleton AudioContext.
 * Handles the suspended state by resuming on user interaction.
 * @returns A singleton AudioContext instance.
 */
export const getAudioContext = (): AudioContext => {
  if (audioContext === null) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  // If context is suspended, resume it on the first user gesture.
  if (audioContext.state === 'suspended') {
      audioContext.resume();
  }
  return audioContext;
};

/**
 * Plays a simple tone using an OscillatorNode.
 * @param freq The frequency of the tone in Hz.
 * @param duration The duration of the tone in seconds.
 * @param type The waveform type ('sine', 'square', 'sawtooth', 'triangle').
 */
export const playFrequency = (freq: number, duration: number, type: OscillatorType = 'sine'): void => {
  const context = getAudioContext();
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(freq, context.currentTime);
  
  // Fade out to prevent clicking
  gainNode.gain.setValueAtTime(1, context.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.start(context.currentTime);
  oscillator.stop(context.currentTime + duration);
};

/**
 * Requests microphone access and returns a promise that resolves with a MediaStreamAudioSourceNode.
 * @param context The AudioContext to connect the source to.
 * @returns A promise resolving to the microphone source node.
 */
export const createMicrophoneSource = async (context: AudioContext): Promise<{ source: MediaStreamAudioSourceNode, stream: MediaStream }> => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser API navigator.mediaDevices.getUserMedia not available');
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = context.createMediaStreamSource(stream);
    return { source, stream };
};

/**
 * Creates and configures an AnalyserNode.
 * @param context The AudioContext.
 * @param fftSize The FFT size (power of 2, e.g., 2048).
 * @returns A new AnalyserNode.
 */
export const createAnalyser = (context: AudioContext, fftSize: number = 2048): AnalyserNode => {
    const analyser = context.createAnalyser();
    analyser.fftSize = fftSize;
    return analyser;
};

/**
 * Gets the frequency data from an analyser into a Uint8Array.
 * @param analyser The AnalyserNode to get data from.
 * @returns A Uint8Array containing the frequency data.
 */
export const getFrequencyData = (analyser: AnalyserNode): Uint8Array => {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);
    return dataArray;
};

/**
 * Gets the time-domain (waveform) data from an analyser into a Uint8Array.
 * @param analyser The AnalyserNode to get data from.
 * @returns A Uint8Array containing the waveform data.
 */
export const getWaveformData = (analyser: AnalyserNode): Uint8Array => {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);
    return dataArray;
};
