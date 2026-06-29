//function parseNoteToFrequency(noteStr) {
//  const m = noteStr.match(/([A-G])(#|b)?(\d+)/);
//  if (!m) return null;
//  const letter = m[1];
//  const accidental = m[2] || '';
//  const octave = parseInt(m[3], 10);
//  const baseOffsets = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
//  let midiNote = 12 * (octave + 1) + baseOffsets[letter];
//  if (accidental === '#') midiNote += 1;
//  else if (accidental === 'b') midiNote -= 1;
//  return 440 * Math.pow(2, (midiNote - 69) / 12);
//}
//
//export class ScorePlayer {
//  constructor() {
//    this.ctx = null;
//    this.bpm = 120;
//    this.isPlaying = false;
//    this.isPaused = false;
//    this.isLooping = false;
//    this.measures = [];
//    this.currentMeasureIdx = 0;
//    this.currentNoteIdx = 0;
//    this.scheduledTime = 0;
//    this.timerId = null;
//    this.onStateChangeCallback = null;
//    this.rawScoreString = '';
//  }
//
//  initAudio() {
//    if (!this.ctx) {
//      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
//    }
//  }
//
//  setBpm(newBpm) {
//    this.bpm = newBpm;
//    if (this.rawScoreString) this.reloadDurationsOnly();
//  }
//
//  setLoop(enabled) {
//    this.isLooping = enabled;
//    this.notify();
//  }
//
//  // UPDATED: Multi-threading safety layer alters structures without forcing stops
//  loadScore(scoreString) {
//    this.rawScoreString = scoreString;
//    
//    // Parse structural measures out safely
//    const parsedMeasures = scoreString.split('|').map(m => {
//      const tokens = m.trim().split(',').map(t => t.trim()).filter(t => t.length > 0);
//      return tokens.map(t => {
//        const [pitch, duration] = t.split('/');
//        const durToken = duration || 'q';
//        return {
//          pitch,
//          duration: durToken,
//          freq: parseNoteToFrequency(pitch),
//          durToken: durToken
//        };
//      });
//    }).filter(m => m.length > 0);
//
//    this.measures = parsedMeasures;
//    this.reloadDurationsOnly();
//
//    // Guard matrix ranges against truncated textbox modifications
//    if (this.currentMeasureIdx >= this.measures.length) {
//      this.currentMeasureIdx = Math.max(0, this.measures.length - 1);
//      this.currentNoteIdx = 0;
//    }
//    this.notify();
//  }
//
//  reloadDurationsOnly() {
//    const beatDuration = 60 / this.bpm;
//    this.measures.forEach(m => {
//      m.forEach(note => {
//        if (note.durToken === 'w') note.seconds = beatDuration * 4;
//        else if (note.durToken === 'h') note.seconds = beatDuration * 2;
//        else if (note.durToken === 'e') note.seconds = beatDuration * 0.5;
//        else note.seconds = beatDuration;
//      });
//    });
//  }
//
//  play(onStateChange) {
//    this.initAudio();
//    if (this.ctx.state === 'suspended') this.ctx.resume();
//    this.onStateChangeCallback = onStateChange;
//    if (this.isPlaying && this.isPaused) {
//      this.isPaused = false;
//      this.scheduler();
//      this.notify();
//      return;
//    }
//    if (this.isPlaying) return;
//    this.isPlaying = true;
//    this.isPaused = false;
//    this.scheduledTime = this.ctx.currentTime + 0.05;
//    this.scheduler();
//    this.notify();
//  }
//
//  pause() {
//    if (!this.isPlaying || this.isPaused) return;
//    this.isPaused = true;
//    if (this.timerId) clearTimeout(this.timerId);
//    this.notify();
//  }
//
//  stop() {
//    this.isPlaying = false;
//    this.isPaused = false;
//    if (this.timerId) clearTimeout(this.timerId);
//    this.currentMeasureIdx = 0;
//    this.currentNoteIdx = 0;
//    this.notify();
//  }
//
//  rewind() {
//    this.currentMeasureIdx = 0;
//    this.currentNoteIdx = 0;
//    if (this.isPlaying && !this.isPaused) {
//      this.scheduledTime = this.ctx ? this.ctx.currentTime + 0.05 : 0;
//    }
//    this.notify();
//  }
//
//  forwardMeasure() {
//    if (this.currentMeasureIdx < this.measures.length - 1) {
//      this.currentMeasureIdx++;
//      this.currentNoteIdx = 0;
//      if (this.isPlaying && !this.isPaused) this.scheduledTime = this.ctx.currentTime + 0.05;
//      this.notify();
//    }
//  }
//
//  backMeasure() {
//    if (this.currentMeasureIdx > 0) {
//      this.currentMeasureIdx--;
//      this.currentNoteIdx = 0;
//      if (this.isPlaying && !this.isPaused) this.scheduledTime = this.ctx.currentTime + 0.05;
//      this.notify();
//    }
//  }
//
//  scheduler() {
//    if (!this.isPlaying || this.isPaused) return;
//    while (this.scheduledTime < this.ctx.currentTime + 0.1) {
//      if (this.currentMeasureIdx >= this.measures.length) {
//        if (this.isLooping) {
//          this.currentMeasureIdx = 0;
//          this.currentNoteIdx = 0;
//        } else {
//          this.stop();
//          return;
//        }
//      }
//      const currentMeasure = this.measures[this.currentMeasureIdx];
//      
//      // Secondary array range guard layer handles real-time mid-bar deletion safely
//      if (!currentMeasure || this.currentNoteIdx >= currentMeasure.length) {
//        this.currentMeasureIdx++;
//        this.currentNoteIdx = 0;
//        continue;
//      }
//      const note = currentMeasure[this.currentNoteIdx];
//      if (note && note.freq) this.playTone(note.freq, this.scheduledTime, note.seconds);
//      this.scheduledTime += note.seconds;
//      this.currentNoteIdx++;
//      this.notify();
//    }
//    this.timerId = setTimeout(() => this.scheduler(), 25);
//  }
//
//  playTone(freq, startTime, duration) {
//    const osc = this.ctx.createOscillator();
//    const gain = this.ctx.createGain();
//    osc.type = 'triangle';
//    osc.frequency.setValueAtTime(freq, startTime);
//    gain.gain.setValueAtTime(0, startTime);
//    gain.gain.linearRampToValueAtTime(0.25, startTime + 0.01);
//    gain.gain.setValueAtTime(0.25, startTime + duration - 0.04);
//    gain.gain.linearRampToValueAtTime(0, startTime + duration);
//    osc.connect(gain);
//    gain.connect(this.ctx.destination);
//    osc.start(startTime);
//    osc.stop(startTime + duration);
//  }
//
//  notify() {
//    if (this.onStateChangeCallback) {
//      this.onStateChangeCallback({
//        isPlaying: this.isPlaying,
//        isPaused: this.isPaused,
//        isLooping: this.isLooping,
//        currentMeasureIdx: this.currentMeasureIdx,
//        currentNoteIdx: this.currentNoteIdx,
//        totalMeasures: this.measures.length
//      });
//    }
//  }
//}
//--------------------------------------------------------------------------------
import { Organ as DEFAULT_SYNTH } from '../synth/organ.js';
//import { Pluck } from '../synth/pluck.js';
//import { Vangelis as DEFAULT_SYNTH } from '../synth/vangelis.js';
//import { Harpsichord as DEFAULT_SYNTH } from '../synth/harpsichord.js';

//const DEFAULT_SYNTH=Vangelis;

/**
 * Default Synth Instrument
 * Baseline safe-fallback synthesizer rendering a pure triangle waveform.
 */
//class DefaultSynth {
//  constructor() {
//    this.name = 'Default Synth';
//  }
//
//  /**
//   * Triggers a simple triangle tone
//   * @param {AudioContext} ctx 
//   * @param {number} freq 
//   * @param {number} startTime 
//   * @param {number} duration 
//   */
//  triggerZone(ctx, freq, startTime, duration) {
//    const osc = ctx.createOscillator();
//    const gain = ctx.createGain();
//    
//    osc.type = 'triangle';
//    osc.frequency.setValueAtTime(freq, startTime);
//    
//    gain.gain.setValueAtTime(0, startTime);
//    gain.gain.linearRampToValueAtTime(0.25, startTime + 0.01);
//    gain.gain.setValueAtTime(0.25, startTime + duration - 0.04);
//    gain.gain.linearRampToValueAtTime(0, startTime + duration);
//    
//    osc.connect(gain);
//    gain.connect(ctx.destination);
//    
//    osc.start(startTime);
//    osc.stop(startTime + duration);
//  }
//}



/**
 * Utility: Converts scientific pitch notation (e.g. "C4", "A#3", "Eb5") to absolute frequency in Hz.
 * @param {string} noteStr - The textual description of the pitch.
 * @returns {number|null} Frequency value or null if parsing fails.
 */
function parseNoteToFrequency(noteStr) {
  const m = noteStr.match(/([A-G])(#|b)?(\d+)/);
  if (!m) return null;
  
  const letter = m[1];
  const accidental = m[2] || '';
  const octave = parseInt(m[3], 10);
  
  const baseOffsets = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  let midiNote = 12 * (octave + 1) + baseOffsets[letter];
  
  if (accidental === '#') midiNote += 1;
  else if (accidental === 'b') midiNote -= 1;
  
  return 440 * Math.pow(2, (midiNote - 69) / 12);
}


/**
 * ScorePlayer Engine
 * Coordinates score-parsing, high-precision Web Audio lookahead loops, and modular synthesis routing.
 */
export class ScorePlayer {
  /**
   * @param {Object} [instrumentInstance] - Synthesizer module. Defaults to a DEFAULT_SYNTH instance.
   */
  constructor(instrumentInstance = null) {
    this.ctx = null;
    this.instrument = instrumentInstance || new DEFAULT_SYNTH();
    this.bpm = 120;
    this.isPlaying = false;
    this.isPaused = false;
    this.isLooping = false;
    this.measures = [];
    this.currentMeasureIdx = 0;
    this.currentNoteIdx = 0;
    this.scheduledTime = 0;
    this.timerId = null;
    this.onStateChangeCallback = null;
    this.rawScoreString = '';
  }

  /**
   * Lazily boots or activates the global Web Audio target context.
   */
  initAudio() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  /**
   * Sets the playback tracking speed in beats per minute.
   * @param {number} newBpm 
   */
  setBpm(newBpm) {
    this.bpm = newBpm;
    if (this.rawScoreString) {
      this.reloadDurationsOnly();
    }
  }

  /**
   * Dynamically switches or injects alternative synth modules during or before playback.
   * @param {Object} instrumentInstance 
   */
  setInstrument(instrumentInstance) {
    this.instrument = instrumentInstance || new DEFAULT_SYNTH();
  }

  /**
   * Configures whether playback restarts from index 0 upon score exhaustion.
   * @param {boolean} enabled 
   */
  setLoop(enabled) {
    this.isLooping = enabled;
    this.notify();
  }

  /**
   * Compiles plain musical strings into actionable timing arrays.
   * @param {string} scoreString 
   */
  loadScore(scoreString) {
    this.rawScoreString = scoreString;
    
    const parsedMeasures = scoreString.split('|').map(m => {
      const tokens = m.trim().split(',').map(t => t.trim()).filter(t => t.length > 0);
      return tokens.map(t => {
        const [pitch, duration] = t.split('/');
        const durToken = duration || 'q';
        return {
          pitch,
          duration: durToken,
          freq: parseNoteToFrequency(pitch),
          durToken: durToken
        };
      });
    }).filter(m => m.length > 0);

    this.measures = parsedMeasures;
    this.reloadDurationsOnly();

    if (this.currentMeasureIdx >= this.measures.length) {
      this.currentMeasureIdx = Math.max(0, this.measures.length - 1);
      this.currentNoteIdx = 0;
    }
    this.notify();
  }

  /**
   * Dynamically recalibrates note step profiles when target BPM drifts.
   */

  
  
 reloadDurationsOnly() {
  const beatDuration = 60 / this.bpm;
  this.measures.forEach(m => {
    m.forEach(note => {
      if (note.durToken === 'w') {
        note.seconds = beatDuration * 4;
      } else if (note.durToken === 'h') {
        note.seconds = beatDuration * 2;
      } else if (note.durToken === 'e') {
        note.seconds = beatDuration * 0.5;
      } else if (note.durToken === '16') {
        note.seconds = beatDuration * 0.25;  // 4 notes per beat
      } else if (note.durToken === '32') {
        note.seconds = beatDuration * 0.125; // 8 notes per beat
      } else {
        note.seconds = beatDuration;         // default 'q'
      }
    });
  });
}

  
  
  
  /**
   * Initiates scheduler intervals or unpauses sleeping setups.
   * @param {Function} onStateChange - Realtime telemetry updates distribution channel.
   */
  play(onStateChange) {
    this.initAudio();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    
    this.onStateChangeCallback = onStateChange;

    if (this.isPlaying && this.isPaused) {
      this.isPaused = false;
      this.scheduler();
      this.notify();
      return;
    }

    if (this.isPlaying) return;

    this.isPlaying = true;
    this.isPaused = false;
    this.scheduledTime = this.ctx.currentTime + 0.05;
    this.scheduler();
    this.notify();
  }

  /**
   * Halts processing pipelines locally without resetting step coordinates.
   */
  pause() {
    if (!this.isPlaying || this.isPaused) return;
    this.isPaused = true;
    if (this.timerId) clearTimeout(this.timerId);
    this.notify();
  }

  /**
   * Total stop routine. Breaks execution patterns and reverts progress markers to 0.
   */
  stop() {
    this.isPlaying = false;
    this.isPaused = false;
    if (this.timerId) clearTimeout(this.timerId);
    this.currentMeasureIdx = 0;
    this.currentNoteIdx = 0;
    this.notify();
  }

  /**
   * Jumps tracking heads to index positions immediately.
   */
  rewind() {
    this.currentMeasureIdx = 0;
    this.currentNoteIdx = 0;
    if (this.isPlaying && !this.isPaused) {
      this.scheduledTime = this.ctx ? this.ctx.currentTime + 0.05 : 0;
    }
    this.notify();
  }

  /**
   * Skips tracking heads forward exactly one bar index boundary.
   */
  forwardMeasure() {
    if (this.currentMeasureIdx < this.measures.length - 1) {
      this.currentMeasureIdx++;
      this.currentNoteIdx = 0;
      if (this.isPlaying && !this.isPaused) {
        this.scheduledTime = this.ctx.currentTime + 0.05;
      }
      this.notify();
    }
  }

  /**
   * Restores tracking heads backward exactly one bar index boundary.
   */
  backMeasure() {
    if (this.currentMeasureIdx > 0) {
      this.currentMeasureIdx--;
      this.currentNoteIdx = 0;
      if (this.isPlaying && !this.isPaused) {
        this.scheduledTime = this.ctx.currentTime + 0.05;
      }
      this.notify();
    }
  }

  /**
   * Lookahead timing calculation generator. 
   * Orchestrates chronological node triggering across target steps.
   */
  scheduler() {
    if (!this.isPlaying || this.isPaused) return;

    while (this.scheduledTime < this.ctx.currentTime + 0.1) {
      if (this.currentMeasureIdx >= this.measures.length) {
        if (this.isLooping) {
          this.currentMeasureIdx = 0;
          this.currentNoteIdx = 0;
        } else {
          this.stop();
          return;
        }
      }

      const currentMeasure = this.measures[this.currentMeasureIdx];
      if (!currentMeasure || this.currentNoteIdx >= currentMeasure.length) {
        this.currentMeasureIdx++;
        this.currentNoteIdx = 0;
        continue;
      }

      const note = currentMeasure[this.currentNoteIdx];
      
      if (note && note.freq) {
        // Safe execution context via unified instrument interface strategy
        if (this.instrument && typeof this.instrument.triggerZone === 'function') {
          this.instrument.triggerZone(this.ctx, note.freq, this.scheduledTime, note.seconds);
        }
      }

      this.scheduledTime += note.seconds;
      this.currentNoteIdx++;
      this.notify();
    }

    this.timerId = setTimeout(() => this.scheduler(), 25);
  }

  /**
   * Transmits state tracking payloads back to bound callbacks.
   */
  notify() {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback({
        isPlaying: this.isPlaying,
        isPaused: this.isPaused,
        isLooping: this.isLooping,
        currentMeasureIdx: this.currentMeasureIdx,
        currentNoteIdx: this.currentNoteIdx,
        totalMeasures: this.measures.length
      });
    }
  }
}

