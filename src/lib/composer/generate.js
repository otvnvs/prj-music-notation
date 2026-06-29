// Absolute MIDI Pitch Mapping
const PITCHES = { C: 60, D: 62, E: 64, F: 65, G: 67, A: 69, B: 71, Bb: 70 };

// Separate arrays for sharp-spelled keys and flat-spelled keys
const ALPHABET_SHARPS = Array('C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B');
const ALPHABET_FLATS  = Array('C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B');

// 1. POOL OF SLOW BLUEPRINTS (Adagio Section / Broad Notes)
const RHYTHMS_SLOW = Array(
  Array('h', 'h'),
  Array('q', 'q', 'h'),
  Array('h', 'q', 'q'),
  Array('q', 'q', 'q', 'q')
);

// 2. POOL OF FAST BLUEPRINTS (Presto Section / Virtuosic Runs)
const RHYTHMS_FAST = Array(
  Array('16', '16', '16', '16', '16', '16', '16', '16', '16', '16', '16', '16', '16', '16', '16', '16'), // Pure 16th engine
  Array('e', 'e', '32', '32', '32', '32', '32', '32', '32', '32', 'e', 'e', '16', '16', '16', '16'),    // Rapid bursts
  Array('16', '16', '16', '16', '32', '32', '32', '32', '32', '32', '32', '32', 'e', 'e', 'e', 'e'),    // Decelerating run
  Array('e', '16', '16', 'e', '16', '16', '16', '16', '16', '16', '32', '32', '32', '32', 'e')          // Unstable division engine
);

// 3. POOL OF BALANCED BLUEPRINTS (Exposition Section / Structural Theme)
const RHYTHMS_BALANCED = Array(
  Array('e', '16', '16', 'e', 'e', '16', '16', 'q'),
  Array('q', 'e', '16', '16', 'h'),
  Array('16', '16', '16', '16', 'e', 'e', 'q'),
  Array('e', 'e', '16', '16', '16', '16', 'h')
);

// PERSISTENT SCOPE STATE: Tracks structural memory across measures
let storedMotifRhythm = null;
let storedMotifDegrees = null;

export function generateMeasure(currentScore) {
  let lastMidi = 60;
  let totalMeasures = 0;

  // Step 1: Parse historical score tracking context
  if (currentScore && currentScore.trim().length > 0) {
    const bars = currentScore.split('|').map(b => b.trim());
    totalMeasures = bars.length;
    const lastBar = bars.at(totalMeasures - 1);
    const notes = lastBar.split(',').map(n => n.trim()).filter(n => n.length > 0);
    
    if (notes.length > 0) {
      const targetNote = notes.at(notes.length - 1).split('/').at(0).trim();
      const match = targetNote.match(/([A-G])(#|b)?(\d)/);
      if (match) {
        const letter = match.at(1);
        const acc = match.at(2) || '';
        const octave = parseInt(match.at(3), 10);
        
        if (PITCHES[letter] !== undefined) {
          lastMidi = PITCHES[letter] + (octave - 4) * 12;
          if (acc === '#') lastMidi += 1;
          if (acc === 'b') lastMidi -= 1;
        }
      }
    }
  } else {
    // Reset core memory banks if starting fresh
    storedMotifRhythm = null;
    storedMotifDegrees = null;
  }

  // Step 2: Modulatory Axis
  let keyCenter = 'C';
  let isMinor = false;
  let useFlats = false;
  
  const modCycle = Math.floor(totalMeasures / 2) % 8;
  switch (modCycle) {
    case 1: keyCenter = 'G';  isMinor = false; useFlats = false; break;
    case 2: keyCenter = 'F';  isMinor = false; useFlats = true;  break;
    case 3: keyCenter = 'A';  isMinor = true;  useFlats = false; break;
    case 4: keyCenter = 'D';  isMinor = true;  useFlats = true;  break;
    case 5: keyCenter = 'D';  isMinor = false; useFlats = false; break;
    case 6: keyCenter = 'Bb'; isMinor = false; useFlats = true;  break;
    case 7: keyCenter = 'E';  isMinor = true;  useFlats = false; break;
    default: keyCenter = 'C'; isMinor = false; useFlats = false;
  }

  const rootMidi = PITCHES[keyCenter];
  
  // Scale intervals
  const scaleIntervals = isMinor 
    ? Array(0, 2, 3, 5, 7, 8, 11) 
    : Array(0, 2, 4, 5, 7, 9, 11);

  // Set up the local measure chord structure
  const measureChordType = Math.floor(Math.random() * 3);
  let chordDegrees = Array(0, 2, 4);
  if (measureChordType === 1) chordDegrees = Array(3, 5, 0); 
  if (measureChordType === 2) chordDegrees = Array(4, 6, 1); 

  // MACRO-STRUCTURAL CONTROLLER
  // Measures 0-3:   Exposition (Balanced Themes & Sequence Transformations)
  // Measures 4-7:   Adagio Section (Long, Broad, Sustained notes)
  // Measures 8-11:  Presto Section (Dense, Hyper-Fast, Exploding 16/32 runs)
  const macroSection = Math.floor(totalMeasures / 4) % 3;
  const intraSectionIndex = totalMeasures % 4;

  let activeRhythm = Array();
  let computedDegrees = Array();

  if (macroSection === 0) {
    // ==========================================
    // SECTION A: THEMATIC EXPOSITION & VARIATION
    // ==========================================
    if (intraSectionIndex === 0 || storedMotifDegrees === null) {
      activeRhythm = RHYTHMS_BALANCED.at(Math.floor(Math.random() * RHYTHMS_BALANCED.length));
      for (let i = 0; i < activeRhythm.length; i++) {
        const duration = activeRhythm.at(i);
        if (duration === 'h' || duration === 'q' || i === 0) {
          computedDegrees.push(chordDegrees.at(i % chordDegrees.length));
        } else {
          computedDegrees.push(Math.floor(Math.random() * 7));
        }
      }
      storedMotifRhythm = activeRhythm;
      storedMotifDegrees = computedDegrees;
    } else {
      activeRhythm = storedMotifRhythm;
      if (intraSectionIndex === 1) {
        // Sequence transformation (shift up 2 steps)
        for (let i = 0; i < storedMotifDegrees.length; i++) {
          computedDegrees.push((storedMotifDegrees.at(i) + 2) % 7);
        }
      } else if (intraSectionIndex === 2) {
        // Inversion transformation
        let pivot = storedMotifDegrees.at(0);
        for (let i = 0; i < storedMotifDegrees.length; i++) {
          let diff = storedMotifDegrees.at(i) - pivot;
          let inverted = pivot - diff;
          if (inverted < 0) inverted += 7;
          computedDegrees.push(inverted % 7);
        }
      } else {
        // Direct thematic reuse decoration
        for (let i = 0; i < storedMotifDegrees.length; i++) {
          computedDegrees.push(storedMotifDegrees.at(i));
        }
      }
    }

  } else if (macroSection === 1) {
    // ==========================================
    // SECTION B: ADAGIO (Sustained, Long Notes)
    // ==========================================
    activeRhythm = RHYTHMS_SLOW.at(Math.floor(Math.random() * RHYTHMS_SLOW.length));
    for (let i = 0; i < activeRhythm.length; i++) {
      // Force structural arpeggiations across pure chord triad components
      computedDegrees.push(chordDegrees.at(i % chordDegrees.length));
    }

  } else if (macroSection === 2) {
    // ==========================================
    // SECTION C: PRESTO (Fast Virtuosic Subdivisions)
    // ==========================================
    activeRhythm = RHYTHMS_FAST.at(Math.floor(Math.random() * RHYTHMS_FAST.length));
    for (let i = 0; i < activeRhythm.length; i++) {
      const duration = activeRhythm.at(i);
      if (i === 0 || duration === 'e') {
        // Anchor notes land safely on foundational chords
        computedDegrees.push(chordDegrees.at(i % chordDegrees.length));
      } else {
        // Intermediate 16ths and 32nds dynamically map out running passing tones step-by-step
        computedDegrees.push(Math.floor(Math.random() * 7));
      }
    }
  }

  // Step 4: Map final computed degrees into absolute pitches
  const outputTokens = Array();
  for (let i = 0; i < activeRhythm.length; i++) {
    const duration = activeRhythm.at(i);
    const targetDegree = computedDegrees.at(i);
    const targetInterval = scaleIntervals.at(targetDegree);

    let idealMidi = lastMidi;
    let closestDistance = Infinity;

    // Search framework performance bubble (MIDI 55 to 79)
    for (let candidate = 55; candidate <= 79; candidate++) {
      const pitchOffset = (candidate - rootMidi + 24) % 12;
      
      if (pitchOffset === targetInterval) {
        const stepDistance = Math.abs(candidate - lastMidi);
        if (stepDistance < closestDistance) {
          closestDistance = stepDistance;
          idealMidi = candidate;
        }
      }
    }

    // Voice Leading Optimization Engine
    // Broad notes (Adagio) are permitted structural leaps up to a full octave (12 semi-tones)
    // Fast running notes (Presto engine) are strictly bound to conjunct step-wise motion (max 2 semitones)
    const isFastNote = (duration === '16' || duration === '32');
    const maxInterval = isFastNote ? 2 : 12;
    const intervalJump = Math.abs(idealMidi - lastMidi);
    
    if (intervalJump > maxInterval && intervalJump > 0) {
      const direction = idealMidi > lastMidi ? 1 : -1;
      idealMidi = lastMidi + (direction * 2);
      while (((idealMidi - rootMidi + 24) % 12) !== targetInterval && idealMidi > 55 && idealMidi < 79) {
        idealMidi += direction;
      }
    }

    lastMidi = idealMidi;

    // Step 5: Convert pitch with active enharmonic spelling array
    const activeAlphabet = useFlats ? ALPHABET_FLATS : ALPHABET_SHARPS;
    const finalLetter = activeAlphabet.at(lastMidi % 12);
    const finalOctave = Math.floor(lastMidi / 12) - 1;
    
    outputTokens.push(`${finalLetter}${finalOctave}/${duration}`);
  }

  return outputTokens.join(', ');
}
