export class Pluck{
    constructor() {
        this.name = 'PluckSynth';
    }

    triggerZone(ctx, freq, startTime, duration) {
        // 1. Reverb / Delay Configuration
        const roomSize = 0.85;
        const wetMix = 0.15;  // Lowered from 0.35 to keep the pluck punchy
        const dryMix = 0.70;
        const decayTime = 0.4; // How long the string rings out

        // 2. Create Core Nodes
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const masterGain = ctx.createGain();

        // 3. Configure Sound Source
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, startTime);

        // 4. Filter Envelope
        filter.type = 'lowpass';
        filter.Q.setValueAtTime(4, startTime);
        filter.frequency.setValueAtTime(freq * 8, startTime);
        filter.frequency.exponentialRampToValueAtTime(freq * 1.5, startTime + 0.15);

        // 5. Amplitude Envelope
        masterGain.gain.setValueAtTime(0, startTime);
        masterGain.gain.linearRampToValueAtTime(0.4, startTime + 0.005);
        masterGain.gain.exponentialRampToValueAtTime(0.001, startTime + decayTime);

        // 6. Setup Reverb / Routing Branches
        const dryBranch = ctx.createGain();
        const wetBranch = ctx.createGain();
        dryBranch.gain.setValueAtTime(dryMix, startTime);
        wetBranch.gain.setValueAtTime(wetMix, startTime);

        // 7. Build Feedback Delay Network
        const delayTimes = [0.029, 0.037, 0.043];
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

        // 8. Final Connections
        masterGain.connect(dryBranch);
        dryBranch.connect(ctx.destination);
        wetBranch.connect(ctx.destination);
        osc.connect(filter);
        filter.connect(masterGain);

        // 9. Lifecycle (Includes tail padding for the reverb to fade out)
        osc.start(startTime);
        const tailPadding = roomSize * 1.5;
        osc.stop(startTime + decayTime + tailPadding);
    }
}

