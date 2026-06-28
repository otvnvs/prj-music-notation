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

export class ScorePlayer {
  constructor() {
    this.ctx = null;
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

  initAudio() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  setBpm(newBpm) {
    this.bpm = newBpm;
    if (this.rawScoreString) this.reloadDurationsOnly();
  }

  setLoop(enabled) {
    this.isLooping = enabled;
    this.notify();
  }

  // UPDATED: Multi-threading safety layer alters structures without forcing stops
  loadScore(scoreString) {
    this.rawScoreString = scoreString;
    
    // Parse structural measures out safely
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

    // Guard matrix ranges against truncated textbox modifications
    if (this.currentMeasureIdx >= this.measures.length) {
      this.currentMeasureIdx = Math.max(0, this.measures.length - 1);
      this.currentNoteIdx = 0;
    }
    this.notify();
  }

  reloadDurationsOnly() {
    const beatDuration = 60 / this.bpm;
    this.measures.forEach(m => {
      m.forEach(note => {
        if (note.durToken === 'w') note.seconds = beatDuration * 4;
        else if (note.durToken === 'h') note.seconds = beatDuration * 2;
        else if (note.durToken === 'e') note.seconds = beatDuration * 0.5;
        else note.seconds = beatDuration;
      });
    });
  }

  play(onStateChange) {
    this.initAudio();
    if (this.ctx.state === 'suspended') this.ctx.resume();
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

  pause() {
    if (!this.isPlaying || this.isPaused) return;
    this.isPaused = true;
    if (this.timerId) clearTimeout(this.timerId);
    this.notify();
  }

  stop() {
    this.isPlaying = false;
    this.isPaused = false;
    if (this.timerId) clearTimeout(this.timerId);
    this.currentMeasureIdx = 0;
    this.currentNoteIdx = 0;
    this.notify();
  }

  rewind() {
    this.currentMeasureIdx = 0;
    this.currentNoteIdx = 0;
    if (this.isPlaying && !this.isPaused) {
      this.scheduledTime = this.ctx ? this.ctx.currentTime + 0.05 : 0;
    }
    this.notify();
  }

  forwardMeasure() {
    if (this.currentMeasureIdx < this.measures.length - 1) {
      this.currentMeasureIdx++;
      this.currentNoteIdx = 0;
      if (this.isPlaying && !this.isPaused) this.scheduledTime = this.ctx.currentTime + 0.05;
      this.notify();
    }
  }

  backMeasure() {
    if (this.currentMeasureIdx > 0) {
      this.currentMeasureIdx--;
      this.currentNoteIdx = 0;
      if (this.isPlaying && !this.isPaused) this.scheduledTime = this.ctx.currentTime + 0.05;
      this.notify();
    }
  }

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
      
      // Secondary array range guard layer handles real-time mid-bar deletion safely
      if (!currentMeasure || this.currentNoteIdx >= currentMeasure.length) {
        this.currentMeasureIdx++;
        this.currentNoteIdx = 0;
        continue;
      }
      const note = currentMeasure[this.currentNoteIdx];
      if (note && note.freq) this.playTone(note.freq, this.scheduledTime, note.seconds);
      this.scheduledTime += note.seconds;
      this.currentNoteIdx++;
      this.notify();
    }
    this.timerId = setTimeout(() => this.scheduler(), 25);
  }

  playTone(freq, startTime, duration) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.25, startTime + 0.01);
    gain.gain.setValueAtTime(0.25, startTime + duration - 0.04);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

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
