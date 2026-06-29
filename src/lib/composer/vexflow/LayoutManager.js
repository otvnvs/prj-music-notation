import { STEP, PITCH_MAP } from './constants.js';

const DURATION_SPACE_MAP = {
  'w': 48, 'h': 34, 'q': 24, 'e': 18, '16': 14, '32': 11
};

/**
 * Calculates layout positions (nx, ny, sx, ey) for notes within a measure.
 * This class handles geometry without touching DOM or string elements.
 */
export class LayoutManager {
  static computeMeasureLayout(voice, mStartX, startY, measureWidth, factoryState) {
    const len = voice.n.length;
    if (!len) return [];

    // 1. Calculate structural width footprint
    let totalMeasureWidthUnits = 0;
    const noteWidthAllocations = voice.n.map(n => {
      let baseAlloc = DURATION_SPACE_MAP[n.d] || DURATION_SPACE_MAP['q'];
      if (n.a) baseAlloc += 12; // Buffer padding for accidentals
      if (n.isDotted) baseAlloc += 6;
      if (n.isDoubleDotted) baseAlloc += 10;
      
      totalMeasureWidthUnits += baseAlloc;
      return baseAlloc;
    });

    // 2. Map coordinates proportionally across the canvas width
    const usableMeasureWidth = measureWidth - 30;
    let currentXOffset = mStartX + 18;

    return voice.n.map((n, idx) => {
      const allocatedSpaceUnit = noteWidthAllocations[idx];
      const proportionalXShare = (allocatedSpaceUnit / totalMeasureWidthUnits) * usableMeasureWidth;
      
      // Compute final x positions
      const nx = currentXOffset + (proportionalXShare * 0.15);
      currentXOffset += proportionalXShare;

      // Compute final y positions based on pitch maps
      const off = 34 - (n.o * 7 + PITCH_MAP[n.l]);
      const ny = startY + (2 * STEP) + (off * (STEP / 2));
      
      // Determine selection status
      const isNoteActive = (factoryState.absoluteMeasureIdx === factoryState.activeMeasureIdx && 
                            idx === factoryState.activeNoteIdx);
      const itemColor = isNoteActive ? '#dc2626' : '#000000';
      
      // Compute stem boundary paths
      const dir = n.s === 'up' ? -1 : 1;
      const sx = nx + (n.s === 'up' ? 4.8 : -4.8);
      const ey = ny + (dir * 26);

      return { n, idx, nx, ny, sx, ey, dir, itemColor, isNoteActive, isBeamed: false };
    });
  }
}

