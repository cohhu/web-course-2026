const MELODY = [
  261.63,
  329.63,
  392.00,
  523.25,

  493.88,
  392.00,
  329.63,
  293.66,

  220.00,
  261.63,
  329.63,
  440.00,

  392.00,
  349.23,
  329.63,
  293.66,

  329.63,
  392.00,
  493.88,
  587.33,

  523.25,
  392.00,
  329.63,
  261.63
];

class SoundManager {
  constructor() {
    this.audioCtx = null;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playNoteByStep(stepIndex, duration = 0.35) {
    this.init();
    const freq = MELODY[stepIndex % MELODY.length];
    const now = this.audioCtx.currentTime;

    [freq, freq * 2].forEach((f, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);

      const volume = idx === 0 ? 0.25 : 0.08;
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + duration);
    });
  }

  playError() {
    this.init();
    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110.0, now);
    osc.frequency.exponentialRampToValueAtTime(65.4, now + 0.5);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  }
}


class SimonGame {
  constructor() {
    this.state = {
      sequence: [],
      playerStep: 0,
      isComputerTurn: false,
      isPlaying: false,
      bestScore: 0,
      gameSessionId: 0
    };

    this.sound = new SoundManager();

    this.sectors = document.querySelectorAll('.sector');
    this.startBtn = document.getElementById('start-btn');
    this.currentScoreEl = document.getElementById('current-score');
    this.bestScoreEl = document.getElementById('best-score');
    this.statusMessageEl = document.getElementById('status-message');

    this.setStatus('', false);

    this.attachEvents();
  }

  attachEvents() {
    this.startBtn.addEventListener('click', () => this.startGame());

    this.sectors.forEach((sector) => {
      sector.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index, 10);
        this.handlePlayerInput(index);
      });
    });
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }


  setStatus(text, isVisible = true) {
    this.statusMessageEl.textContent = text;
    if (isVisible && text) {
      this.statusMessageEl.classList.remove('hidden');
    } else {
      this.statusMessageEl.classList.add('hidden');
    }
  }

  startGame() {
    this.state.gameSessionId++;
    this.state.sequence = [];
    this.state.playerStep = 0;
    this.state.isPlaying = true;
    this.state.isComputerTurn = false;

    this.startBtn.disabled = true;
    this.updateScore(0);
    this.setStatus('', false);

    this.nextRound();
  }

  async nextRound() {
    const currentSession = this.state.gameSessionId;
    this.state.isComputerTurn = true;
    this.state.playerStep = 0;


    this.setStatus('', false);

    this.state.sequence.push(Math.floor(Math.random() * 4));
    this.updateScore(this.state.sequence.length);

    await this.sleep(600);
    if (this.state.gameSessionId !== currentSession) return;


    for (let step = 0; step < this.state.sequence.length; step++) {
      if (this.state.gameSessionId !== currentSession) return;

      const sectorIndex = this.state.sequence[step];
      await this.flashSector(sectorIndex, step, 420);
      await this.sleep(180);
    }

    if (this.state.gameSessionId !== currentSession) return;


    this.state.isComputerTurn = false;
    this.setStatus('Ваш ход, повторяйте!', true);
  }

  async flashSector(sectorIndex, noteStepIndex, duration = 350) {
    const sector = this.sectors[sectorIndex];
    if (!sector) return;

    sector.classList.add('active');
    this.sound.playNoteByStep(noteStepIndex, duration / 1000);

    await this.sleep(duration);
    sector.classList.remove('active');
  }

  async handlePlayerInput(index) {
    if (!this.state.isPlaying || this.state.isComputerTurn) {
      return;
    }

    const currentStep = this.state.playerStep;
    const expectedIndex = this.state.sequence[currentStep];

    if (index === expectedIndex) {
      this.flashSector(index, currentStep, 250);
      this.state.playerStep++;


      if (this.state.playerStep === this.state.sequence.length) {
        this.state.isComputerTurn = true;
        this.setStatus('', false);

        await this.sleep(600);
        this.nextRound();
      }
    } else {
      this.gameOver(index);
    }
  }

  gameOver(failedSectorIndex) {
    this.state.isPlaying = false;
    this.state.isComputerTurn = true;
    this.startBtn.disabled = false;

    if (this.sectors[failedSectorIndex]) {
      this.sectors[failedSectorIndex].classList.add('active');
      setTimeout(() => this.sectors[failedSectorIndex].classList.remove('active'), 400);
    }
    this.sound.playError();

    const reachedLevel = this.state.sequence.length;
    this.setStatus(`Игра окончена! Вы дошли до уровня ${reachedLevel}`, true);

    if (reachedLevel > this.state.bestScore) {
      this.state.bestScore = reachedLevel;
      this.bestScoreEl.textContent = this.state.bestScore;
    }
  }

  updateScore(score) {
    this.currentScoreEl.textContent = score;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new SimonGame();
});