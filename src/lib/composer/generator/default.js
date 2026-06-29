// Absolute MIDI Pitch Mapping (Added Bb for explicit flat tracking)
const PITCHES = { C: 60, D: 62, E: 64, F: 65, G: 67, A: 69, B: 71, Bb: 70 };

// Separate arrays for sharp-spelled keys and flat-spelled keys
const ALPHABET_SHARPS = Array('C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B');
const ALPHABET_FLATS  = Array('C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B');

// Rhythmic Duration Blueprints for 4/4 Common Time
const RHYTHMS = Array(
  Array('q', 'q', 'q', 'q'),
  Array('h', 'h'),
  Array('q', 'e', 'e', 'q', 'q'),
  Array('e', 'e', 'q', 'e', 'e', 'q'),
  Array('q', 'q', 'h'),
  Array('h', 'q', 'q'),
  Array('e', 'e', 'e', 'e', 'q', 'q'),
  Array('q', 'e', 'e', 'e', 'e', 'e', 'e'),
  Array('h', 'e', 'e', 'e', 'e')
);
export function generateMeasure(currentScore) {
  let lastMidi = 60;
  let totalMeasures = 0;

  // Step 1: Parse the final trailing note to establish voice-leading continuity
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
        
        // Handle incoming primary note parsing safely
        if (PITCHES[letter] !== undefined) {
          lastMidi = PITCHES[letter] + (octave - 4) * 12;
          if (acc === '#') lastMidi += 1;
          if (acc === 'b') lastMidi -= 1;
        }
      }
    }
  }

  // Step 2: Modulatory Logic cycling balanced sharp and flat keys (Max 2 accidentals)
  let keyCenter = 'C';
  let isMinor = false;
  let useFlats = false; // Flag to change spelling array layout dynamically
  
  const modCycle = Math.floor(totalMeasures / 2) % 8;
  switch (modCycle) {
    case 1: keyCenter = 'G';  isMinor = false; useFlats = false; break; // G Major (1 Sharp)
    case 2: keyCenter = 'F';  isMinor = false; useFlats = true;  break; // F Major (1 Flat)
    case 3: keyCenter = 'A';  isMinor = true;  useFlats = false; break; // A Minor (Natural)
    case 4: keyCenter = 'D';  isMinor = true;  useFlats = true;  break; // D Minor (1 Flat)
    case 5: keyCenter = 'D';  isMinor = false; useFlats = false; break; // D Major (2 Sharps)
    case 6: keyCenter = 'Bb'; isMinor = false; useFlats = true;  break; // Bb Major (2 Flats - perfectly clean, no double flats)
    case 7: keyCenter = 'E';  isMinor = true;  useFlats = false; break; // E Minor (1 Sharp)
    default: keyCenter = 'C'; isMinor = false; useFlats = false;        // C Major Home Base
  }

  const rootMidi = PITCHES[keyCenter];
  
  // Step 3: Determine scale intervals (Using traditional Major and Minor intervals)
  const scaleIntervals = isMinor 
    ? Array(0, 2, 3, 5, 7, 8, 10) 
    : Array(0, 2, 4, 5, 7, 9, 11);

  // Choose a random rhythmic motif pattern
  const activeRhythm = RHYTHMS.at(Math.floor(Math.random() * RHYTHMS.length));
  const outputTokens = Array();

  // Step 4: Map pitches to selected duration segments
  for (let i = 0; i < activeRhythm.length; i++) {
    const duration = activeRhythm.at(i);
    
    // Tonic (0) -> Subdominant (1) -> Dominant (2) -> Passing Loop (3)
    const currentFunction = i % 4;
    let allowedScaleDegrees = Array(0, 2, 4); 

    if (currentFunction === 1) {
      allowedScaleDegrees = Array(3, 5, 0); 
    } else if (currentFunction === 2) {
      allowedScaleDegrees = Array(4, 6, 1); 
    } else if (currentFunction === 3) {
      allowedScaleDegrees = Array(0, 2, 6); 
    }

    // Convert scale degree registers to absolute half-step pitch arrays
    const targetIntervals = Array();
    for (let d = 0; d < allowedScaleDegrees.length; d++) {
      targetIntervals.push(scaleIntervals.at(allowedScaleDegrees.at(d)));
    }

    let idealMidi = lastMidi;
    let closestDistance = Infinity;

    // Search performance bubble (MIDI 55 to 79)
    for (let candidate = 55; candidate <= 79; candidate++) {
      const pitchOffset = (candidate - rootMidi + 24) % 12;
      
      if (targetIntervals.includes(pitchOffset)) {
        const stepDistance = Math.abs(candidate - lastMidi);
        
        if (stepDistance < closestDistance && stepDistance > 0) {
          closestDistance = stepDistance;
          idealMidi = candidate;
        }
      }
    }

    // Voice-leading voice jump damper
    const intervalJump = Math.abs(idealMidi - lastMidi);
    if (intervalJump > 7) {
      const direction = idealMidi > lastMidi ? 3 : -3;
      idealMidi = lastMidi + direction;
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
