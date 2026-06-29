export class Harpsichord {
    constructor() {
        this.name = 'Harpsichord';
    }

    triggerZone(ctx, freq, startTime, duration) {
        // Kept your exact reverb settings and routing logic
        const roomSize = 0.85;
        const wetMix = 0.35;
        const dryMix = 0.70;

        // Harpsichord harmonics focus on bright, acoustic plucked string characteristics
        const harmonics =; 
        const gains = [0.35, 0.15, 0.05]; 

        // Master output node
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0, startTime);

        // --- HARPSICHORD ENVELOPE (PLUCKED ATTACK & DECAY) ---
        // Immediate, sharp pluck attack (0.002s instead of a gradual organ swell)
        masterGain.gain.linearRampToValueAtTime(0.4, startTime + 0.002);
        
        // Natural string decay during the note hold period
        masterGain.gain.linearRampToValueAtTime(0.1, startTime + duration);
        
        // Short dampening release when the key is let go (0.05s)
        masterGain.gain.linearRampToValueAtTime(0, startTime + duration + 0.05);

        // --- REVERB BRANCHES ---
        const dryBranch = ctx.createGain();
        const wetBranch = ctx.createGain();
        dryBranch.gain.setValueAtTime(dryMix, startTime);
        wetBranch.gain.setValueAtTime(wetMix, startTime);

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

        masterGain.connect(dryBranch);
        dryBranch.connect(ctx.destination);
        wetBranch.connect(ctx.destination);

        // --- SOUND GENERATION ---
        harmonics.forEach((multiplier, index) => {
            const osc = ctx.createOscillator();
            
            // Harpsichords are buzzy string instruments; sawtooth best replicates the pluck sound
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq * multiplier, startTime);

            // High-pass filter emulation: soften the extreme low rumble on high harmonics
            if (index > 0) {
                const biquad = ctx.createBiquadFilter();
                biquad.type = 'highpass';
                biquad.frequency.setValueAtTime(freq * 1.5, startTime);
                osc.connect(biquad);
                
                const oscGain = ctx.createGain();
                oscGain.gain.setValueAtTime(gains[index], startTime);
                biquad.connect(oscGain);
                oscGain.connect(masterGain);
            } else {
                const oscGain = ctx.createGain();
                oscGain.gain.setValueAtTime(gains[index], startTime);
                osc.connect(oscGain);
                oscGain.connect(masterGain);
            }

            osc.start(startTime);
            const tailPadding = roomSize * 1.5;
            osc.stop(startTime + duration + 0.05 + tailPadding);
        });
    }
}

