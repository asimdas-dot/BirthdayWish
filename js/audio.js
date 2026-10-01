/**
 * MONAI'S BIRTHDAY APP - AUDIO SYNTHESIZER & SOUND ENGINE
 * Powered by Web Audio API for 100% reliable, zero-latency, offline-ready romantic audio.
 */

class BirthdayAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isBGMPlaying = false;
    this.bgmTimer = null;
    this.bgmStep = 0;
    this.masterGain = null;
    this.bgmGain = null;
    this.sfxGain = null;
    
    // Romantic Chord Progression (Melodic Music Box / Celesta Notes in Hz)
    // Cmaj7 -> Am7 -> Fmaj7 -> Gsus4 -> G
    this.chords = [
      [261.63, 329.63, 392.00, 493.88], // C, E, G, B
      [220.00, 261.63, 329.63, 392.00], // A, C, E, G
      [174.61, 261.63, 329.63, 349.23], // F, C, E, F
      [196.00, 261.63, 293.66, 392.00], // G, C, D, G
      [261.63, 329.63, 392.00, 523.25], // C, E, G, High C
      [220.00, 261.63, 392.00, 440.00], // A, C, G, A
      [174.61, 220.00, 261.63, 329.63], // F, A, C, E
      [196.00, 246.94, 293.66, 392.00]  // G, B, D, G
    ];

    this.arpeggioNotes = [
      523.25, 659.25, 783.99, 987.77, 1046.50, 783.99, 659.25, 523.25
    ];
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      // Master output
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // BGM Gain node
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);

      // SFX Gain node
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMusic() {
    this.init();
    if (this.isBGMPlaying) {
      this.pauseBGM();
      return false;
    } else {
      this.startBGM();
      return true;
    }
  }

  startBGM() {
    this.init();
    if (this.isBGMPlaying) return;
    this.isBGMPlaying = true;
    this.playNextBgmNote();
  }

  pauseBGM() {
    this.isBGMPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  // Plays gentle romantic music-box arpeggios in a warm ambient loop
  playNextBgmNote() {
    if (!this.isBGMPlaying || !this.ctx) return;

    const chordIndex = Math.floor(this.bgmStep / 8) % this.chords.length;
    const currentChord = this.chords[chordIndex];
    const noteInChord = currentChord[this.bgmStep % currentChord.length];

    // Play subtle bass warmth on beat 0 of each chord
    if (this.bgmStep % 8 === 0) {
      this.synthPluck(noteInChord / 2, 0.22, 1.8, 'sine');
    }

    // Play melodic bell-like celesta tone
    const melodyPitch = this.arpeggioNotes[(this.bgmStep * 3) % this.arpeggioNotes.length];
    this.synthCelesta(noteInChord * (this.bgmStep % 2 === 0 ? 1 : 1.5), 0.14, 1.2);
    
    if (this.bgmStep % 4 === 2) {
      this.synthCelesta(melodyPitch, 0.08, 0.9);
    }

    this.bgmStep++;
    // 340ms between notes = gentle 88 bpm lullaby tempo
    this.bgmTimer = setTimeout(() => this.playNextBgmNote(), 360);
  }

  // Bell-like music box celesta synthesis
  synthCelesta(freq, vol, duration) {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    // Warm high-cut filter for smooth romantic vibe
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, this.ctx.currentTime);

    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  // Soft synth pluck
  synthPluck(freq, vol, duration, type = 'sine') {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.bgmGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  /* =========================================================================
     SOUND EFFECTS (SFX)
     ========================================================================= */

  // Soft marimba tap on numeric keypad click
  playKeypadTap(digit = 1) {
    this.init();
    if (this.isMuted || !this.ctx) return;

    const baseFreq = 380 + (parseInt(digit) || 5) * 35;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Passcode success chord
  playSuccessChime() {
    this.init();
    if (this.isMuted || !this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.synthTone(freq, 0.35, 0.7, 'triangle');
      }, idx * 110);
    });
  }

  // Make a wish stardust shimmer chime
  playWishChime() {
    this.init();
    if (this.isMuted || !this.ctx) return;

    const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.synthTone(freq, 0.28, 1.2, 'sine');
      }, idx * 80);
    });
  }

  // Realistic Candle Blow (Filtered soft breath noise puff)
  playCandleBlow() {
    this.init();
    if (this.isMuted || !this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 0.7; // 700ms
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1; // white noise
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    // Filter to simulate soft blowing wind
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.45, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + 0.7);

    // Magical chime follows the blow
    setTimeout(() => {
      this.playWishChime();
    }, 400);
  }

  // Snappy Balloon Pop with pitch drop & noise burst
  playBalloonPop() {
    this.init();
    if (this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;

    // Pop Pitch Drop
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

    oscGain.gain.setValueAtTime(0.65, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.13);

    // Tiny noise burst
    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    noise.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
    noise.start(now);
    noise.stop(now + 0.09);
  }

  // Ascending musical harp chime for flower bloom taps (1 to 12)
  playFlowerBloom(tapNumber = 1) {
    this.init();
    if (this.isMuted || !this.ctx) return;

    // Scale from C4 up to G5 across 12 taps
    const scale = [
      261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 
      493.88, 523.25, 587.33, 659.25, 698.46, 783.99
    ];
    const freq = scale[Math.min(tapNumber - 1, scale.length - 1)];

    this.synthTone(freq, 0.4, 0.8, 'triangle');
    // Add harmonic overtone
    setTimeout(() => {
      this.synthTone(freq * 1.5, 0.15, 0.6, 'sine');
    }, 40);
  }

  // Soft scratch friction sound
  playScratchSound() {
    this.init();
    if (this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.2;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1800, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + 0.05);
  }

  // Confetti fanfare
  playConfettiFanfare() {
    this.init();
    if (this.isMuted || !this.ctx) return;

    const notes = [392.00, 523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.synthTone(freq, 0.3, 0.9, 'triangle');
      }, idx * 90);
    });
  }

  // Quiz correct tone
  playQuizAnswer() {
    this.init();
    if (this.isMuted || !this.ctx) return;

    this.synthTone(587.33, 0.35, 0.3, 'sine'); // D5
    setTimeout(() => {
      this.synthTone(880.00, 0.35, 0.5, 'triangle'); // A5
    }, 120);
  }

  // Generic helper for clean tone
  synthTone(freq, vol, duration, type = 'sine') {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + duration);
  }
}

// Global audio singleton
window.birthdayAudio = new BirthdayAudioEngine();
