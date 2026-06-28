```javascript
import { ScorePlayer } from './ScorePlayer.js';
import { Organ } from '../synth/organ.js';
import { Pluck } from '../synth/pluck.js';

// Instantiate the organ synth engine
const organSynth = new Organ();

// Instantiate the player pre-configured with the organ
const player = new ScorePlayer(organSynth);
player.loadScore("C4/q,E4/q,G4/q,C5/h | G4/q,F4/q,E4/q,C4/w");

// Switch to a new sound setup effortlessly mid-playback:
// player.setInstrument(new Pluck());
```
