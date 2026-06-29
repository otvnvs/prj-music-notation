<template>
  <div class="notation-container">
    <div class="header-section">
      <h2 class="app-title">Komponeerder</h2>
    </div>

	<div class="control-row">
	  <!-- Rewind to Beginning (Triggers via Alt + B) -->
	  <button class="btn btn-audio" @click="rewindScore" title="Rewind to Beginning [&h]">
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M4 6h2v12H4V6zm4 0h2v12H8V6zm12 12l-8.5-6 8.5-6v12z"/>
  </svg>

	  </button>

	  <!-- Back 1 Measure (Triggers via Alt + V) -->
	  <button class="btn btn-audio" @click="backMeasure" title="Back 1 Measure [&j]">
<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
  <!-- Left Bar 1 followed by a Left-Facing Triangle -->
  <path d="M6 6h2v12H6V6zm12 12l-8.5-6 8.5-6v12z"/>
</svg>
	  </button>

	<!-- Play State (Triggers via Alt + K) -->
	<button v-if="!playerState.isPlaying || playerState.isPaused" class="btn btn-audio btn-play" @click="togglePlay" title="Play [&k]">
	  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
	    <path d="M8 5v14l11-7z"/>
	  </svg>
	</button>
	<button v-else class="btn btn-audio btn-pause" @click="togglePlay" title="Pause [&k]">
	  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
	    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
	  </svg>
	</button>

	  <!-- Forward 1 Measure (Triggers via Alt + M) -->
	  <button class="btn btn-audio" @click="forwardMeasure" title="Forward 1 Measure [&l]">
	    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
	      <path d="M6 18l8.5-6L6 6v12zM16 6h2v12h-2V6z"/>
	    </svg>
	  </button>

	  <!-- Forward 1 Measure (Triggers via Alt + M) -->
	  <button class="btn btn-audio" @click="forwardMeasure" title="Forward 1 Measure [&;]">

  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M4 6l8.5 6L4 18V6zm10 0h2v12h-2V6zm4 0h2v12h-2V6z"/>
  </svg>
	  </button>

	</div>

    
    <div class="canvas-wrapper" ref="scrollContainer">
      <div id="output" ref="canvasTarget"></div>
    </div>


<!-- PRIMARY ACTION DECK -->
<div class="control-row">
  <!-- Add New Measure (Triggers via Alt + m) -->
  <button class="btn btn-control btn-add-bar" @click="appendGeneratedMeasure" title="Voeg by [&m]">
    <!-- Increased thickness using stroke and scaled up size via a 22px viewport -->
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
    </svg>
  </button>

  <!-- Remove Last Measure (Triggers via Alt + ,) -->
  <button class="btn btn-control btn-remove-bar" @click="removeLastMeasure" title="Verwyder [&,]">
    <!-- Reduced visual presence by lowering the width and height to 17px -->
    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
      <path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12 19 15.59z"/>
    </svg>
  </button>

  <!-- Wipe Score / Clear (Triggers via Alt + .) -->
  <button class="btn btn-control btn-clear-score" @click="clearScore" title="Wis [&.]">
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
    </svg>
  </button>

  <!-- Reload Page / Refresh (Triggers via Alt + /) -->
  <button class="btn btn-control btn-refresh" @click="refreshPage" title="Herlaai [&/]">
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
    </svg>
  </button>
</div>

    <div class="mic-status-banner">
      <button 
        class="btn btn-mic-toggle" 
        :class="{ 'mic-active': isMicListening }" 
        @click="toggleMicrophoneControl"
      >
        {{ isMicListening ? 'Deaktiveer mikrofoon ' : 'Aktiveer mikrofoon' }}
      </button>
      <span class="mic-hint-text" v-if="isMicListening">
        [Ready: Enkel klap stap maat terug]
      </span>
    </div>

    <div class="playback-status-bar" v-if="playerState.totalMeasures > 0">
      <span class="status-badge" :class="{ 'active': playerState.isPlaying && !playerState.isPaused }">
        {{ playerState.isPlaying ? (playerState.isPaused ? 'Stop' : 'Speel') : 'Gestop' }}
      </span>
      <span class="measure-tracker">
        Maat: <strong>{{ playerState.currentMeasureIdx + 1 }}</strong> / {{ playerState.totalMeasures }}
      </span>
    </div>

    <div class="control-deck">
      <div class="input-field-group">
        <label for="melody-input">Teks notasie</label>
        <input 
          id="melody-input" 
          v-model="voice1Text" 
          type="text" 
          placeholder="Tik note hier (b.v., C4/q, E4/q)" 
        />
      </div>

      <div class="playback-settings-panel">
        <div class="tempo-control-sub">
          <div class="tempo-label-row">
            <label for="tempo-input">Tempo</label>
            <span class="tempo-display"><strong>{{ bpmValue }}</strong> BPM</span>
          </div>
          <input 
            id="tempo-input" 
            v-model.number="bpmValue" 
            type="range" 
            min="40" 
            max="240" 
            step="5" 
            class="tempo-slider"
          />
        </div>
        
        <div class="loop-control-sub">
          <label class="loop-toggle-label">
            <input 
              type="checkbox" 
              v-model="isLoopEnabled" 
              class="loop-checkbox"
            />
            <span class="loop-toggle-text" :class="{ 'loop-on': isLoopEnabled }">
              {{ isLoopEnabled ? 'Herhaal aan' : 'Herhaal af' }}
            </span>
          </label>
        </div>
      </div>


    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch, nextTick } from 'vue';
import VexFlow from '../..//lib/composer/vexflow.js';
import { ScorePlayer } from '../../lib/composer/play/index.js';
import { MicrophoneController } from '../../lib/composer/microphone_control.js';
import { generateMeasure } from '../../lib/composer/generate.js';

const canvasTarget = ref(null);
const scrollContainer = ref(null);
const screenWidth = ref(window.innerWidth);

const audioPlayer = new ScorePlayer();
let micController = null;
const isMicListening = ref(false);
const bpmValue = ref(120);
const isLoopEnabled = ref(false);

const playerState = reactive({
  isPlaying: false,
  isPaused: false,
  isLooping: false,
  currentMeasureIdx: -1,
  currentNoteIdx: -1,
  totalMeasures: 0
});

const voice1Text = ref('C4/q, E4, G4, B4 | C5/h, G4/h | A4/q, B4, C5, D5 | E5/w');

const toggleMicrophoneControl = async () => {
  if (isMicListening.value) {
    if (micController) micController.stop();
    isMicListening.value = false;
  } else {
    if (!micController) micController = new MicrophoneController(audioPlayer);
    try {
      await micController.start();
      isMicListening.value = true;
    } catch (e) {
      isMicListening.value = false;
    }
  }
};

const syncPlayerScore = () => {
  audioPlayer.loadScore(voice1Text.value);
  audioPlayer.setBpm(bpmValue.value);
  audioPlayer.setLoop(isLoopEnabled.value);
  playerState.totalMeasures = audioPlayer.measures.length;
};

const updatePlaybackUI = (player) => {
  playerState.isPlaying = player.isPlaying;
  playerState.isPaused = player.isPaused;
  playerState.isLooping = player.isLooping;
  playerState.currentMeasureIdx = player.isPlaying ? player.currentMeasureIdx : -1;
  playerState.currentNoteIdx = player.isPlaying ? player.currentNoteIdx : -1;
  playerState.totalMeasures = player.measures.length;
};

const togglePlay = () => {
  if (audioPlayer.isPlaying && !audioPlayer.isPaused) {
    audioPlayer.pause();
  } else {
    audioPlayer.play((state) => {
      Object.assign(playerState, state);
      nextTick(() => {
        scrollToActiveMeasureRow(state.currentMeasureIdx);
      });
    });
  }
  updatePlaybackUI(audioPlayer);
};

const stopScore = () => { 
  audioPlayer.stop(); 
  updatePlaybackUI(audioPlayer); 
  renderScore(); 
  if (scrollContainer.value) scrollContainer.value.scrollTo({ top: 0, behavior: 'smooth' });
};

const rewindScore = () => { audioPlayer.rewind(); updatePlaybackUI(audioPlayer); renderScore(); };
const forwardMeasure = () => { audioPlayer.forwardMeasure(); updatePlaybackUI(audioPlayer); renderScore(); };
const backMeasure = () => { audioPlayer.backMeasure(); updatePlaybackUI(audioPlayer); renderScore(); };

const handleResize = () => {
  screenWidth.value = window.innerWidth;
  renderScore();
};

const refreshPage = () => {
  audioPlayer.stop();
  if (micController) micController.stop();
  window.location.reload();
};

const scrollToActiveMeasureRow = (measureIdx) => {
  if (!scrollContainer.value) return;
  if (measureIdx <= 0) {
    scrollContainer.value.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  const minMeasureWidth = screenWidth.value < 500 ? 110 : 160;
  const computedWidth = screenWidth.value < 640 ? Math.min(screenWidth.value - 32, 480) : 620;
  const availableWidth = computedWidth - 45 - 20;
  const measuresPerRow = Math.max(1, Math.floor(availableWidth / minMeasureWidth));
  const targetRow = Math.floor(measureIdx / measuresPerRow);
  const targetScrollTop = (targetRow * 90) + 45 - 110;
  scrollContainer.value.scrollTo({
    top: Math.max(0, targetScrollTop),
    behavior: 'smooth'
  });
};

const appendGeneratedMeasure = () => {
  const cleanText = voice1Text.value.trim();
  const generatedStr = generateMeasure(cleanText);
  
  if (!cleanText || cleanText === 'C4/w') {
    voice1Text.value = generatedStr;
  } else {
    voice1Text.value = `${cleanText} | ${generatedStr}`;
  }

  nextTick(() => {
    const totalMeasures = voice1Text.value.split('|').length;
    scrollToActiveMeasureRow(totalMeasures - 1);
  });
};

const removeLastMeasure = () => {
  const cleanText = voice1Text.value.trim();
  if (!cleanText) return;

  const measures = cleanText.split('|').map(m => m.trim());
  if (measures.length <= 1) {
    clearScore();
    return;
  }

  // Remove the trailing segment
  measures.pop();
  voice1Text.value = measures.join(' | ');

  nextTick(() => {
    const totalMeasures = voice1Text.value.split('|').length;
    scrollToActiveMeasureRow(totalMeasures - 1);
  });
};

const clearScore = () => {
  voice1Text.value = '';
  stopScore();
};

const renderScore = () => {
  if (!canvasTarget.value) return;
  
  if (!voice1Text.value.trim()) {
    canvasTarget.value.innerHTML = '';
    playerState.totalMeasures = 0;
    return;
  }

  const isMobile = screenWidth.value < 640;
  const computedWidth = isMobile ? Math.min(screenWidth.value - 32, 480) : 620;
  const factory = new VexFlow.Factory({
    renderer: { elementId: canvasTarget.value, width: computedWidth, height: 120 },
    activeMeasureIdx: playerState.currentMeasureIdx,
    activeNoteIdx: playerState.currentNoteIdx - 1
  });
  const score = factory.EasyScore();
  const system = factory.System();
  const measuresV1 = voice1Text.value.split('|').map(m => m.trim()).filter(m => m.length > 0);
  if (measuresV1.length === 0) return;
  try {
    for (let i = 0; i < measuresV1.length; i++) {
      system.addStave({ voices: [score.voice(score.notes(measuresV1[i], { stem: 'up' }))] });
      if (i === 0) system.addClef('treble').addTimeSignature('4/4');
    }
    factory.draw();
  } catch (e) {
    console.warn("Vexflow render tracking warning:", e.message);
  }
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
  renderScore();
  syncPlayerScore();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  audioPlayer.stop();
  if (micController) micController.stop();
});

watch(voice1Text, () => {
  renderScore();
  syncPlayerScore();
});

watch(bpmValue, (newBpm) => {
  audioPlayer.setBpm(newBpm);
});

watch(isLoopEnabled, (newLoopVal) => {
  audioPlayer.setLoop(newLoopVal);
});

watch(() => [playerState.currentMeasureIdx, playerState.currentNoteIdx], () => {
renderScore();});
</script>
<style>
@import "src/style.css";
:root {
  --bg-main: #0f172a;
  --bg-card: #1e293b;
  --accent-blue: #38bdf8;
  --accent-glow: rgba(56, 189, 248, 0.15);
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --sheet-paper: #ffffff;
  --border-radius-lg: 12px;
  --border-radius-md: 8px;
  --transition-smooth: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

body {
  background-color: var(--bg-main);
  color: var(--text-primary);
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.notation-container {
  max-width: 660px;
  margin: 40px auto;
  padding: 32px;
  background: var(--bg-card);
  border: 1px solid #334155;
  border-radius: var(--border-radius-lg);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
}

.header-section {
  margin-bottom: 24px;
}

.app-title {
  margin: 0;
  font-size: 1.85rem;
  font-weight: 800;
  background: linear-gradient(to right, #ffffff, var(--accent-blue));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.app-subtitle {
  margin: 4px 0 0 0;
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.canvas-wrapper {
  background-color: var(--sheet-paper) !important;
  border: 2px solid #475569;
  border-radius: var(--border-radius-md);
  padding: 16px !important;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  max-height: unset;
  overflow-y: auto;
  /*scroll-behavior: smooth;*/
  height:380px!important;
}

.playback-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #1e293b;
  border: 1px solid #334155;
  padding: 10px 16px;
  border-radius: var(--border-radius-md);
  margin-top: 14px;
}

.status-badge {
  font-size: 0.8rem;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 4px;
  background: #475569;
  color: #ffffff;
}

.status-badge.active {
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
}

.measure-tracker {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.control-deck {
  margin-top: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-field-group label {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.75px;
}

.input-field-group input {
  width: 100%;
  box-sizing: border-box;
  padding: 14px 16px;
  font-family: monospace;
  font-weight: 600;
  font-size: 1.05rem;
  color: #ffffff;
  background-color: #0f172a;
  border: 2px solid #334155;
  border-radius: var(--border-radius-md);
  outline: none;
}

.input-field-group input:focus {
  border-color: var(--accent-blue);
  box-shadow: 0 0 0 4px var(--accent-glow);
}

.control-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  background: #0f172a;
  padding: 10px;
  border-radius: var(--border-radius-lg);
  border: 1px solid #334155;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.95rem;
  padding: 12px 20px;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  border: none;
  transition: var(--transition-smooth);
}

.btn-audio {
  background: #1e293b;
  color: var(--text-primary);
  border: 1px solid #475569;
  padding: 10px 0;
  font-size: 0.85rem;
  grid-column: span 1;
}

.btn-audio:hover {
  background: #334155;
  border-color: var(--accent-blue);
}

.btn-play, .btn-pause {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #ffffff;
  grid-column: span 2;
} 

.btn-pause {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.action-row {
  display: flex;
  gap: 12px;
}



.hint {
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--text-secondary);
  margin: 0;
  padding: 12px 16px;
  background: #1a2236;
  border-radius: var(--border-radius-md);
  border-left: 3px solid #475569;
}

.code-badge {
  font-family: monospace;
  background: #0f172a;
  color: #e2e8f0;
  padding: 2px 6px;
  border-radius: 4px;
}

@media screen and (max-width: 640px) {
  .notation-container {
    margin: 12px;
    padding: 20px;
  }
  .action-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .btn-generate {
    grid-column: span 2;
  }
  .audio-control-row {
    grid-template-columns: repeat(4, 1fr);
  }
}



.tempo-control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #0f172a;
  padding: 14px 16px;
  border-radius: var(--border-radius-md);
  border: 1px solid #334155;
}

.tempo-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tempo-label-row label {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.75px;
}

.tempo-display {
  font-size: 0.95rem;
  color: var(--accent-blue);
}

.tempo-slider {
  width: 100%;
  height: 6px;
  background: #334155;
  border-radius: 3px;
  outline: none;
  cursor: pointer;
  appearance: none;
}

.tempo-slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--accent-blue);
  cursor: pointer;
  transition: transform 0.1s;
}

.tempo-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.mic-status-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #0f172a;
  padding: 12px 16px;
  border-radius: var(--border-radius-md);
  border: 1px solid #334155;
  margin-top: 14px;
}

.btn-mic-toggle {
  background: #334155;
  color: var(--text-primary);
  border: 1px solid #475569;
  padding: 8px 14px;
  font-size: 0.85rem;
  font-weight: 700;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: var(--transition-smooth);
}

.btn-mic-toggle:hover {
  background: #475569;
  border-color: var(--text-secondary);
}

.btn-mic-toggle.mic-active {
  background: #ef4444;
  color: #ffffff;
  border-color: #f87171;
  animation: pulse-border 2s infinite;
}

.mic-hint-text {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 600;
  letter-spacing: 0.25px;
}

@keyframes pulse-border {
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}


.playback-settings-panel {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  background: #0f172a;
  padding: 14px 16px;
  border-radius: var(--border-radius-md);
  border: 1px solid #334155;
  align-items: center;
}

.tempo-control-sub {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.loop-control-sub {
  display: flex;
  justify-content: flex-end;
}

.loop-toggle-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.loop-checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--accent-blue);
  cursor: pointer;
}

.loop-toggle-text {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: var(--transition-smooth);
}

.loop-toggle-text.loop-on {
  color: var(--accent-blue);
  text-shadow: 0 0 8px rgba(56, 189, 248, 0.4);
}

@media screen and (max-width: 640px) {
  .playback-settings-panel {
    grid-template-columns: 1fr;
    gap: 14px;
  }
  .loop-control-sub {
    justify-content: flex-start;
  }
}




.top-action-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}


@media screen and (max-width: 640px) {
  .top-action-bar {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .btn-generate {
    grid-column: span 2;
  }
}



@media screen and (max-width: 640px) {
  .top-action-bar {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .btn-generate, .btn-remove-bar {
    grid-column: span 1;
  }
}

.hide-scrollbar {
  /* IE and Edge */
  -ms-overflow-style: none;
  
  /* Firefox */
  scrollbar-width: none;
}

/* Chrome, Safari, and Opera */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

/* -------------------------------------------------------------------------------- */
.btn-control {
  background: #1e293b;
  color: var(--text-primary);
  border: 1px solid #475569;
  padding: 10px 0;
  font-size: 0.85rem;
}

.btn-add-bar {
  grid-column: span 2;
}
.btn-add-bar:hover {
  border-color: var(--accent-blue);
}

.btn-add-bar {
  grid-column: span 1;
}
.btn-remove-bar {
  grid-column: span 2;
}
.btn-clear-score {
  grid-column: span 2;
}
.btn-refresh {
  grid-column: span 1;
}
/* -------------------------------------------------------------------------------- */
#output{
	height:840px!important;
	scale:0.9;
}
/* -------------------------------------------------------------------------------- */
</style>
