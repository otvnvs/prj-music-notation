import EasyScore from './EasyScore.js';
import System from './System.js';
import { STEP, ROW_HEIGHT, CLEF_WIDTH, GLYPHS } from './constants.js';
import { createLine, createRect, createEllipse, createCircle, renderGlyph } from './svgBuilder.js';
import { renderBeams } from './beamGroup.js';

// Import both available strategy modules
import { DefaultLayoutManager } from './DefaultLayoutManager.js';
import { LayoutManager } from './LayoutManager.js';

export default class Factory {
  constructor(options = {}) {
    this.options = options.renderer || {};
    this.systemInstance = null;
    this.activeMeasureIdx = options.activeMeasureIdx !== undefined ? options.activeMeasureIdx : -1;
    this.activeNoteIdx = options.activeNoteIdx !== undefined ? options.activeNoteIdx : -1;

    // Resolve the layout strategy from configuration options (Defaulting to 'default')
    const strategy = options.layoutStrategy || 'default';
    this.layoutEngine = strategy === 'proportional' ? LayoutManager : DefaultLayoutManager;
  }

  EasyScore() {
    return new EasyScore(this);
  }

  System() {
    this.systemInstance = new System(this);
    return this.systemInstance;
  }

  draw() {
    const el = typeof this.options.elementId === 'string' 
      ? document.getElementById(this.options.elementId) 
      : this.options.elementId;
      
    if (!el || !this.systemInstance || !this.systemInstance.staves.length) return;

    const canvasWidth = this.options.width || 500;
    const minMeasureWidth = canvasWidth < 500 ? 110 : 160;
    const availableWidthForMeasures = canvasWidth - CLEF_WIDTH - 20;
    const measuresPerRow = Math.max(1, Math.floor(availableWidthForMeasures / minMeasureWidth));
    const measureWidth = availableWidthForMeasures / measuresPerRow;
    
    const totalStavesCount = this.systemInstance.staves.length;
    const numRows = Math.ceil(totalStavesCount / measuresPerRow);
    const canvasHeight = numRows * ROW_HEIGHT + 30;

    el.setAttribute("style", `display:block!important;width:${canvasWidth}px!important;height:${canvasHeight}px!important;overflow:visible;`);

    let sStr = `<svg width="${canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${canvasWidth} ${canvasHeight}" style="display:block;overflow:visible;background:transparent;">`;

    for (let r = 0; r < numRows; r++) {
      const startY = 20 + (r * ROW_HEIGHT);
      const staffTopY = startY;
      const staffBottomY = startY + (4 * STEP);

      sStr += `<g class="staff-row" data-row-index="${r}">`;

      const rowStaves = this.systemInstance.staves.slice(r * measuresPerRow, (r + 1) * measuresPerRow);

      rowStaves.forEach((stave, sIdx) => {
        const absoluteMeasureIdx = (r * measuresPerRow) + sIdx;
        const mStartX = CLEF_WIDTH + (sIdx * measureWidth);
        if (absoluteMeasureIdx === this.activeMeasureIdx) {
          sStr += createRect(mStartX, startY - 6, measureWidth, (4 * STEP) + 12, "rgba(56, 189, 248, 0.22)", 4);
        }
      });

      for (let i = 0; i < 5; i++) {
        const y = startY + (i * STEP);
        sStr += createLine(10, y, canvasWidth - 10, y, "#000000", "1.5");
      }

      const clefGlyph = this.systemInstance.clefType === 'treble' ? GLYPHS.CLEF_TREBLE : GLYPHS.CLEF_BASS;
      sStr += renderGlyph(12, startY + 29, clefGlyph, { fontSize: 52 });
      sStr += createLine(10, startY, 10, startY + (4 * STEP), "#000000", "1.5");

      rowStaves.forEach((stave, sIdx) => {
        const absoluteMeasureIdx = (r * measuresPerRow) + sIdx;
        const mStartX = CLEF_WIDTH + (sIdx * measureWidth);
        const mEndX = mStartX + measureWidth;
        const isLastInRow = (sIdx === rowStaves.length - 1);
        const isAbsoluteLast = (absoluteMeasureIdx === totalStavesCount - 1);

        if (isAbsoluteLast || isLastInRow) {
          sStr += createLine(canvasWidth - 10, startY, canvasWidth - 10, startY + (4 * STEP), "#000000", "2");
        } else {
          sStr += createLine(mEndX, startY, mEndX, startY + (4 * STEP), "#000000", "1.5");
        }

        stave.voices.forEach(v => {
          if (!v.n || !v.n.length) return;

          // Polimorphic runtime assignment: Executes either 'LayoutManager' or 'DefaultLayoutManager'
          const noteGeometries = this.layoutEngine.computeMeasureLayout(v, mStartX, startY, measureWidth, {
            absoluteMeasureIdx,
            activeMeasureIdx: this.activeMeasureIdx,
            activeNoteIdx: this.activeNoteIdx
          });

          sStr += renderBeams(noteGeometries);

          noteGeometries.forEach((geom) => {
            const { n, nx, ny, sx, ey, dir, itemColor, isBeamed } = geom;
            //if (n.isRest) return;
		// --- RENDER REST BRANCH ---
		if (n.isRest) {
		  const centerStaffLineY = startY + (2 * STEP); // Locks rest alignments onto the middle line (B4)

		  if (n.d === 'w') {
		    // Whole Rest: A solid black box hanging down from the 4th staff line
		    const fourthLineY = startY + (1 * STEP);
		    sStr += createRect(nx - 6, fourthLineY, 12, STEP / 2, itemColor);
		  } 
		  else if (n.d === 'h') {
		    // Half Rest: A solid black box sitting on top of the 3rd middle staff line
		    const thirdLineY = startY + (2 * STEP);
		    sStr += createRect(nx - 6, thirdLineY - (STEP / 2), 12, STEP / 2, itemColor);
		  } 
		  else if (n.d === 'q') {
		    // Quarter Rest: Render polymorphic path vector
		    sStr += renderGlyph(nx, centerStaffLineY, GLYPHS.REST_QUARTER, { fill: itemColor });
		  } 
		  else if (n.d === 'e' || n.d === '16' || n.d === '32') {
		    // Shorter Rests: Render stylized flag path
		    sStr += renderGlyph(nx, centerStaffLineY, GLYPHS.REST_EIGHTH, { fill: itemColor });
		    
		    // Add additional offset flags for 16th and 32nd rests to match traditional engraving
		    if (n.d === '16' || n.d === '32') {
		      sStr += renderGlyph(nx - 1.5, centerStaffLineY + 6, GLYPHS.REST_EIGHTH, { fill: itemColor });
		    }
		    if (n.d === '32') {
		      sStr += renderGlyph(nx - 3, centerStaffLineY + 12, GLYPHS.REST_EIGHTH, { fill: itemColor });
		    }
		  }

		  // DRAW RHYTHMIC AUGMENTATION DOTS FOR RESTS
		  if (n.isDotted || n.isDoubleDotted) {
		    const dotX1 = nx + 10;
		    // Standard engraving places rest dots cleanly inside the 3rd spaces panel segment
		    const restDotY = startY + (1.5 * STEP); 
		    
		    sStr += createCircle(dotX1, restDotY, 1.5, itemColor);
		    if (n.isDoubleDotted) {
		      sStr += createCircle(dotX1 + 5, restDotY, 1.5, itemColor);
		    }
		  }

		  return; // Stop processing further notehead or stem calculations for this token!
		}

            if (ny >= staffBottomY + STEP) {
              for (let ly = staffBottomY + STEP; ly <= ny + 1; ly += STEP) {
                sStr += createLine(nx - 8, ly, nx + 8, ly, "#ffffff", "3.5");
                sStr += createLine(nx - 8, ly, nx + 8, ly, itemColor, "1.5");
              }
            } else if (ny <= staffTopY - STEP) {
              for (let ly = staffTopY - STEP; ly >= ny - 1; ly -= STEP) {
                sStr += createLine(nx - 8, ly, nx + 8, ly, "#ffffff", "3.5");
                sStr += createLine(nx - 8, ly, nx + 8, ly, itemColor, "1.5");
              }
            }

            if (n.a) {
              const accGlyph = n.a === '#' ? GLYPHS.ACCIDENTAL_SHARP : GLYPHS.ACCIDENTAL_FLAT;
              sStr += renderGlyph(nx - 10, ny + 4, accGlyph, { fontSize: 22, anchor: 'middle', weight: 'bold' });
            }

            const isHollow = n.d === 'w' || n.d === 'h';
            const innerFill = isHollow ? '#ffffff00' : itemColor;
            sStr += createEllipse(nx, ny, 5, 3.5, innerFill, itemColor, "2", -20);

            if (n.d !== 'w') {
              sStr += createLine(sx, ny, sx, ey, itemColor, "1.5");

              if (!isBeamed) {
                const vFlip = dir === -1 ? 1 : -1;
                const scaleStr = `scale(1, ${vFlip})`;
                if (n.d === 'e') {
                  sStr += renderGlyph(sx, ey, GLYPHS.FLAG_PATH, { fill: itemColor, transform: scaleStr });
                } else if (n.d === '16') {
                  sStr += renderGlyph(sx, ey, GLYPHS.FLAG_PATH, { fill: itemColor, transform: scaleStr });
                  sStr += renderGlyph(sx, ey - (dir * 5), GLYPHS.FLAG_PATH, { fill: itemColor, transform: scaleStr });
                } else if (n.d === '32') {
                  sStr += renderGlyph(sx, ey, GLYPHS.FLAG_PATH, { fill: itemColor, transform: scaleStr });
                  sStr += renderGlyph(sx, ey - (dir * 5), GLYPHS.FLAG_PATH, { fill: itemColor, transform: scaleStr });
                  sStr += renderGlyph(sx, ey - (dir * 10), GLYPHS.FLAG_PATH, { fill: itemColor, transform: scaleStr });
                }
              }
            }

            if (n.isDotted || n.isDoubleDotted) {
              let dotX1 = nx + 10;
              let dotY = ny;
              const distanceFromCenterLine = (ny - (staffTopY + 2 * STEP)) / (STEP / 2);
              const landsOnALine = Math.round(distanceFromCenterLine) % 2 === 0;

              if (landsOnALine) {
                dotY -= 4;
              }

              sStr += createCircle(dotX1, dotY, 1.5, itemColor);

              if (n.isDoubleDotted) {
                let dotX2 = dotX1 + 5;
                sStr += createCircle(dotX2, dotY, 1.5, itemColor);
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

