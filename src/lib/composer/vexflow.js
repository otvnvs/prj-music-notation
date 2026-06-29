class EasyScore {
  constructor(f) { this.f = f; }
  notes(s, o = {}) {
  return s.split(',').map(t => {
    const [p, rawD] = t.trim().split('/');
    const dToken = rawD || 'q';

    // 1. Intercept and flag dot token signatures
    const isDotted = dToken.indexOf('.') !== -1 && dToken.indexOf('..') === -1;
    const isDoubleDotted = dToken.indexOf('..') !== -1;

    // 2. Clean duration token (removes the dots so 'e.', '16..', etc., become 'e', '16')
    const d = dToken.replace(/\./g, '');

    const isRest = p.toUpperCase().startsWith('R');
    const m = !isRest ? p.match(/([A-G])(#|b)?(\d+)/) : null;

    return { 
      p, 
      d: d, 
      isRest,
      isDotted,
      isDoubleDotted,
      s: o.stem || 'auto', 
      l: m ? m[1] : 'B', 
      a: m && m[2] ? m[2] : '', 
      o: m && m[3] ? parseInt(m[3], 10) : 4 
    };
  });
}

  
  
  
  voice(n) { return { t: 'V', n }; }
}

class System {
  constructor(f) { this.f = f; this.staves = []; this.c = 'treble'; }
  addStave(c) { this.staves.push({ voices: c.voices || [] }); return this; }
  addClef(c) { this.c = c; return this; }
  addTimeSignature() { return this; }
}

class Factory {
  constructor(o = {}) { 
    this.o = o.renderer || {}; 
    this.s = null;
    this.activeMeasureIdx = o.activeMeasureIdx !== undefined ? o.activeMeasureIdx : -1;
    this.activeNoteIdx = o.activeNoteIdx !== undefined ? o.activeNoteIdx : -1;
  }
  EasyScore() { return new EasyScore(this); }
  System() { return this.s = new System(this); }
  
  draw() {
    const el = typeof this.o.elementId === 'string' ? document.getElementById(this.o.elementId) : this.o.elementId;
    if (!el || !this.s || !this.s.staves.length) return;

    const canvasWidth = this.o.width || 500;
    const step = 8; 
    const rowHeight = 90;  
    const clefWidth = 45;  
    
    const minMeasureWidth = canvasWidth < 500 ? 110 : 160;
    const availableWidthForMeasures = canvasWidth - clefWidth - 20;
    
    const measuresPerRow = Math.max(1, Math.floor(availableWidthForMeasures / minMeasureWidth));
    const measureWidth = availableWidthForMeasures / measuresPerRow;

    const totalStavesCount = this.s.staves.length;
    const numRows = Math.ceil(totalStavesCount / measuresPerRow);
    const canvasHeight = numRows * rowHeight + 30; 
    
    el.setAttribute("style", `display:block!important;width:${canvasWidth}px!important;height:${canvasHeight}px!important;overflow:visible;`);
    
    let sStr = `<svg width="${canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${canvasWidth} ${canvasHeight}" style="display:block;overflow:visible;background:transparent;">`;
    const M = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };

    for (let r = 0; r < numRows; r++) {
      const startY = 20 + (r * rowHeight);
      const staffTopY = startY;
      const staffBottomY = startY + (4 * step);
      
      sStr += `<g class="staff-row" data-row-index="${r}">`;
      
      const rowStaves = this.s.staves.slice(r * measuresPerRow, (r + 1) * measuresPerRow);

      rowStaves.forEach((stave, sIdx) => {
        const absoluteMeasureIdx = (r * measuresPerRow) + sIdx;
        const mStartX = clefWidth + (sIdx * measureWidth);
        if (absoluteMeasureIdx === this.activeMeasureIdx) {
          sStr += `<rect x="${mStartX}" y="${startY - 6}" width="${measureWidth}" height="${4 * step + 12}" fill="rgba(56, 189, 248, 0.22)" rx="4"/>`;
        }
      });

      for (let i = 0; i < 5; i++) {
        const y = startY + (i * step);
        sStr += `<line x1="10" y1="${y}" x2="${canvasWidth - 10}" y2="${y}" stroke="#000000" stroke-width="1.5"/>`;
      }
      
      const sym = this.s.c === 'treble' ? '𝄞' : '𝄢';
      sStr += `<text x="12" y="${startY + 29}" fill="#000000" style="font-size:52px;font-family:serif;dominant-baseline:alphabetic;">${sym}</text>`;
      sStr += `<line x1="10" y1="${startY}" x2="10" y2="${startY + (4 * step)}" stroke="#000000" stroke-width="1.5"/>`;

      rowStaves.forEach((stave, sIdx) => {
        const absoluteMeasureIdx = (r * measuresPerRow) + sIdx;
        const mStartX = clefWidth + (sIdx * measureWidth);
        const mEndX = mStartX + measureWidth;
        const isLastInRow = (sIdx === rowStaves.length - 1);
        const isAbsoluteLast = (absoluteMeasureIdx === totalStavesCount - 1);

        if (isAbsoluteLast || isLastInRow) {
          sStr += `<line x1="${canvasWidth - 10}" y1="${startY}" x2="${canvasWidth - 10}" y2="${startY + (4 * step)}" stroke="#000000" stroke-width="2"/>`;
        } else {
          sStr += `<line x1="${mEndX}" y1="${startY}" x2="${mEndX}" y2="${startY + (4 * step)}" stroke="#000000" stroke-width="1.5"/>`;
        }

		
		
		
		
		
	        stave.voices.forEach(v => {
          const len = v.n.length;
          if (!len) return;
          
          const space = (measureWidth - 25) / Math.max(1, len);
          
          // PHASE 1: INITIAL NOTE GEOMETRY EXTRACTION MAP
          const noteGeometries = v.n.map((n, idx) => {
            const nx = mStartX + 15 + (idx * space);
            const off = 34 - (n.o * 7 + M[n.l]);
            const ny = startY + (2 * step) + (off * (step / 2));
            const isNoteActive = (absoluteMeasureIdx === this.activeMeasureIdx && idx === this.activeNoteIdx);
            const itemColor = isNoteActive ? '#dc2626' : '#000000';
            
            const dir = n.s === 'up' ? -1 : 1;
            const sx = nx + (n.s === 'up' ? 4.5 : -4.5);
            let ey = ny + (dir * 26); // Default standalone stem length
            
            return { n, idx, nx, ny, sx, ey, dir, itemColor, isNoteActive, isBeamed: false };
          });

          // PHASE 2: BEAMING LOOKAHEAD AND DYNAMIC SUB-BEAM SEGMENTATION
     
	 
	 
	          // PHASE 2: BEAMING LOOKAHEAD AND DYNAMIC SUB-BEAM SEGMENTATION
          let beamGroup = [];
          for (let i = 0; i <= noteGeometries.length; i++) {
            const geom = noteGeometries[i];
            
            // Check if the node is eligible for macro beaming (e, 16, or 32)
            const canBeam = geom && !geom.n.isRest && (geom.n.d === 'e' || geom.n.d === '16' || geom.n.d === '32');
            
            if (canBeam) {
              beamGroup.push(geom);
            } else {
              // SAFETY FIX 1: Absolutely guarantee we have at least 2 distinct notes to form a line segment
              if (beamGroup.length >= 2) {
                const first = beamGroup[0];
                const last = beamGroup[beamGroup.length - 1];
                
                // SAFETY FIX 2: Safeguard against identical horizontal values (division by zero)
                const runDistance = last.sx - first.sx;
                const slope = runDistance !== 0 ? (last.ey - first.ey) / runDistance : 0;
                
                // Realign every single stem edge to target the boundary vector of the main beam line
                beamGroup.forEach((bgItem) => {
                  bgItem.isBeamed = true;
                  const progressFactor = bgItem.sx - first.sx;
                  bgItem.ey = first.ey + (slope * progressFactor);
                });

                // UNBROKEN PRIMARY BEAM (Layer 1 - runs continuously across the entire group)
                sStr += `<polygon points="${first.sx},${first.ey} ${last.sx},${last.ey} ${last.sx},${last.ey + 3.5} ${first.sx},${first.ey + 3.5}" fill="${first.itemColor}"/>`;
                
                const beamDir = first.dir === -1 ? 1 : -1;
                const beamGap = beamDir * 5; // 5px tracking distance between stacked parallel lines

                // DETACHED SUB-BEAM SEGMENTATION PASS
                for (let b = 0; b < beamGroup.length - 1; b++) {
                  const curr = beamGroup[b];
                  const next = beamGroup[b + 1];
                  
                  // Secondary Beam: Draws 16th lines exclusively if BOTH neighbouring notes require it
                  const supports16 = (curr.n.d === '16' || curr.n.d === '32') && (next.n.d === '16' || next.n.d === '32');
                  if (supports16) {
                    const cy1 = curr.ey + beamGap;
                    const ny1 = next.ey + beamGap;
                    sStr += `<polygon points="${curr.sx},${cy1} ${next.sx},${ny1} ${next.sx},${ny1 + 3.5} ${curr.sx},${cy1 + 3.5}" fill="${first.itemColor}"/>`;
                  }
                  
                  // Tertiary Beam: Draws 32nd lines exclusively if BOTH neighbouring notes require it
                  const supports32 = (curr.n.d === '32' && next.n.d === '32');
                  if (supports32) {
                    const cy2 = curr.ey + (beamGap * 2);
                    const ny2 = next.ey + (beamGap * 2);
                    sStr += `<polygon points="${curr.sx},${cy2} ${next.sx},${ny2} ${next.sx},${ny2 + 3.5} ${curr.sx},${cy2 + 3.5}" fill="${first.itemColor}"/>`;
                  }
                }
              } else if (beamGroup.length === 1) {
                // SAFETY FIX 3: Reset individual notes back to un-beamed status so they can fallback to standard flags
                beamGroup[0].isBeamed = false;
              }
              beamGroup = [];
            }
          }

	 
	 

          // PHASE 3: MAIN VECTOR VECTOR PIPELINE RENDERING PASS
          noteGeometries.forEach((geom) => {
            const { n, nx, ny, sx, ey, dir, itemColor, isBeamed } = geom;

            if (n.isRest) return;

            // Pixel-based ledger line layer
            if (ny >= staffBottomY + step) {
              for (let ly = staffBottomY + step; ly <= ny + 1; ly += step) {
                sStr += `<line x1="${nx - 8}" y1="${ly}" x2="${nx + 8}" y2="${ly}" stroke="${itemColor}" stroke-width="1.5"/>`;
              }
            } else if (ny <= staffTopY - step) {
              for (let ly = staffTopY - step; ly >= ny - 1; ly -= step) {
                sStr += `<line x1="${nx - 8}" y1="${ly}" x2="${nx + 8}" y2="${ly}" stroke="${itemColor}" stroke-width="1.5"/>`;
              }
            }
            
            if (n.a) {
              const accSym = n.a === '#' ? '♯' : '♭';
              sStr += `<text x="${nx - 10}" y="${ny + 4}" fill="${itemColor}" style="font-size:16px;font-family:serif;text-anchor:middle;font-weight:bold;">${accSym}</text>`;
            }
            
            const hol = n.d === 'w' || n.d === 'h';
            const innerFill = hol ? '#ffffff00' : itemColor;
            
            sStr += `<ellipse cx="${nx}" cy="${ny}" rx="5" ry="3.5" fill="${innerFill}" stroke="${itemColor}" stroke-width="2" transform="rotate(-20 ${nx} ${ny})"/>`;
            
            if (n.d !== 'w') {
              // Draw the note stem line segment (terminates cleanly right at the primary beam boundary)
              sStr += `<line x1="${sx}" y1="${ny}" x2="${sx}" y2="${ey}" stroke="${itemColor}" stroke-width="1.5"/>`;
              
              if (!isBeamed) {
                var vFlip = dir === -1 ? 1 : -1;

                if (n.d === 'e') {
                  sStr += `<path d="M ${sx} ${ey} c 9.5,${vFlip * 2.4} 5.1,${vFlip * 10.8} 4.2,${vFlip * 13.8} c 7.8,${vFlip * -10.7} -4.1,${vFlip * -15.1} -4.2,${vFlip * -21.6} z" fill="${itemColor}" fill-rule="evenodd"/>`;
                } else if (n.d === '16') {
                  sStr += `<path d="M ${sx} ${ey} c 9.5,${vFlip * 2.4} 5.1,${vFlip * 10.8} 4.2,${vFlip * 13.8} c 7.8,${vFlip * -10.7} -4.1,${vFlip * -15.1} -4.2,${vFlip * -21.6} z" fill="${itemColor}" fill-rule="evenodd"/>`;
                  sStr += `<path d="M ${sx} ${ey - (dir * 5)} c 9.5,${vFlip * 2.4} 5.1,${vFlip * 10.8} 4.2,${vFlip * 13.8} c 7.8,${vFlip * -10.7} -4.1,${vFlip * -15.1} -4.2,${vFlip * -21.6} z" fill="${itemColor}" fill-rule="evenodd"/>`;
                } else if (n.d === '32') {
                  sStr += `<path d="M ${sx} ${ey} c 9.5,${vFlip * 2.4} 5.1,${vFlip * 10.8} 4.2,${vFlip * 13.8} c 7.8,${vFlip * -10.7} -4.1,${vFlip * -15.1} -4.2,${vFlip * -21.6} z" fill="${itemColor}" fill-rule="evenodd"/>`;
                  sStr += `<path d="M ${sx} ${ey - (dir * 5)} c 9.5,${vFlip * 2.4} 5.1,${vFlip * 10.8} 4.2,${vFlip * 13.8} c 7.8,${vFlip * -10.7} -4.1,${vFlip * -15.1} -4.2,${vFlip * -21.6} z" fill="${itemColor}" fill-rule="evenodd"/>`;
                  sStr += `<path d="M ${sx} ${ey - (dir * 10)} c 9.5,${vFlip * 2.4} 5.1,${vFlip * 10.8} 4.2,${vFlip * 13.8} c 7.8,${vFlip * -10.7} -4.1,${vFlip * -15.1} -4.2,${vFlip * -21.6} z" fill="${itemColor}" fill-rule="evenodd"/>`;
                }
              }
            }
			
			
		// DRAWING RHYTHMIC DOTS LAYER for dotted notes
if (n.isDotted || n.isDoubleDotted) {
  // Center the dot horizontally just to the right of the notehead or flag line
  var dotX1 = nx + 10; 
  var dotY = ny;

  // Traditional Engraving Rule: If a notehead lands directly on a staff line,
  // push the dot up slightly into the space so it remains readable
  var distanceFromCenterLine = (ny - (sy + 2 * s)) / (s / 2);
  var landsOnALine = Math.round(distanceFromCenterLine) % 2 === 0;
  if (landsOnALine && !n.isRest) {
    dotY -= 4; // Shift up into the upper white space channel
  }

  // Render the First Dot
  sStr += `<circle cx="${dotX1}" cy="${dotY}" r="1.5" fill="${itemColor}"/>`;

  // Render the Second Dot if double-dotted
  if (n.isDoubleDotted) {
    var dotX2 = dotX1 + 5; // Track 5px to the right of the first dot
    sStr += `<circle cx="${dotX2}" cy="${dotY}" r="1.5" fill="${itemColor}"/>`;
  }
}

			
			
          });
        });






      });
      
      sStr += `</g>`;
    }
    
    sStr += `</svg>`;
    el.innerHTML = sStr;
  }
}

export default { Factory };
