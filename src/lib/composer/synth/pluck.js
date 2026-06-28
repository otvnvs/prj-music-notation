// ../synth/pluck.js
export class Pluck {
  triggerZone(ctx, freq, startTime, duration) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, startTime);
    
    // Pluck profile: Immediate loud attack, exponential decay to silent
    gain.gain.setValueAtTime(0.4, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4); 
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
  }
}

