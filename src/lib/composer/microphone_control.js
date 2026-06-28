export class MicrophoneController {
  constructor(audioPlayer) {
    this.player = audioPlayer;
    this.stream = null;
    this.audioCtx = null;
    this.analyser = null;
    this.isListening = false;
    
    // Algorithmic settings for straightforward percussive detection
    this.threshold = 55;          // Sensitivity floor (0-255 scale)
    this.lastPeakTime = 0;        // Timestamp tracking the last verified spike
    this.cooldownPeriod = 350;    // 350ms lock window to ignore piano string ringing
    this.rafId = null;
  }

  async start() {
    if (this.isListening) return;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = this.audioCtx.createMediaStreamSource(this.stream);
      
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);
      
      this.isListening = true;
      this.monitor();
    } catch (err) {
      console.error("Microphone hardware access denied or unavailable:", err.message);
      throw err;
    }
  }

  stop() {
    this.isListening = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
    }
    
    this.audioCtx = null;
    this.analyser = null;
  }

  monitor() {
    if (!this.isListening || !this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);

    let totalEnergy = 0;
    for (let i = 0; i < bufferLength; i++) {
      totalEnergy += dataArray[i];
    }
    const averageVolume = totalEnergy / bufferLength;
    const currentTime = performance.now();

    // Fire instantly when a clap registers outside of the active cooldown lockout
    if (averageVolume > this.threshold && (currentTime - this.lastPeakTime) > this.cooldownPeriod) {
      this.lastPeakTime = currentTime;
      this.player.backMeasure();
    }

    this.rafId = requestAnimationFrame(() => this.monitor());
  }
}
