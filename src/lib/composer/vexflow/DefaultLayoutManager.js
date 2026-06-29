import { STEP, PITCH_MAP } from './constants.js';

/**
 * Implements the original layout strategy: Equal-width divisions for all notes.
 */
export class DefaultLayoutManager {
  static computeMeasureLayout(voice, mStartX, startY, measureWidth, factoryState) {
    const len = voice.n.length;
    if (!len) return [];

    // The original layout logic: divide the width equally among note tokens
    const space = (measureWidth - 25) / Math.max(1, len);

    return voice.n.map((n, idx) => {
      // Linear coordinate placement
      const nx = mStartX + 15 + (idx * space);

      // Compute vertical coordinates based on pitch offsets
      const off = 34 - (n.o * 7 + PITCH_MAP[n.l]);
      const ny = startY + (2 * STEP) + (off * (STEP / 2));
      
      // Determine selection highlighting colors
      const isNoteActive = (factoryState.absoluteMeasureIdx === factoryState.activeMeasureIdx && 
                            idx === factoryState.activeNoteIdx);
      const itemColor = isNoteActive ? '#dc2626' : '#000000';
      
      // Compute stem paths
      const dir = n.s === 'up' ? -1 : 1;
      const sx = nx + (n.s === 'up' ? 4.8 : -4.8);
      const ey = ny + (dir * 26);

      return { n, idx, nx, ny, sx, ey, dir, itemColor, isNoteActive, isBeamed: false };
    });
  }
}

