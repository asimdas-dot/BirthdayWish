/**
 * MONAI'S BIRTHDAY APP - MAIN APPLICATION CONTROLLER
 * Orchestrates 11 interactive screens, touch/drag events, state management, and transitions.
 */

class BirthdayApp {
  constructor() {
    this.currentScreen = 1;
    this.totalScreens = 11;

    // State Variables
    this.passcode = [];
    this.wishMade = false;
    this.candlesBlown = false;
    this.microphoneStream = null;
    this.microphoneAudioContext = null;
    this.microphoneAnalyser = null;
    this.microphoneAnimationFrame = null;
    this.blowDetectedAt = 0;
    this.poppedBalloons = new Set();
    this.scratchPercent = 0;
    this.isScratched = false;
    this.bloomCount = 0;
    this.maxBloom = 12;
    this.quizIndex = 0;
    this.carouselIndex = 0;
    this.totalSlides = 0;

    // Quiz Questions Data
    this.quizData = [
      {
        question: "Where did we first meet?",
        options: [
          { text: "At a cozy coffee shop on a rainy afternoon", note: "Where every conversation felt like home ☕" },
          { text: "Through mutual smiles on a sunny day", note: "The universe had the best timing ✨" },
          { text: "In a quiet book corner", note: "Straight out of a romance novel 📖" },
          { text: "The stars aligned in the most unexpected way", note: "The best day of my life, without doubt 💕" }
        ],
        feedback: "A moment etched in my heart forever! 🥰"
      },
      {
        question: "What is my favorite thing about you?",
        options: [
          { text: "Your infectious, heartwarming laugh", note: "It lights up every single room!" },
          { text: "Your sharp wit and playful little jokes", note: "You always keep me smiling!" },
          { text: "Your pure, endlessly compassionate heart", note: "The gentlest soul I've ever known." },
          { text: "All of the above (and a million more things)", note: "Because you are simply irreplaceable! ❤️" }
        ],
        feedback: "Everything about you is pure perfection! ✨"
      },
      {
        question: "What would I choose for our perfect date?",
        options: [
          { text: "Stargazing under cozy blankets with warm chai", note: "Just you, me, and the infinite sky 🌌" },
          { text: "A scenic long drive listening to our playlist", note: "Singing our hearts out together 🚗" },
          { text: "Cooking dinner together and laughing at messes", note: "The sweetest kitchen memories 🍝" },
          { text: "Anywhere in the world, as long as it's with you", note: "Every place is magical with you 💕" }
        ],
        feedback: "With you, even doing nothing is everything! 💖"
      },
      {
        question: "What is my absolute favorite notification?",
        options: [
          { text: "'Your food delivery has arrived'", note: "Close second, but nope! 🍕" },
          { text: "'Monai: 1 new message' or 'Incoming Call...'", note: "My heart skips a beat every time! 💓" },
          { text: "'Weekend is officially here!'", note: "Nice, but you're better! 🎉" },
          { text: "'Battery 100% Charged'", note: "Not even close! ⚡" }
        ],
        feedback: "Seeing your name always makes my entire day! 💕"
      },
      {
        question: "What would I rather have?",
        options: [
          { text: "A lifetime supply of chocolate and coffee", note: "Tempting, but..." },
          { text: "An all-expenses-paid trip around the world", note: "Only if you're holding my hand!" },
          { text: "Endless quiet moments holding your hand", note: "Always, in every lifetime." },
          { text: "Winning the biggest lottery jackpot", note: "I already won the jackpot when I met you! 🌟" }
        ],
        feedback: "You are and will always be my greatest blessing, Monai! 💍"
      }
    ];

    this.init();
  }

  init() {
    this.setupGlobalControls();
    this.setupScreen1Passcode();
    this.setupScreen2MakeAWish();
    this.setupScreen3BlowCandles();
    this.setupScreen4Balloons();
    this.setupScreen5Polaroid();
    this.setupScreen6Letter();
    this.setupScreen7ScratchCard();
    this.setupScreen8Bloom();
    this.setupScreen9Quiz();
    this.setupScreen10Carousel();
    this.setupScreen11FinalNote();

    // Show initial screen
    this.goToScreen(1);
  }

  /* =========================================================================
     NAVIGATION & SCREEN SWITCHING
     ========================================================================= */
  goToScreen(screenNum) {
    if (screenNum < 1 || screenNum > this.totalScreens) return;

    if (this.currentScreen === 3 && screenNum !== 3) {
      this.stopMicrophoneBlowDetection();
    }

    const previousScreenEl = document.getElementById(`screen-${this.currentScreen}`);
    const nextScreenEl = document.getElementById(`screen-${screenNum}`);

    if (previousScreenEl) {
      previousScreenEl.classList.remove('active');
    }

    this.currentScreen = screenNum;

    if (nextScreenEl) {
      nextScreenEl.classList.add('active');
      // Scroll to top of the screen container
      nextScreenEl.scrollTop = 0;
    }

    // Toggle Night Mode on canvas for Screen 2
    if (window.particleEngine) {
      window.particleEngine.setNightMode(screenNum === 2);
    }

    // Trigger Screen Specific Initializations
    this.onScreenEnter(screenNum);
  }

  onScreenEnter(screenNum) {
    switch (screenNum) {
      case 2:
        // Make a wish entered
        break;
      case 5:
        // Polaroid celebration: shower confetti automatically
        setTimeout(() => {
          if (window.particleEngine) window.particleEngine.fireConfetti();
          if (window.birthdayAudio) window.birthdayAudio.playConfettiFanfare();
        }, 300);
        break;
      case 6:
        // Letter screen: trigger staggered reveal
        this.revealLetterProgressively();
        break;
      case 7:
        // Initialize or resize scratch canvas
        setTimeout(() => this.initScratchCanvas(), 100);
        break;
      case 9:
        // Render current quiz card
        this.renderQuizQuestion(this.quizIndex);
        break;
      case 10:
        // Update carousel slide display
        this.updateCarousel(this.carouselIndex);
        break;
      case 11:
        // Final note: shower floating hearts
        setInterval(() => {
          if (this.currentScreen === 11 && window.particleEngine) {
            window.particleEngine.showerHearts(12);
          }
        }, 1800);
        break;
    }
  }

  /* =========================================================================
     GLOBAL CONTROLS (Audio Toggle)
     ========================================================================= */
  setupGlobalControls() {
    const musicBtn = document.getElementById('music-toggle-btn');
    const finalMusicBtn = document.getElementById('final-music-btn');

    const toggleHandler = () => {
      const isPlaying = window.birthdayAudio.toggleMusic();
      if (isPlaying) {
        musicBtn.classList.add('playing');
        document.getElementById('music-text').textContent = 'Playing';
        if (finalMusicBtn) finalMusicBtn.textContent = 'Pause Music';
      } else {
        musicBtn.classList.remove('playing');
        document.getElementById('music-text').textContent = 'Music';
        if (finalMusicBtn) finalMusicBtn.textContent = 'Play Music';
      }
    };

    if (musicBtn) musicBtn.addEventListener('click', toggleHandler);
    if (finalMusicBtn) finalMusicBtn.addEventListener('click', toggleHandler);

    // Auto-start ambient music on first user touch anywhere if not yet started
    const firstTouchHandler = () => {
      if (window.birthdayAudio && !window.birthdayAudio.isBGMPlaying) {
        window.birthdayAudio.startBGM();
        if (musicBtn) {
          musicBtn.classList.add('playing');
          document.getElementById('music-text').textContent = 'Playing';
        }
      }
      window.removeEventListener('click', firstTouchHandler);
      window.removeEventListener('touchstart', firstTouchHandler);
    };
    window.addEventListener('click', firstTouchHandler, { once: true });
    window.addEventListener('touchstart', firstTouchHandler, { once: true });
  }

  /* =========================================================================
     SCREEN 1: PASSCODE KEYPAD
     ========================================================================= */
  setupScreen1Passcode() {
    const keypad = document.getElementById('custom-keypad');
    if (!keypad) return;

    keypad.addEventListener('click', (e) => {
      const btn = e.target.closest('.key-btn');
      if (!btn) return;

      const key = btn.dataset.key;
      this.handlePasscodeInput(key);
    });

    // Keyboard support for desktop
    window.addEventListener('keydown', (e) => {
      if (this.currentScreen !== 1) return;
      if (e.key >= '0' && e.key <= '9') {
        this.handlePasscodeInput(e.key);
      } else if (e.key === 'Backspace') {
        this.handlePasscodeInput('delete');
      } else if (e.key === 'Escape') {
        this.handlePasscodeInput('clear');
      }
    });
  }

  handlePasscodeInput(key) {
    const hint = document.getElementById('passcode-hint');
    if (hint) hint.innerHTML = '<span>💡 Enter Monai\'s special 4-digit birthday code.</span>';

    if (key === 'clear') {
      this.passcode = [];
      this.updatePasscodeDots();
      if (window.birthdayAudio) window.birthdayAudio.playKeypadTap(1);
      return;
    }

    if (key === 'delete') {
      this.passcode.pop();
      this.updatePasscodeDots();
      if (window.birthdayAudio) window.birthdayAudio.playKeypadTap(2);
      return;
    }

    // Number input (0-9)
    if (this.passcode.length < 4) {
      this.passcode.push(key);
      if (window.birthdayAudio) window.birthdayAudio.playKeypadTap(key);
      this.updatePasscodeDots();

      // On entering 4 digits, automatically validate and transition!
      if (this.passcode.length === 4) {
        this.validatePasscode();
      }
    }
  }

  updatePasscodeDots() {
    const dots = document.querySelectorAll('#passcode-dots .code-dot');
    dots.forEach((dot, index) => {
      if (index < this.passcode.length) {
        dot.classList.add('filled');
        dot.classList.remove('error');
      } else {
        dot.classList.remove('filled', 'error');
      }
    });
  }

  validatePasscode() {
    const enteredCode = this.passcode.join('');
    const dots = document.querySelectorAll('#passcode-dots .code-dot');
    if (enteredCode !== '2007') {
      dots.forEach(dot => dot.classList.add('error'));
      const hint = document.getElementById('passcode-hint');
      if (hint) hint.textContent = 'That code is not quite right. Please try again.';
      setTimeout(() => {
        if (this.currentScreen !== 1 || this.passcode.join('') !== enteredCode) return;
        this.passcode = [];
        this.updatePasscodeDots();
        if (hint) hint.innerHTML = '<span>💡 Enter Monai\'s special 4-digit birthday code.</span>';
      }, 700);
      return;
    }

    if (window.birthdayAudio) window.birthdayAudio.playSuccessChime();
    if (window.particleEngine) window.particleEngine.fireConfetti(window.innerWidth / 2, window.innerHeight * 0.35, 30);

    setTimeout(() => {
      this.goToScreen(2);
    }, 600);
  }

  /* =========================================================================
     SCREEN 2: MAKE A WISH SCREEN (Dark Night)
     ========================================================================= */
  setupScreen2MakeAWish() {
    const wishArea = document.getElementById('wish-tap-area');
    if (!wishArea) return;

    wishArea.addEventListener('click', () => {
      if (this.wishMade) return;
      this.wishMade = true;

      if (window.birthdayAudio) window.birthdayAudio.playWishChime();
      if (window.particleEngine) {
        window.particleEngine.fireConfetti(window.innerWidth / 2, window.innerHeight / 2, 45);
      }

      // Smooth glow effect before transition
      wishArea.style.opacity = '0.5';
      setTimeout(() => {
        wishArea.style.opacity = '1';
        this.goToScreen(3);
      }, 700);
    });
  }

  /* =========================================================================
     SCREEN 3: BLOW THE CANDLES SCREEN
     ========================================================================= */
  setupScreen3BlowCandles() {
    const micBtn = document.getElementById('mic-blow-btn');
    const micStatus = document.getElementById('mic-blow-status');

    const blowHandler = () => {
      if (this.candlesBlown) return;
      this.candlesBlown = true;
      this.stopMicrophoneBlowDetection();

      // Extinguish candle flames
      const flames = document.querySelectorAll('#cake-candles-row .cake-flame');
      flames.forEach(flame => flame.classList.add('extinguished'));

      // Spawn rising smoke curls
      const smokeBox = document.getElementById('cake-smoke-box');
      if (smokeBox) {
        for (let i = 0; i < 7; i++) {
          const puff = document.createElement('div');
          puff.className = 'smoke-puff';
          puff.style.left = `${20 + i * 11}%`;
          puff.style.animationDelay = `${i * 0.1}s`;
          smokeBox.appendChild(puff);
        }
      }

      // Sound and confetti
      if (window.birthdayAudio) window.birthdayAudio.playCandleBlow();
      if (window.particleEngine) {
        window.particleEngine.fireConfetti(window.innerWidth / 2, window.innerHeight * 0.45, 90);
      }

      if (micBtn) {
        micBtn.disabled = true;
        micBtn.textContent = 'Candles Blown';
      }
      if (micStatus) micStatus.textContent = 'Candles out! Your wish is on its way. ✨';

      // Automatically advance to screen 4
      setTimeout(() => {
        this.goToScreen(4);
      }, 1900);
    };

    if (micBtn) {
      micBtn.addEventListener('click', () => {
        if (this.microphoneStream) {
          this.stopMicrophoneBlowDetection();
          if (micStatus) micStatus.textContent = 'Microphone off. Turn it back on when you’re ready.';
          return;
        }
        this.startMicrophoneBlowDetection(blowHandler, micBtn, micStatus);
      });
    }
  }

  async startMicrophoneBlowDetection(blowHandler, micBtn, micStatus) {
    if (this.candlesBlown || this.microphoneStream) return;
    if (!window.isSecureContext) {
      if (micStatus) micStatus.textContent = 'Microphone access requires a secure page (HTTPS or localhost).';
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (micStatus) micStatus.textContent = 'Microphone access is not available in this browser.';
      return;
    }

    micBtn.disabled = true;
    if (micStatus) micStatus.textContent = 'Waiting for microphone permission…';

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
      });
      this.microphoneStream = stream;

      if (this.currentScreen !== 3 || this.candlesBlown) {
        this.stopMicrophoneBlowDetection();
        return;
      }

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        this.stopMicrophoneBlowDetection();
        if (micStatus) micStatus.textContent = 'Microphone audio analysis is not supported in this browser.';
        return;
      }

      this.microphoneAudioContext = new AudioContext();
      await this.microphoneAudioContext.resume();
      const analyser = this.microphoneAudioContext.createAnalyser();
      analyser.fftSize = 2048;
      this.microphoneAudioContext.createMediaStreamSource(stream).connect(analyser);
      this.microphoneAnalyser = analyser;
      const samples = new Float32Array(analyser.fftSize);
      this.blowDetectedAt = 0;
      micBtn.disabled = false;
      micBtn.textContent = '⏹️ Stop Microphone';
      if (micStatus) micStatus.textContent = 'Microphone on — blow gently toward it to extinguish the candles.';

      const listenForBlow = () => {
        if (!this.microphoneAnalyser || this.candlesBlown) return;
        this.microphoneAnalyser.getFloatTimeDomainData(samples);
        let energy = 0;
        for (const sample of samples) energy += sample * sample;
        const rms = Math.sqrt(energy / samples.length);

        if (rms >= 0.055) {
          if (!this.blowDetectedAt) this.blowDetectedAt = performance.now();
          if (performance.now() - this.blowDetectedAt >= 250) {
            blowHandler();
            return;
          }
        } else {
          this.blowDetectedAt = 0;
        }
        this.microphoneAnimationFrame = requestAnimationFrame(listenForBlow);
      };
      this.microphoneAnimationFrame = requestAnimationFrame(listenForBlow);
    } catch (error) {
      this.stopMicrophoneBlowDetection();
      if (micStatus) {
        if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
          micStatus.textContent = 'Microphone permission was denied. Allow access in your browser settings and try again.';
        } else if (error.name === 'NotFoundError') {
          micStatus.textContent = 'No microphone was found.';
        } else {
          micStatus.textContent = `Could not start the microphone (${error.message}).`;
        }
      }
    } finally {
      if (!this.microphoneStream || this.candlesBlown) micBtn.disabled = this.candlesBlown;
    }
  }

  stopMicrophoneBlowDetection() {
    const wasListening = Boolean(this.microphoneStream || this.microphoneAudioContext);
    if (this.microphoneAnimationFrame !== null) {
      cancelAnimationFrame(this.microphoneAnimationFrame);
      this.microphoneAnimationFrame = null;
    }
    if (this.microphoneStream) {
      this.microphoneStream.getTracks().forEach(track => track.stop());
      this.microphoneStream = null;
    }
    this.microphoneAnalyser = null;
    if (this.microphoneAudioContext) {
      const audioContext = this.microphoneAudioContext;
      this.microphoneAudioContext = null;
      audioContext.close().catch(error => console.error('Could not close microphone audio context:', error));
    }
    this.blowDetectedAt = 0;

    const micBtn = document.getElementById('mic-blow-btn');
    if (micBtn && !this.candlesBlown) {
      micBtn.disabled = false;
      micBtn.textContent = '🎙️ Use Microphone';
    }
    if (wasListening && !this.candlesBlown) {
      const micStatus = document.getElementById('mic-blow-status');
      if (micStatus) micStatus.textContent = 'Microphone off. Turn it back on when you’re ready.';
    }
  }

  /* =========================================================================
     SCREEN 4: BALLOON POP SCREEN
     ========================================================================= */
  setupScreen4Balloons() {
    const balloons = document.querySelectorAll('.balloon-wrapper');
    const counterBadge = document.getElementById('balloon-counter');
    const continueWrap = document.getElementById('balloon-continue-wrap');
    const continueBtn = document.getElementById('balloon-continue-btn');

    balloons.forEach(wrapper => {
      wrapper.addEventListener('click', () => {
        const index = parseInt(wrapper.dataset.index);
        const word = wrapper.dataset.word;

        if (this.poppedBalloons.has(index)) return;
        this.poppedBalloons.add(index);

        wrapper.classList.add('popped');
        if (window.birthdayAudio) window.birthdayAudio.playBalloonPop();

        // Reveal word in banner
        const slot = document.getElementById(`slot-${index}`);
        if (slot) {
          slot.textContent = word;
          slot.classList.add('revealed');
        }

        // Particle pop effect at balloon coordinates
        const rect = wrapper.getBoundingClientRect();
        if (window.particleEngine) {
          window.particleEngine.fireConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 25);
        }

        // Update counter
        const count = this.poppedBalloons.size;
        if (counterBadge) counterBadge.textContent = `${count} / 4 popped`;

        // Once all 4 are popped, show continue trigger
        if (count === 4) {
          setTimeout(() => {
            if (window.birthdayAudio) window.birthdayAudio.playConfettiFanfare();
            if (window.particleEngine) window.particleEngine.fireConfetti(window.innerWidth / 2, window.innerHeight * 0.3, 70);
            if (continueWrap) continueWrap.classList.remove('hidden');
          }, 400);
        }
      });
    });

    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        this.goToScreen(5);
      });
    }
  }

  /* =========================================================================
     SCREEN 5: POLAROID PHOTO CARD SCREEN
     ========================================================================= */
  setupScreen5Polaroid() {
    const repopBtn = document.getElementById('repop-confetti-btn');
    const nextBtn = document.getElementById('polaroid-next-btn');

    if (repopBtn) {
      repopBtn.addEventListener('click', () => {
        if (window.birthdayAudio) window.birthdayAudio.playConfettiFanfare();
        if (window.particleEngine) window.particleEngine.fireConfetti();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.goToScreen(6);
      });
    }
  }

  /* =========================================================================
     SCREEN 6: PERSONAL LETTER SCREEN
     ========================================================================= */
  setupScreen6Letter() {
    const revealAllBtn = document.getElementById('reveal-all-btn');
    const nextBtn = document.getElementById('letter-next-btn');

    if (revealAllBtn) {
      revealAllBtn.addEventListener('click', () => {
        const items = document.querySelectorAll('.reason-item');
        items.forEach(item => item.classList.add('visible'));
        revealAllBtn.style.display = 'none';
        if (window.birthdayAudio) window.birthdayAudio.playSuccessChime();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.goToScreen(7);
      });
    }
  }

  revealLetterProgressively() {
    const items = document.querySelectorAll('.reason-item');
    items.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add('visible');
      }, index * 400);
    });
  }

  /* =========================================================================
     SCREEN 7: SCRATCH CARD SCREEN (HTML5 Canvas)
     ========================================================================= */
  setupScreen7ScratchCard() {
    const nextBtn = document.getElementById('scratch-next-btn');
    const skipBtn = document.getElementById('skip-scratch-btn');

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.goToScreen(8);
      });
    }

    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        this.revealScratchCardFull();
      });
    }
  }

  initScratchCanvas() {
    const canvas = document.getElementById('scratch-canvas');
    const box = document.getElementById('scratch-card-box');
    if (!canvas || !box) return;

    const width = box.clientWidth || 280;
    const height = box.clientHeight || 280;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    this.scratchCtx = ctx;
    this.scratchCanvas = canvas;

    // Draw shimmering rose gold metallic top layer
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#E8C5BD');
    gradient.addColorStop(0.35, '#F5DDD7');
    gradient.addColorStop(0.7, '#DCA8A0');
    gradient.addColorStop(1, '#C88F85');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw glitter sparkle dots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    for (let i = 0; i < 90; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2 + 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Callout text on scratch card
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#6E3A46';
    ctx.font = 'bold 18px "Outfit", sans-serif';
    ctx.fillText('✨ Scratch Here With Love ✨', width / 2, height / 2 - 12);
    ctx.font = '14px "Caveat", cursive';
    ctx.fillStyle = '#8C4E5C';
    ctx.fillText('rub to reveal our sweet memory', width / 2, height / 2 + 16);

    // Setup Touch & Mouse Scratch Events
    let isDrawing = false;
    let throttleTimeout = null;

    const scratch = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fill();

      if (window.birthdayAudio) window.birthdayAudio.playScratchSound();

      // Throttle calculation of percentage
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          this.calculateScratchPercent();
          throttleTimeout = null;
        }, 120);
      }
    };

    // Mouse handlers
    canvas.onmousedown = (e) => { isDrawing = true; scratch(e.clientX, e.clientY); };
    window.onmousemove = (e) => { if (isDrawing) scratch(e.clientX, e.clientY); };
    window.onmouseup = () => { isDrawing = false; };

    // Touch handlers for mobile
    canvas.ontouchstart = (e) => {
      isDrawing = true;
      if (e.touches[0]) scratch(e.touches[0].clientX, e.touches[0].clientY);
    };
    canvas.ontouchmove = (e) => {
      e.preventDefault();
      if (isDrawing && e.touches[0]) scratch(e.touches[0].clientX, e.touches[0].clientY);
    };
    canvas.ontouchend = () => { isDrawing = false; };
  }

  calculateScratchPercent() {
    if (!this.scratchCtx || !this.scratchCanvas || this.isScratched) return;

    const width = this.scratchCanvas.width;
    const height = this.scratchCanvas.height;
    const imageData = this.scratchCtx.getImageData(0, 0, width, height);
    const data = imageData.data;
    let transparentPixels = 0;
    const totalPixels = data.length / 4;

    // Sample every 4th pixel for high performance
    for (let i = 3; i < data.length; i += 16) {
      if (data[i] === 0) transparentPixels++;
    }

    const percent = Math.min(100, Math.round((transparentPixels / (totalPixels / 4)) * 100));
    this.scratchPercent = percent;

    const label = document.getElementById('scratch-percent-label');
    const bar = document.getElementById('scratch-bar-fill');
    if (label) label.textContent = `Scratched: ${percent}%`;
    if (bar) bar.style.width = `${percent}%`;

    // Once > 40% is scratched, automatically reveal everything smoothly!
    if (percent >= 40 && !this.isScratched) {
      this.revealScratchCardFull();
    }
  }

  revealScratchCardFull() {
    this.isScratched = true;
    if (this.scratchCanvas) {
      this.scratchCanvas.style.transition = 'opacity 0.6s ease';
      this.scratchCanvas.style.opacity = '0';
      setTimeout(() => {
        this.scratchCanvas.style.display = 'none';
      }, 600);
    }

    const label = document.getElementById('scratch-percent-label');
    const bar = document.getElementById('scratch-bar-fill');
    const nextBtn = document.getElementById('scratch-next-btn');
    const skipBtn = document.getElementById('skip-scratch-btn');

    if (label) label.textContent = `Memory Revealed! 100% ✨`;
    if (bar) bar.style.width = `100%`;
    if (nextBtn) {
      nextBtn.disabled = false;
      nextBtn.classList.add('glow-btn');
    }
    if (skipBtn) skipBtn.style.display = 'none';

    if (window.birthdayAudio) window.birthdayAudio.playSuccessChime();
    if (window.particleEngine) window.particleEngine.fireConfetti();
  }

  /* =========================================================================
     SCREEN 8: FLOWER BLOOM SCREEN (12 Taps)
     ========================================================================= */
  setupScreen8Bloom() {
    const tapBtn = document.getElementById('flower-tap-btn');
    const continueBtn = document.getElementById('bloom-continue-btn');
    const counterText = document.getElementById('bloom-tap-count');
    const statusMsg = document.getElementById('bloom-status-msg');
    const finishWrap = document.getElementById('bloom-finish-wrap');

    const flowerHead = document.getElementById('flower-head');
    const stem = document.getElementById('flower-stem');
    const leafLeft = document.getElementById('leaf-left');
    const leafRight = document.getElementById('leaf-right');

    const messages = [
      "A tiny seed planted with love...",
      "A gentle green sprout reaches up 🌱",
      "Leaves unfurling towards warm sunlight 🍃",
      "Delicate little bud taking shape...",
      "First blush-pink petals whispering hello 🌸",
      "More petals opening in the morning breeze 🌷",
      "The fragrance of love growing sweeter...",
      "Layers of soft rose petals blossoming...",
      "Almost at its most radiant beauty...",
      "Magnificent and graceful!",
      "Just one more tap to full bloom...",
      "In full, breathtaking bloom! Just like you 🌹✨"
    ];

    if (tapBtn) {
      tapBtn.addEventListener('click', () => {
        if (this.bloomCount < this.maxBloom) {
          this.bloomCount++;

          // Audio: ascending harp pitch
          if (window.birthdayAudio) window.birthdayAudio.playFlowerBloom(this.bloomCount);

          // Update Counter UI
          if (counterText) counterText.textContent = this.bloomCount;
          if (statusMsg) statusMsg.textContent = messages[this.bloomCount - 1];

          // Progressive visual transformation of SVG flower
          const progress = this.bloomCount / this.maxBloom; // 0.08 to 1.0
          const scale = 0.2 + progress * 0.95; // 0.28 to 1.15
          const rotate = (this.bloomCount % 2 === 0 ? 1 : -1) * (this.bloomCount * 3);

          if (flowerHead) {
            flowerHead.setAttribute('transform', `translate(160, 195) scale(${scale}) rotate(${rotate})`);
          }

          if (this.bloomCount >= 3 && leafLeft) leafLeft.style.opacity = '1';
          if (this.bloomCount >= 6 && leafRight) leafRight.style.opacity = '1';

          // Spawn small petal sparkle
          if (window.particleEngine) {
            const rect = tapBtn.getBoundingClientRect();
            window.particleEngine.fireConfetti(rect.left + rect.width / 2, rect.top - 20, 10);
          }

          // Full bloom milestone reached
          if (this.bloomCount === this.maxBloom) {
            tapBtn.disabled = true;
            tapBtn.style.opacity = '0.5';
            if (finishWrap) finishWrap.classList.remove('hidden');

            if (window.birthdayAudio) window.birthdayAudio.playConfettiFanfare();
            if (window.particleEngine) window.particleEngine.fireConfetti(window.innerWidth / 2, window.innerHeight * 0.4, 80);
          }
        }
      });
    }

    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        this.goToScreen(9);
      });
    }
  }

  /* =========================================================================
     SCREEN 9: 5-QUESTION QUIZ SEQUENCE
     ========================================================================= */
  setupScreen9Quiz() {
    const nextBtn = document.getElementById('quiz-next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.goToScreen(10);
      });
    }
  }

  renderQuizQuestion(index) {
    if (index >= this.quizData.length) {
      // Quiz complete
      const stage = document.getElementById('quiz-card-stage');
      const completeCard = document.getElementById('quiz-complete-card');
      if (stage) stage.classList.add('hidden');
      if (completeCard) completeCard.classList.remove('hidden');

      if (window.birthdayAudio) window.birthdayAudio.playConfettiFanfare();
      if (window.particleEngine) window.particleEngine.fireConfetti();
      return;
    }

    const data = this.quizData[index];
    const questionText = document.getElementById('quiz-question-text');
    const progressText = document.getElementById('quiz-progress-text');
    const progressBar = document.getElementById('quiz-progress-bar');
    const optionsContainer = document.getElementById('quiz-options-container');
    const feedbackBox = document.getElementById('quiz-feedback-box');

    if (questionText) questionText.textContent = data.question;
    if (progressText) progressText.textContent = `Question ${index + 1} of 5`;
    if (progressBar) progressBar.style.width = `${((index + 1) / 5) * 100}%`;
    if (feedbackBox) feedbackBox.classList.add('hidden');

    if (optionsContainer) {
      optionsContainer.innerHTML = '';
      const letters = ['A', 'B', 'C', 'D'];

      data.options.forEach((opt, optIdx) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option-btn';
        btn.innerHTML = `
          <span class="opt-prefix">${letters[optIdx]}</span>
          <span class="opt-label">${opt.text}</span>
        `;

        btn.addEventListener('click', () => {
          // Prevent multiple taps
          const allOptions = optionsContainer.querySelectorAll('.quiz-option-btn');
          allOptions.forEach(b => b.disabled = true);
          btn.classList.add('selected');

          if (window.birthdayAudio) window.birthdayAudio.playQuizAnswer();

          // Show sweet feedback
          if (feedbackBox) {
            document.getElementById('feedback-msg').textContent = data.feedback;
            feedbackBox.classList.remove('hidden');
          }

          // Advance to next question after 850ms
          setTimeout(() => {
            this.quizIndex++;
            this.renderQuizQuestion(this.quizIndex);
          }, 850);
        });

        optionsContainer.appendChild(btn);
      });
    }
  }

  /* =========================================================================
     SCREEN 10: OUR MEMORIES GALLERY (Carousel)
     ========================================================================= */
  setupScreen10Carousel() {
    const prevBtn = document.getElementById('carousel-prev-btn');
    const nextBtn = document.getElementById('carousel-next-btn');
    const finalBtn = document.getElementById('memories-final-btn');
    const dots = document.querySelectorAll('.carousel-dot');
    const container = document.getElementById('memories-carousel-container');
    this.totalSlides = document.querySelectorAll('.carousel-slide').length;

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.carouselIndex = (this.carouselIndex - 1 + this.totalSlides) % this.totalSlides;
        this.updateCarousel(this.carouselIndex);
        if (window.birthdayAudio) window.birthdayAudio.playKeypadTap(3);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.carouselIndex = (this.carouselIndex + 1) % this.totalSlides;
        this.updateCarousel(this.carouselIndex);
        if (window.birthdayAudio) window.birthdayAudio.playKeypadTap(4);
      });
    }

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        this.carouselIndex = idx;
        this.updateCarousel(this.carouselIndex);
      });
    });

    if (finalBtn) {
      finalBtn.addEventListener('click', () => {
        this.goToScreen(11);
      });
    }

    // Touch Swipe Gestures for Mobile
    if (container) {
      let touchStartX = 0;
      let touchEndX = 0;

      container.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      container.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 40) {
          if (diff > 0) {
            // Swiped Left -> Next
            this.carouselIndex = (this.carouselIndex + 1) % this.totalSlides;
          } else {
            // Swiped Right -> Prev
            this.carouselIndex = (this.carouselIndex - 1 + this.totalSlides) % this.totalSlides;
          }
          this.updateCarousel(this.carouselIndex);
          if (window.birthdayAudio) window.birthdayAudio.playKeypadTap(3);
        }
      }, { passive: true });
    }

    this.updateCarousel(this.carouselIndex);
  }

  updateCarousel(index) {
    const track = document.getElementById('carousel-track');
    const counter = document.getElementById('gallery-counter');
    const dots = document.querySelectorAll('.carousel-dot');

    if (track) {
      track.style.transform = `translateX(-${index * 100}%)`;
    }

    if (counter) {
      counter.textContent = `${index + 1} of ${this.totalSlides}`;
    }

    dots.forEach((dot, idx) => {
      if (idx === index) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  /* =========================================================================
     SCREEN 11: FINAL NOTE SCREEN
     ========================================================================= */
  setupScreen11FinalNote() {
    const replayBtn = document.getElementById('replay-experience-btn');
    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        this.resetAllStates();
        this.goToScreen(1);
      });
    }
  }

  resetAllStates() {
    this.stopMicrophoneBlowDetection();
    this.passcode = [];
    this.wishMade = false;
    this.candlesBlown = false;
    this.poppedBalloons.clear();
    this.scratchPercent = 0;
    this.isScratched = false;
    this.bloomCount = 0;
    this.quizIndex = 0;
    this.carouselIndex = 0;

    // Reset UI Elements
    this.updatePasscodeDots();

    // Reset cake candles
    const flames = document.querySelectorAll('#cake-candles-row .cake-flame');
    flames.forEach(f => f.classList.remove('extinguished'));
    const smokeBox = document.getElementById('cake-smoke-box');
    if (smokeBox) smokeBox.innerHTML = '';
    const micBtn = document.getElementById('mic-blow-btn');
    if (micBtn) {
      micBtn.disabled = false;
      micBtn.textContent = '🎙️ Use Microphone';
    }
    const micStatus = document.getElementById('mic-blow-status');
    if (micStatus) micStatus.textContent = 'Allow microphone access, then blow gently to put out the candles.';
    const passcodeHint = document.getElementById('passcode-hint');
    if (passcodeHint) passcodeHint.innerHTML = '<span>💡 Enter Monai\'s special 4-digit birthday code.</span>';

    // Reset balloons
    const balloons = document.querySelectorAll('.balloon-wrapper');
    balloons.forEach(b => b.classList.remove('popped'));
    for (let i = 0; i < 4; i++) {
      const slot = document.getElementById(`slot-${i}`);
      if (slot) {
        slot.textContent = '_';
        slot.classList.remove('revealed');
      }
    }
    const counterBadge = document.getElementById('balloon-counter');
    if (counterBadge) counterBadge.textContent = '0 / 4 popped';
    const balloonContinue = document.getElementById('balloon-continue-wrap');
    if (balloonContinue) balloonContinue.classList.add('hidden');

    // Reset letter reasons
    const reasons = document.querySelectorAll('.reason-item');
    reasons.forEach(r => r.classList.remove('visible'));
    const revealAllBtn = document.getElementById('reveal-all-btn');
    if (revealAllBtn) revealAllBtn.style.display = 'inline-flex';

    // Reset scratch card
    const scratchCanvas = document.getElementById('scratch-canvas');
    if (scratchCanvas) {
      scratchCanvas.style.display = 'block';
      scratchCanvas.style.opacity = '1';
    }
    const scratchNext = document.getElementById('scratch-next-btn');
    if (scratchNext) {
      scratchNext.disabled = true;
      scratchNext.classList.remove('glow-btn');
    }
    const skipScratch = document.getElementById('skip-scratch-btn');
    if (skipScratch) skipScratch.style.display = 'inline-block';
    const scratchLabel = document.getElementById('scratch-percent-label');
    if (scratchLabel) scratchLabel.textContent = 'Scratched: 0%';
    const scratchBar = document.getElementById('scratch-bar-fill');
    if (scratchBar) scratchBar.style.width = '0%';

    // Reset flower
    const flowerHead = document.getElementById('flower-head');
    if (flowerHead) flowerHead.setAttribute('transform', 'translate(160, 195) scale(0.2)');
    const leafLeft = document.getElementById('leaf-left');
    const leafRight = document.getElementById('leaf-right');
    if (leafLeft) leafLeft.style.opacity = '0';
    if (leafRight) leafRight.style.opacity = '0';
    const bloomTapBtn = document.getElementById('flower-tap-btn');
    if (bloomTapBtn) {
      bloomTapBtn.disabled = false;
      bloomTapBtn.style.opacity = '1';
    }
    const bloomCountText = document.getElementById('bloom-tap-count');
    if (bloomCountText) bloomCountText.textContent = '0';
    const bloomFinishWrap = document.getElementById('bloom-finish-wrap');
    if (bloomFinishWrap) bloomFinishWrap.classList.add('hidden');

    // Reset quiz
    const quizStage = document.getElementById('quiz-card-stage');
    const quizComplete = document.getElementById('quiz-complete-card');
    if (quizStage) quizStage.classList.remove('hidden');
    if (quizComplete) quizComplete.classList.add('hidden');

    // Reset carousel
    this.updateCarousel(0);
  }
}

// Instantiate App on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.birthdayApp = new BirthdayApp();
});
