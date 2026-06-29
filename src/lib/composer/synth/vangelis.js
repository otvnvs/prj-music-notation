export class Vangelis {
    constructor() {
        this.name = 'Vangelis';
    }

    triggerZone(ctx, freq, startTime, duration) {
        // 1. Shorter Reverb Configuration (Punchier, less washed out)
        const roomSize = 0.75;
        const wetMix = 0.30; 
        const dryMix = 0.70;

        // 2. Create Audio Nodes
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        const masterGain = ctx.createGain();

        // 3. Vibrato (Slightly faster for short stabs)
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(6.0, startTime); 
        lfoGain.gain.setValueAtTime(1.5, startTime); // Reduced depth for a tighter sound
        
        lfo.connect(lfoGain);
        lfoGain.connect(osc1.frequency);
        lfoGain.connect(osc2.frequency);

        // 4. Detuned Dual Sawtooth Oscillators
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(freq - 2.0, startTime); // Tighter detuning

        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(freq + 2.0, startTime);

        // 5. Punchy Filter Envelope (Snaps open instantly, decays fast)
        filter.type = 'lowpass';
        filter.Q.setValueAtTime(3.5, startTime); // Higher resonance for more "bite"
        filter.frequency.setValueAtTime(freq * 1.5, startTime); 
        filter.frequency.linearRampToValueAtTime(freq * 6.0, startTime + 0.02); // 20ms snap attack
        filter.frequency.exponentialRampToValueAtTime(freq * 2.5, startTime + 0.15); // Fast filter decay

        // 6. Amplitude Envelope (Aggressive transient attack, shorter decay/release)
        masterGain.gain.setValueAtTime(0, startTime);
        masterGain.gain.linearRampToValueAtTime(0.4, startTime + 0.01); // 10ms transient punch
        masterGain.gain.setValueAtTime(0.4, startTime + duration - 0.02); // Sustain
        masterGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration + 0.3); // Shorter, tighter release

        // 7. Tighter Reverb Routing
        const dryBranch = ctx.createGain();
        const wetBranch = ctx.createGain();
        dryBranch.gain.setValueAtTime(dryMix, startTime);
        wetBranch.gain.setValueAtTime(wetMix, startTime);

        const delayTimes = [0.015, 0.023, 0.031]; // Shorter delay windows for crisp transients
        delayTimes.forEach(delayTime => {
            const delayNode = ctx.createDelay();
            const feedbackGain = ctx.createGain();

            delayNode.delayTime.setValueAtTime(delayTime, startTime);
            feedbackGain.gain.setValueAtTime(roomSize, startTime);

            masterGain.connect(delayNode);
            delayNode.connect(feedbackGain);
            feedbackGain.connect(delayNode);
            delayNode.connect(wetBranch);
        });

        // 8. Connections
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(masterGain);
        masterGain.connect(dryBranch);
        dryBranch.connect(ctx.destination);
        wetBranch.connect(ctx.destination);

        // 9. Playback Lifecycle
        lfo.start(startTime);
        osc1.start(startTime);
        osc2.start(startTime);
        
        const tailPadding = roomSize * 1.5;
        const totalDuration = duration + 0.3 + tailPadding;
        
        lfo.stop(startTime + totalDuration);
        osc1.stop(startTime + totalDuration);
        osc2.stop(startTime + totalDuration);
    }
}

