/**
 * MONAI'S BIRTHDAY APP - CANVAS CONFETTI & AMBIENT HEARTS ENGINE
 * High-performance 60fps lightweight particles for celebratory bursts & romantic ambience.
 */

class ParticleEffectsEngine {
  constructor() {
    this.ambientCanvas = document.getElementById('ambient-canvas');
    this.ambientCtx = this.ambientCanvas ? this.ambientCanvas.getContext('2d') : null;

    this.confettiCanvas = document.getElementById('confetti-canvas');
    this.confettiCtx = this.confettiCanvas ? this.confettiCanvas.getContext('2d') : null;

    this.ambientParticles = [];
    this.confettiParticles = [];
    this.isNightMode = false;

    this.colors = [
      '#FFB7C5', '#F78DA7', '#E89A8E', '#C86D7C', 
      '#D4AF37', '#F5C968', '#D4C5F9', '#FFF0F5'
    ];

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Populate initial ambient particles
    this.createAmbientParticles();

    // Start render loop
    requestAnimationFrame(() => this.loop());
  }

  resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (this.ambientCanvas) {
      this.ambientCanvas.width = width;
      this.ambientCanvas.height = height;
    }
    if (this.confettiCanvas) {
      this.confettiCanvas.width = width;
      this.confettiCanvas.height = height;
    }
  }

  setNightMode(active) {
    this.isNightMode = active;
  }

  createAmbientParticles() {
    const count = window.innerWidth < 600 ? 25 : 45;
    this.ambientParticles = [];

    for (let i = 0; i < count; i++) {
      this.ambientParticles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 3.5 + 1.5,
        speedY: Math.random() * 0.4 + 0.15,
        speedX: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.2,
        isHeart: Math.random() > 0.65,
        angle: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        color: this.colors[Math.floor(Math.random() * this.colors.length)]
      });
    }
  }

  // Celebratory Confetti Burst
  fireConfetti(originX = window.innerWidth / 2, originY = window.innerHeight * 0.4, count = 90) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 12 + 6;
      this.confettiParticles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * velocity + (Math.random() - 0.5) * 4,
        vy: Math.sin(angle) * velocity - Math.random() * 4,
        size: Math.random() * 9 + 5,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 15,
        gravity: 0.32,
        drag: 0.96,
        opacity: 1,
        shape: Math.random() > 0.4 ? 'rect' : (Math.random() > 0.5 ? 'circle' : 'heart'),
        life: 0,
        maxLife: Math.random() * 90 + 90
      });
    }
  }

  // Floating Hearts Shower (for Screen 11 & Celebration)
  showerHearts(count = 35) {
    for (let i = 0; i < count; i++) {
      this.confettiParticles.push({
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + Math.random() * 50,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -(Math.random() * 3.5 + 2),
        size: Math.random() * 12 + 10,
        color: this.colors[Math.floor(Math.random() * 4)],
        rotation: (Math.random() - 0.5) * 30,
        rotationSpeed: (Math.random() - 0.5) * 2,
        gravity: -0.02,
        drag: 0.99,
        opacity: 1,
        shape: 'heart',
        life: 0,
        maxLife: 200
      });
    }
  }

  drawHeart(ctx, x, y, size, color, opacity = 1, angle = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.beginPath();
    const d = size;
    ctx.moveTo(0, d / 4);
    ctx.quadraticCurveTo(0, 0, d / 4, 0);
    ctx.quadraticCurveTo(d / 2, 0, d / 2, d / 4);
    ctx.quadraticCurveTo(d / 2, 0, (d * 3) / 4, 0);
    ctx.quadraticCurveTo(d, 0, d, d / 4);
    ctx.quadraticCurveTo(d, d / 2, (d * 3) / 4, (d * 3) / 4);
    ctx.lineTo(d / 2, d);
    ctx.lineTo(d / 4, (d * 3) / 4);
    ctx.quadraticCurveTo(0, d / 2, 0, d / 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  loop() {
    // 1. Render Ambient Layer
    if (this.ambientCtx && this.ambientCanvas) {
      this.ambientCtx.clearRect(0, 0, this.ambientCanvas.width, this.ambientCanvas.height);

      for (let p of this.ambientParticles) {
        p.y -= p.speedY;
        p.x += p.speedX;
        p.angle += p.pulseSpeed;

        // Wrap around
        if (p.y < -20) {
          p.y = window.innerHeight + 10;
          p.x = Math.random() * window.innerWidth;
        }
        if (p.x < -20) p.x = window.innerWidth + 10;
        if (p.x > window.innerWidth + 20) p.x = -10;

        const dynamicOpacity = Math.max(0.1, p.opacity + Math.sin(p.angle) * 0.2);

        if (p.isHeart && !this.isNightMode) {
          this.drawHeart(this.ambientCtx, p.x, p.y, p.size * 2, p.color, dynamicOpacity * 0.6, p.angle * 0.5);
        } else {
          // Soft glowing orb / star dust
          this.ambientCtx.save();
          this.ambientCtx.globalAlpha = this.isNightMode ? dynamicOpacity * 1.2 : dynamicOpacity * 0.45;
          this.ambientCtx.fillStyle = this.isNightMode ? '#FFE8A3' : p.color;
          this.ambientCtx.beginPath();
          this.ambientCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          this.ambientCtx.fill();
          this.ambientCtx.restore();
        }
      }
    }

    // 2. Render Confetti & Dynamic Particles
    if (this.confettiCtx && this.confettiCanvas) {
      this.confettiCtx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);

      for (let i = this.confettiParticles.length - 1; i >= 0; i--) {
        const p = this.confettiParticles[i];
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.life++;

        if (p.life > p.maxLife - 30) {
          p.opacity = Math.max(0, (p.maxLife - p.life) / 30);
        }

        if (p.life >= p.maxLife || p.y > window.innerHeight + 50) {
          this.confettiParticles.splice(i, 1);
          continue;
        }

        this.confettiCtx.save();
        this.confettiCtx.translate(p.x, p.y);
        this.confettiCtx.rotate((p.rotation * Math.PI) / 180);
        this.confettiCtx.globalAlpha = p.opacity;
        this.confettiCtx.fillStyle = p.color;

        if (p.shape === 'heart') {
          this.drawHeart(this.confettiCtx, -p.size / 2, -p.size / 2, p.size, p.color, p.opacity);
        } else if (p.shape === 'circle') {
          this.confettiCtx.beginPath();
          this.confettiCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          this.confettiCtx.fill();
        } else {
          this.confettiCtx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }

        this.confettiCtx.restore();
      }
    }

    requestAnimationFrame(() => this.loop());
  }
}

// Global particle engine singleton
window.particleEngine = new ParticleEffectsEngine();
