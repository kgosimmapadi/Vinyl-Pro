let audioContext: AudioContext | null = null;
let gainNode: GainNode | null = null;
let sourceNode: MediaElementAudioSourceNode | null = null;
let eqNodes: BiquadFilterNode[] = [];

const EQ_FREQUENCIES = [60, 230, 910, 4000, 14000];

/**
 * Initializes the Web Audio API context with EQ and Volume Boost.
 */
export const initAudioContext = (audioElement: HTMLAudioElement) => {
  if (sourceNode) return { audioContext, gainNode, eqNodes };

  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  audioContext = new AudioContextClass();
  
  sourceNode = audioContext.createMediaElementSource(audioElement);
  gainNode = audioContext.createGain();

  // Create EQ Nodes
  eqNodes = EQ_FREQUENCIES.map((freq, index) => {
    const node = audioContext!.createBiquadFilter();
    node.frequency.value = freq;
    node.type = index === 0 ? 'lowshelf' : index === EQ_FREQUENCIES.length - 1 ? 'highshelf' : 'peaking';
    node.gain.value = 0; // Flat by default
    return node;
  });

  // Connect the chain: Source -> EQ1 -> EQ2... -> Gain -> Destination
  let currentNode: AudioNode = sourceNode;
  eqNodes.forEach(node => {
    currentNode.connect(node);
    currentNode = node;
  });
  
  currentNode.connect(gainNode);
  gainNode.connect(audioContext.destination);

  return { audioContext, gainNode, eqNodes };
};

export const setBoostVolume = (volume: number) => {
  if (gainNode) {
    gainNode.gain.value = volume;
  }
};

export const setEQGain = (index: number, value: number) => {
  if (eqNodes[index]) {
    eqNodes[index].gain.value = value;
  }
};

export const resumeAudioContext = () => {
  if (audioContext?.state === 'suspended') {
    audioContext.resume();
  }
};