// ../synth/effects.js

/**
 * ReverbEffect Class
 * Creates a permanent, stable parallel-delay algorithmic space matrix.
 */
export class ReverbEffect {
  constructor(ctx) {
    this.ctx = ctx;
    this.input = ctx.createGain();
    this.output = ctx.createGain();
    
    const dryBranch = ctx.createGain();
    const wetBranch = ctx.createGain();
    
    dryBranch.gain.setValueAtTime(0.7, ctx.currentTime);
    wetBranch.gain.setValueAtTime(0.3, ctx.currentTime);

    // Parallel Delay Array
    const delays = [0.029, 0.037, 0.043];
    delays.forEach(delayTime => {
      const delayNode = ctx.createDelay();
      const feedbackNode = ctx.createGain();
      
      delayNode.delayTime.setValueAtTime(delayTime, ctx.currentTime);
      feedbackNode.gain.setValueAtTime(0.4, ctx.currentTime); // Safe under 1.0 limit
      
      this.input.connect(delayNode);
      delayNode.connect(feedbackNode);
      feedbackNode.connect(delayNode);
      delayNode.connect(wetBranch);
    });

    // Main structural path connections
    this.input.connect(dryBranch);
    dryBranch.connect(this.output);
    wetBranch.connect(this.output);
  }

  /**
   * Connects this effect block to another node (usually ctx.destination)
   */
  connect(destination) {
    this.output.connect(destination);
  }
}

