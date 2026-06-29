import { createPolygon } from './svgBuilder.js';
import { STEP } from './constants.js';

export function renderBeams(noteGeometries) {
  let sStr = '';
  let beamGroup = [];
  
  // Rule threshold: Stems must be at least 2.75 staff steps long to prevent notehead-to-beam collisions
  const MIN_STEM_LENGTH = 2.75 * STEP; // 22px

  for (let i = 0; i <= noteGeometries.length; i++) {
    const geom = noteGeometries[i];
    const canBeam = geom && !geom.n.isRest && (geom.n.d === 'e' || geom.n.d === '16' || geom.n.d === '32');

    if (canBeam) {
      beamGroup.push(geom);
    } else {
      if (beamGroup.length >= 2) {
        const first = beamGroup[0];
        const last = beamGroup[beamGroup.length - 1];
        const runDistance = last.sx - first.sx;
        
        // 1. Calculate the initial base slope
        let slope = runDistance !== 0 ? (last.ey - first.ey) / runDistance : 0;
        
        // 2. Scan every note in the group to find the worst notehead collision threat
        let maxAdjustmentNeeded = 0;
        const stemDirection = first.dir; // -1 for Up, 1 for Down

        beamGroup.forEach((bgItem) => {
          const progressFactor = bgItem.sx - first.sx;
          // Calculate where the beam line naturally lands on this X coordinate
          const projectedBeamY = first.ey + (slope * progressFactor);
          
          // Current physical length of this stem before adjustment
          const currentStemLength = Math.abs(projectedBeamY - bgItem.ny);
          
          // If the stem is too short, track how far out we need to push it
          if (currentStemLength < MIN_STEM_LENGTH) {
            const shortage = MIN_STEM_LENGTH - currentStemLength;
            if (shortage > maxAdjustmentNeeded) {
              maxAdjustmentNeeded = shortage;
            }
          }
        });

        // 3. Apply the corrective vertical buffer shift to the anchor endpoints
        if (maxAdjustmentNeeded > 0) {
          // Push beam UP (negative) if stems go up, push beam DOWN (positive) if stems go down
          const structuralShift = stemDirection * maxAdjustmentNeeded;
          first.ey += structuralShift;
          last.ey += structuralShift;
          
          // Re-calculate the final adjusted slope based on the updated safe coordinates
          slope = runDistance !== 0 ? (last.ey - first.ey) / runDistance : 0;
        }

        // 4. Align all beams cleanly to the safe layout line
        beamGroup.forEach((bgItem) => {
          bgItem.isBeamed = true;
          const progressFactor = bgItem.sx - first.sx;
          bgItem.ey = first.ey + (slope * progressFactor);
        });

        // 5. Draw primary beam polygon
        sStr += createPolygon(`${first.sx},${first.ey} ${last.sx},${last.ey} ${last.sx},${last.ey + 3.5} ${first.sx},${first.ey + 3.5}`, first.itemColor);

        // 6. Draw sub-division secondary beams (16th / 32nd notes)
        const beamDir = first.dir === -1 ? 1 : -1;
        const beamGap = beamDir * 5;

        for (let b = 0; b < beamGroup.length - 1; b++) {
          const curr = beamGroup[b];
          const next = beamGroup[b + 1];
          
          const supports16 = (curr.n.d === '16' || curr.n.d === '32') && (next.n.d === '16' || next.n.d === '32');
          if (supports16) {
            const cy1 = curr.ey + beamGap;
            const ny1 = next.ey + beamGap;
            sStr += createPolygon(`${curr.sx},${cy1} ${next.sx},${ny1} ${next.sx},${ny1 + 3.5} ${curr.sx},${cy1 + 3.5}`, first.itemColor);
          }

          const supports32 = (curr.n.d === '32' && next.n.d === '32');
          if (supports32) {
            const cy2 = curr.ey + (beamGap * 2);
            const ny2 = next.ey + (beamGap * 2);
            sStr += createPolygon(`${curr.sx},${cy2} ${next.sx},${ny2} ${next.sx},${ny2 + 3.5} ${curr.sx},${cy2 + 3.5}`, first.itemColor);
          }
        }
      } else if (beamGroup.length === 1) {
        beamGroup[0].isBeamed = false;
      }
      beamGroup = [];
    }
  }
  return sStr;
}

