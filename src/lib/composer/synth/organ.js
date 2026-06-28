//// ../synth/organ.js
//
//export class Organ {
//  constructor() {
//    this.name = 'Organ';
//  }
//
//  /**
//   * Triggers a synthesized organ note
//   * @param {AudioContext} ctx - The shared AudioContext from the player
//   * @param {number} freq - Base frequency of the note in Hz
//   * @param {number} startTime - AudioContext timestamp to start playback
//   * @param {number} duration - Total length of the note in seconds
//   */
//  triggerZone(ctx, freq, startTime, duration) {
//    // Organs combine multiple harmonic drawbars (fundamental, sub, 3rd, etc.)
//    const harmonics = [0.5, 1, 2, 3]; 
//    const gains = [0.15, 0.25, 0.1, 0.05]; // Relative volumes
//    
//    const masterGain = ctx.createGain();
//    masterGain.gain.setValueAtTime(0, startTime);
//    masterGain.gain.linearRampToValueAtTime(0.3, startTime + 0.02); // Fast attack
//    masterGain.gain.setValueAtTime(0.3, startTime + duration - 0.02);
//    masterGain.gain.linearRampToValueAtTime(0, startTime + duration); // Fast release
//    masterGain.connect(ctx.destination);
//
//    harmonics.forEach((multiplier, index) => {
//      const osc = ctx.createOscillator();
//      const waveType = index === 0 ? 'sine' : 'triangle'; // Mix sine and triangle
//      
//      osc.type = waveType;
//      osc.frequency.setValueAtTime(freq * multiplier, startTime);
//      
//      const oscGain = ctx.createGain();
//      oscGain.gain.setValueAtTime(gains[index], startTime);
//      
//      osc.connect(oscGain);
//      oscGain.connect(masterGain);
//      
//      osc.start(startTime);
//      osc.stop(startTime + duration);
//    });
//  }
//}
//--------------------------------------------------------------------------------
// ../synth/organ.js

export class Organ {
  constructor() {
    this.name = 'Organ';
  }

  /**
   * Triggers a synthesized organ note with adjustable internal reverb parameters
   */
  triggerZone(ctx, freq, startTime, duration) {
    // ==========================================
    // TWEAK REVERB SETTINGS HERE
    // ==========================================
    const roomSize = 0.85; // [0.0 to 0.85] Higher = longer decay ring time
    const wetMix   = 0.35; // [0.0 to 1.0] Higher = louder reverb effect
    const dryMix   = 0.70; // [0.0 to 1.0] Higher = louder pure instrument tone
    // ==========================================

    const harmonics = [0.5, 1, 2, 3];
    const gains = [0.15, 0.25, 0.1, 0.05];

    // Master node for the raw organ harmonics
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, startTime);
    masterGain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
    masterGain.gain.setValueAtTime(0.3, startTime + duration - 0.02);
    masterGain.gain.linearRampToValueAtTime(0, startTime + duration);

    // Reverb split branches using your custom adjustable mixes
    const dryBranch = ctx.createGain();
    const wetBranch = ctx.createGain();

    dryBranch.gain.setValueAtTime(dryMix, startTime); 
    wetBranch.gain.setValueAtTime(wetMix, startTime); 

    // Safe, parallel delay matrix
    const delayTimes = [0.029, 0.037, 0.043];
    delayTimes.forEach(delayTime => {
      const delayNode = ctx.createDelay();
      const feedbackGain = ctx.createGain();

      delayNode.delayTime.setValueAtTime(delayTime, startTime);
      
      // Applies your custom room decay setting to the feedback loop safely
      feedbackGain.gain.setValueAtTime(roomSize, startTime); 

      masterGain.connect(delayNode);
      delayNode.connect(feedbackGain);
      feedbackGain.connect(delayNode);
      delayNode.connect(wetBranch);
    });

    // Connect everything to the speakers
    masterGain.connect(dryBranch);
    dryBranch.connect(ctx.destination);
    wetBranch.connect(ctx.destination);

    // Generate individual oscillators
    harmonics.forEach((multiplier, index) => {
      const osc = ctx.createOscillator();
      const waveType = index === 0 ? 'sine' : 'triangle';

      osc.type = waveType;
      osc.frequency.setValueAtTime(freq * multiplier, startTime);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(gains[index], startTime);

      osc.connect(oscGain);
      oscGain.connect(masterGain);

      osc.start(startTime);
      
      // Calculate how long to keep oscillators alive based on roomSize decay
      const tailPadding = roomSize * 1.5; 
      osc.stop(startTime + duration + tailPadding); 
    });
  }
}

