//export const STEP = 8;
//export const ROW_HEIGHT = 90;
//export const CLEF_WIDTH = 45;
//
//export const PITCH_MAP = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
//
//export const GLYPHS = {
//  CLEF_TREBLE: { type: 'char', value: '\u{1D11E}' }, 
//  CLEF_BASS: { type: 'char', value: '\u{1D122}' },   
//  ACCIDENTAL_SHARP: { type: 'char', value: '\u266F' }, 
//  ACCIDENTAL_FLAT: { type: 'char', value: '\u266D' },  
//  FLAG_PATH: { type: 'path', value: 'M 0 0 c 9.5,2.4 5.1,10.8 4.2,13.8 c 7.8,-10.7 -4.1,-15.1 -4.2,-21.6 z' }
//};
//--------------------------------------------------------------------------------
export const STEP = 8;
export const ROW_HEIGHT = 90;
export const CLEF_WIDTH = 45;

export const PITCH_MAP = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };

export const GLYPHS = {
  // TEST 1: Composite SVG Node (Renders a stylized Treble Clef using circles and lines)
  CLEF_TREBLE: {
    type: 'svg', 
    value: `
      <g transform="translate(10, -10) scale(0.041, -0.041) translate(-180, -220)">
        <path d="M 562,-21 C 562,68 497,129 407,129 414,85 441,-74 462,-194 533,-165 562,-92 562,-21 z M 420,-206 362,123 C 303,109 258,60 258,-1 258,-50 280,-76 319,-100 331,-108 341,-113 341,-122 341,-131 332,-135 324,-135 244,-135 189,-39 189,31 189,125 251,221 342,248 335,289 328,336 319,390 304,375 288,361 271,346 183,270 97,161 97,39 97,-112 219,-212 362,-212 381,-212 400,-210 420,-206 z M 332,822 C 324,791 321,757 321,720 321,678 326,639 332,599 401,667 478,745 478,849 478,918 454,967 439,967 387,967 341,862 332,822 z M 122,-513 C 122,-447 167,-390 237,-390 312,-390 353,-447 353,-501 353,-565 306,-605 259,-612 256,-613 254,-614 254,-616 254,-617 256,-618 257,-619 259,-619 280,-624 304,-624 405,-624 458,-569 458,-465 458,-412 447,-342 428,-246 405,-250 378,-253 349,-253 163,-253 0,-106 0,81 0,281 126,402 217,487 238,504 290,557 291,558 274,670 269,719 269,773 269,857 287,985 351,1061 384,1100 415,1112 422,1112 440,1112 469,1077 493,1026 509,990 537,916 537,825 537,666 464,541 358,430 367,374 377,315 387,255 533,255 640,153 640,2 640,-101 567,-203 469,-235 475,-274 481,-304 484,-324 494,-381 500,-426 500,-465 500,-528 486,-594 432,-632 396,-654 355,-666 308,-666 173,-666 122,-579 122,-513 z"/>
      </g>
    ` 
  }, 

  // Fallback Bass Clef remains a character
   CLEF_BASS: {
    type: 'svg', 
    value: `
      <g transform="translate(5, -18) scale(12,12)">
<path stroke-width="0.001" d="M-0.1 .35 C-0.1 1.11 .48 1.8 1.25 1.8 C1.75 1.8 2.2 1.6 2.5 1.05 C2.55 .95 2.5 .9 2.43 .95 C2.2 1.17 1.9 1.48 1.45 1.48 C0.7 1.48 .15 .85 .15 .15 C0.15-0.45 .62-0.83 1.05-0.83 C1.55-0.83 1.9-0.5 1.9-0.05 C1.9 .35 1.55 .71 1.2 .71 C0.8 .71 .6 .4 .63 .17 C0.75 .3 .9 .31 1.0 .31 C1.2 .31 1.38 .1 1.38-0.15 C1.38-0.35 1.2-0.55 .95-0.55 C0.6-0.52 .39-0.25 .39 .05 C0.39 .52 .62 .89 1.2 .89 C1.65 .89 2.07 .5 2.07-0.1 C2.07-0.66 1.56-1.01 1.05-1.01 C0.28-1.01-0.1-0.35-0.1 .35M2.42-0.2 C2.54-0.2 2.64-0.3 2.64-0.42 C2.64-0.54 2.54-0.64 2.42-0.64 C2.3-0.64 2.2-0.54 2.2-0.42 C2.2-0.3 2.3-0.2 2.42-0.2M2.42 .2 C2.54 .2 2.64 .3 2.64 .42 C2.64 .54 2.54 .64 2.42 .64 C2.3 .64 2.2 .54 2.2 .42 C2.2 .3 2.3 .2 2.42 .2z"/>
</g>
     ` 
  }, 
 
  // TEST 2: High-Fidelity Path Geometry (A sharp symbol drawn via coordinates)
  ACCIDENTAL_SHARP: { 
    type: 'path', 
    value: 'M 3,-9 L 3,5 M 7,-5 L 7,9 M 0,-2 L 10,-5 M 0,4 L 10,1' 
  }, 

  // TEST 3: Traditional Unicode character string
  ACCIDENTAL_FLAT: { type: 'char', value: '\u266D' },  

  // Flag passage geometry path remains a path type
  FLAG_PATH: { 
    type: 'path', 
    value: 'M 0 0 c 9.5,2.4 5.1,10.8 4.2,13.8 c 7.8,-10.7 -4.1,-15.1 -4.2,-21.6 z' 
  },


	REST_QUARTER: {type: 'svg',value: `
      <g transform="translate(-13, -13) scale(2.2, 2.2)">
        <path d="m 6.086914,0.50605014 c -1e-7,0.148771 -0.219,0.258 -0.156,0.398 0.019,0.02 0.218,0.25799996 0.418,0.51999996 0.457,0.515 0.535,0.637 0.636,0.875 0.399,0.816 0.18,1.855 -0.519,2.512 -0.059,0.078 -0.317,0.296 -0.559,0.476 -0.695,0.598 -1.015,0.938 -1.133,1.238 -0.043,0.079 -0.043,0.157 -0.043,0.278 -0.019,0.277 0,0.301 0.821,1.254 1.113,1.336 1.91,2.2729999 1.972,2.3319999 l 0.059,0.058 -0.078,-0.039 c -1.098,-0.4570009 -2.332,-0.6759999 -2.75,-0.4760009 -0.141,0.058 -0.223,0.1399999 -0.281,0.2770009 -0.161,0.339999 -0.118,0.84 0.121,1.574 0.218,0.66 0.656,1.534999 1.093,2.192 0.18,0.281 0.52,0.718 0.559,0.737999 0.059,0.059 0.141,0.039 0.199,0 0.059,-0.078 0.059,-0.140999 -0.058,-0.276999 -0.418,-0.598 -0.617,-1.836001 -0.379,-2.493001 0.097,-0.295999 0.219,-0.456999 0.437,-0.558 0.578,-0.257999 1.856,0.062 2.391,0.597001 0.039,0.04 0.121,0.121999 0.16,0.140999 0.141,0.059 0.3400003,-0.019 0.3990003,-0.159999 0.082,-0.141001 0.039,-0.238 -0.141,-0.457001 C 8.918914,11.107049 7.902914,9.9120501 7.762914,9.7320501 c -0.36,-0.418001 -0.52,-0.816001 -0.559,-1.316001 -0.019,-0.636999 0.238,-1.311999 0.719,-1.754 0.058,-0.078 0.316,-0.297 0.555,-0.476 0.738,-0.618 1.0390003,-0.957 1.1560003,-1.278 0.082,-0.257999 0.043,-0.496 -0.137,-0.715 -0.062,-0.058 -0.7580003,-0.918 -1.5740003,-1.894 -1.117,-1.31299996 -1.516,-1.79299996 -1.574,-1.81299996 -0.082,-0.019 -0.262,-0.0708 -0.262,0.020001 z"/>
      </g>
`},
  //REST_QUARTER:{type:"char",value:"\u{1D13D}"},
  //REST_EIGHTH: {type: 'path',value: 'M 3.5,-7 C 3.5,-4.5 1.5,-2.5 -1,-2.5 C -2.8,-2.5 -4,-3.8 -4,-5.5 C -4,-7.5 -2.2,-9.5 0.5,-9.5 C 1.2,-9.5 1.8,-9.3 2,-9 C 0.5,-7.5 -0.5,-5.5 -0.5,-4 C -0.5,-3 0.2,-2.2 1,-2.2 C 2,-2.2 3,-3.8 3,-5.5 C 3,-8.5 0,-11 -3,-11 C -6,-11 -8.5,-8.5 -8.5,-5 C -8.5,-1 5.5,12 5.5,12 L 6.5,11 C 6.5,11 -4.5,-1 -4.5,-4.5 C -4.5,-7 2.5,-9.5 3.5,-7 z'}
  //REST_EIGHTH:{type:"char",value:"\u{1D13E}"},
  REST_EIGHTH:{type:"svg",value:`
      <g transform="translate(-12, -2) scale(2.1, 2.1) translate(-530, -76)">
        <path d="m 531.098,74.847 c -0.52,0.098 -0.918,0.457 -1.098,0.953 -0.039,0.16 -0.039,0.199 -0.039,0.418 0,0.301 0.019,0.461 0.16,0.699 0.199,0.399 0.617,0.719 1.094,0.836 0.5,0.141 1.336,0.02 2.293,-0.297 l 0.238,-0.082 -1.176,3.25 -1.156,3.246 c 0,0 0.039,0.02 0.102,0.063 0.117,0.078 0.316,0.137 0.457,0.137 0.238,0 0.539,-0.137 0.578,-0.258 0,-0.039 0.558,-1.934 1.234,-4.184 l 1.195,-4.125 -0.039,-0.058 c -0.097,-0.121 -0.296,-0.16 -0.418,-0.063 -0.039,0.039 -0.101,0.121 -0.14,0.18 -0.18,0.301 -0.637,0.836 -0.875,1.035 -0.219,0.18 -0.34,0.199 -0.539,0.121 -0.18,-0.098 -0.239,-0.199 -0.36,-0.738 -0.117,-0.535 -0.257,-0.778 -0.558,-0.977 -0.278,-0.179 -0.637,-0.238 -0.953,-0.156 z"/>
      </g>
`},
};

//--------------------------------------------------------------------------------

  /*
   * --------------------------------------------------------------------------------
   * More Unicode Symbols
   * --------------------------------------------------------------------------------
   */
  /*
  // Additional Clefs & Accidentals
  CLEF_ALTO_TENOR_C: "\u{1D121}",
  ACCIDENTAL_NATURAL: "\u{266E}",
  ACCIDENTAL_DOUBLE_SHARP: "\u{1D12A}",
  ACCIDENTAL_DOUBLE_FLAT: "\u{1D12B}",

  // Structural Notation
  BARLINE_SINGLE: "\u{1D100}",
  BARLINE_DOUBLE: "\u{1D101}",
  BARLINE_FINAL: "\u{1D102}",
  REPEAT_LEFT: "\u{1D106}",
  REPEAT_RIGHT: "\u{1D107}",
  SEGNO: "\u{1D10B}",
  CODA: "\u{1D10C}",
  FERMATA: "\u{1D110}",

  // Standard Notes (Web-safe BMP block)
  NOTE_QUARTER: "\u{2669}",
  NOTE_EIGHTH: "\u{266A}",
  NOTE_EIGHTH_BEAMED: "\u{266B}",
  NOTE_SIXTEENTH_BEAMED: "\u{266C}",

  // Detailed Notes & Heads (Musical Symbols block)
  NOTE_WHOLE: "\u{1D15D}",
  NOTE_HALF: "\u{1D15E}",
  NOTE_STEM: "\u{1D165}",

  // Rests
  REST_WHOLE: "\u{1D13B}",
  REST_HALF: "\u{1D13C}",
  REST_QUARTER: "\u{1D13D}",
  REST_EIGHTH: "\u{1D13E}",
  REST_SIXTEENTH: "\u{1D13F}",

  // Time Signatures & Dynamics
  TIME_COMMON: "\u{1D134}",
  TIME_CUT: "\u{1D135}",
  DYNAMIC_PIANO: "\u{1D18F}",
  DYNAMIC_FORTE: "\u{1D191}"


  // --- ANCIENT MUSICAL NOTATION ---

  // Ancient Greek Vocal Notation (Pitches)
  ANCIENT_GREEK_VOCAL_1: "\u{1D200}",   // Alpha variant
  ANCIENT_GREEK_VOCAL_2: "\u{1D201}",   // Beta variant
  ANCIENT_GREEK_VOCAL_3: "\u{1D202}",   // Gamma variant

  // Ancient Greek Instrumental Notation (Pitches)
  ANCIENT_GREEK_INSTR_1: "\u{1D21D}",
  ANCIENT_GREEK_INSTR_2: "\u{1D21E}",

  // Ancient Greek Music Symbols
  ANCIENT_GREEK_LEMMA: "\u{1D242}",      // Musical shorthand marker
  ANCIENT_GREEK_XRONOS_SHORT: "\u{1D243}", // Short duration sign

  // Byzantine Chant Notation (7th-10th Century CE)
  BYZANTINE_EKFONITIKON_VAREIA: "\u{1D005}", // Expressive tonal drop
  BYZANTINE_KATHISTI: "\u{1D007}",           // Interval rest anchor
  BYZANTINE_IPIKRISIS: "\u{1D00A}",          // Lower pitch modification

  // Early Medieval Western / Plainsong (Gregorian)
  MEDIEVAL_PUNCTUM: "\u{1D1B6}",             // Basic single square note
  MEDIEVAL_VIRGA: "\u{1D1B7}",               // Higher pitch line-note
  MEDIEVAL_PODATUS: "\u{1D1BA}",             // Ascending two-note neume
  MEDIEVAL_CLEF_C: "\u{1D13A}"               // Historical precursor to C Clefs
   */

  /*
   * --------------------------------------------------------------------------------
   * More Unicode Symbols - svg versions
   * --------------------------------------------------------------------------------
   */

   /*
  CLEF_TREBLE_SVG: `<svg xmlns="http://w3.org" viewBox="0 0 40 100" width="100%" height="100%"><path d="M18,92 C14,92 11,89 11,85 C11,80 15,77 19,77 C23,77 26,80 26,84 C26,90 20,92 18,92 Z M21,77 L21,25 C17,29 12,34 12,41 C12,49 17,54 22,54 C26,54 29,51 29,46 C29,38 21,33 21,25 M21,25 C21,12 26,5 31,5 C34,5 36,8 36,13 C36,22 28,29 21,37" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  
  CLEF_BASS_SVG: `<svg xmlns="http://w3.org" viewBox="0 0 40 50" width="100%" height="100%"><path d="M10,35 C10,12 32,15 32,28 C32,38 22,42 16,42 C12,42 10,40 10,36 C10,32 13,29 17,29 C20,29 22,31 22,34" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="36" cy="22" r="2.5" fill="currentColor"/><circle cx="36" cy="34" r="2.5" fill="currentColor"/></svg>`,
  
  CLEF_ALTO_SVG: `<svg xmlns="http://w3.org" viewBox="0 0 40 60" width="100%" height="100%"><path d="M12,5 L12,55 M17,5 L17,55 M17,10 C28,10 33,18 25,26 C33,34 28,42 17,42" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M6,8 L6,44 M9,14 L9,38" stroke="currentColor" stroke-width="1.5"/></svg>`,
  
  ACCIDENTAL_SHARP_SVG: `<svg xmlns="http://w3.org" viewBox="0 0 30 50" width="100%" height="100%"><path d="M10,5 L10,45 M20,5 L20,45 M5,18 L25,14 M5,32 L25,28" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`,
  
  ACCIDENTAL_FLAT_SVG: `<svg xmlns="http://w3.org" viewBox="0 0 20 50" width="100%" height="100%"><path d="M6,5 L6,42 C6,42 16,36 16,29 C16,22 6,25 6,25" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  
  ACCIDENTAL_DOUBLE_SHARP_SVG: `<svg xmlns="http://w3.org" viewBox="0 0 30 30" width="100%" height="100%"><path d="M7,7 L23,23 M7,23 L23,7" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/><path d="M5,7 L7,5 M23,5 L25,7 M25,23 L23,25 M7,25 L5,23" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/></svg>`,
  
  ACCIDENTAL_DOUBLE_FLAT_SVG: `<svg xmlns="http://w3.org" viewBox="0 0 35 50" width="100%" height="100%"><path d="M6,5 L6,42 C6,42 16,36 16,29 C16,22 6,25 6,25 M18,5 L18,42 C18,42 28,36 28,29 C28,22 18,25 18,25" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
   */

