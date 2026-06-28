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
</style>
