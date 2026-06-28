class EasyScore {
  constructor(f) { this.f = f; }
  notes(s, o = {}) {
    return s.split(',').map(t => {
      const [p, d] = t.trim().split('/');
      const m = p.match(/([A-G])(#|b)?(\d+)/);
      return { 
        p, 
        d: d || 'q', 
        s: o.stem || 'auto', 
        l: m ? m[1] : 'C', 
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
          
          // Pre-calculate positions and track flag groupings for beaming purposes
          const noteGeometries = v.n.map((n, idx) => {
            const nx = mStartX + 15 + (idx * space);
            const off = 34 - (n.o * 7 + M[n.l]);
            const ny = startY + (2 * step) + (off * (step / 2));
            const isNoteActive = (absoluteMeasureIdx === this.activeMeasureIdx && idx === this.activeNoteIdx);
            const itemColor = isNoteActive ? '#dc2626' : '#000000';
            
            const dir = n.s === 'up' ? -1 : 1;
            const sx = nx + (n.s === 'up' ? 4.5 : -4.5);
            const ey = ny + (dir * 26); // End coordinates of the note stem tip
            
            return { n, idx, nx, ny, sx, ey, dir, itemColor, isNoteActive };
          });

          // Lookahead pass to combine adjacent eighth notes ('e') into structural beams
          let beamGroup = [];
          
          for (let i = 0; i <= noteGeometries.length; i++) {
            const geom = noteGeometries[i];
            
            // Check if current note item belongs in an eighth note beam sequence
            if (geom && geom.n.d === 'e') {
              beamGroup.push(geom);
            } else {
              // Group has broken, render beam bar if 2 or more consecutive eighth notes exist
              if (beamGroup.length >= 2) {
                const first = beamGroup[0];
                const last = beamGroup[beamGroup.length - 1];
                
                // Draw connecting thick structural musical beam bar
                sStr += `<polygon points="${first.sx},${first.ey} ${last.sx},${last.ey} ${last.sx},${last.ey + 3} ${first.sx},${first.ey + 3}" fill="${first.itemColor}"/>`;
                
                // Flag beam assignment so standard loose hook drawings are bypassed below
                beamGroup.forEach(bgItem => { bgItem.isBeamed = true; });
              }
              beamGroup = []; // Reset sequence collector
            }
          }

          // Main rendering execution loop pass
          noteGeometries.forEach((geom) => {
            const { n, nx, ny, sx, ey, dir, itemColor, isBeamed } = geom;

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
            const innerFill = hol ? '#ffffff' : itemColor;
            
            sStr += `<ellipse cx="${nx}" cy="${ny}" rx="5" ry="3.5" fill="${innerFill}" stroke="${itemColor}" stroke-width="2" transform="rotate(-20 ${nx} ${ny})"/>`;
            
            if (n.d !== 'w') {
              // Draw the note stem line segment
              sStr += `<line x1="${sx}" y1="${ny}" x2="${sx}" y2="${ey}" stroke="${itemColor}" stroke-width="1.5"/>`;
              
              // Only render individual flags if note is an eighth note and NOT part of a beam group
              if (n.d === 'e' && !isBeamed) {
                sStr += `<line x1="${sx}" y1="${ey}" x2="${sx + 4}" y2="${ey - (dir * 8)}" stroke="${itemColor}" stroke-width="1.5"/>`;
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
