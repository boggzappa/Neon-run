import { Point, Rect, SawDef, LaserDef, CoinDef, LevelDef, GameStatus, GameState } from './types';

// Constants
const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const MOVE_SPEED = 6;
const FRICTION = 0.85;
const PLAYER_WIDTH = 30;
const PLAYER_HEIGHT = 45;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  color: string;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private level: LevelDef;
  private onStateChange: (state: Partial<GameState>) => void;

  // Player state
  private player = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    grounded: false,
    doubleJumpAvailable: true,
  };

  // Input state
  public input = {
    left: false,
    right: false,
    up: false,
  };

  // Internal state
  private animationId: number | null = null;
  private coins: CoinDef[] = [];
  private currentSaws: SawDef[] = [];
  private currentLasers: LaserDef[] = [];
  private particles: Particle[] = [];
  private isRespawning = false;
  private lastTime = 0;
  private score = 0;
  private cameraX = 0;
  private cameraY = 0;

  constructor(canvas: HTMLCanvasElement, level: LevelDef, initialScore: number, onStateChange: (state: Partial<GameState>) => void) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.level = level;
    this.onStateChange = onStateChange;
    this.resetPlayer();
    this.coins = JSON.parse(JSON.stringify(level.coins));
    this.currentSaws = JSON.parse(JSON.stringify(level.saws));
    this.currentLasers = JSON.parse(JSON.stringify(level.lasers));
    this.score = initialScore;
  }

  public resetPlayer() {
    this.player.x = this.level.playerStart.x;
    this.player.y = this.level.playerStart.y;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.grounded = false;
    this.player.doubleJumpAvailable = true;
    this.isRespawning = false;
  }

  public start() {
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  private loop = (time: number) => {
    const dt = time - this.lastTime;
    this.lastTime = time;

    this.update(dt, time);
    this.draw();

    this.animationId = requestAnimationFrame(this.loop);
  };

  private update(dt: number, time: number) {
    if (this.isRespawning) {
      this.updateParticles(dt);
      this.updateHazards(dt, time); // Still update hazards while dying
      return;
    }

    // 1. Handle Input
    if (this.input.left) this.player.vx -= MOVE_SPEED * 0.1;
    if (this.input.right) this.player.vx += MOVE_SPEED * 0.1;
    if (this.input.up && this.player.grounded) {
      this.player.vy = JUMP_FORCE;
      this.player.grounded = false;
      this.input.up = false; // Prevent auto-rejump
    }

    // 2. Physics
    this.player.vy += GRAVITY;
    this.player.vx *= FRICTION;

    // Cap velocity
    if (Math.abs(this.player.vx) > MOVE_SPEED) {
      this.player.vx = Math.sign(this.player.vx) * MOVE_SPEED;
    }

    // Move Horizontal
    this.player.x += this.player.vx;
    this.checkPlatformCollisions(true);

    // Move Vertical
    this.player.y += this.player.vy;
    this.checkPlatformCollisions(false);

    // World boundaries
    if (this.player.x < 0) this.player.x = 0;
    if (this.player.x + this.player.width > this.level.width) {
      this.player.x = this.level.width - this.player.width;
    }
    if (this.player.y > this.level.height + 200) {
      this.handleDeath();
    }

    // 3. Hazard Updates
    this.updateHazards(dt, time);

    // 4. Collision with hazards
    this.checkHazardCollisions();

    // 5. Collision with coins
    this.checkCoinCollisions();

    // 6. Collision with Goal
    if (this.rectIntersect(this.player, this.level.goal)) {
      this.onStateChange({ status: 'LEVEL_COMPLETE' });
    }

    // Update particles
    this.updateParticles(dt);

    // Update Camera
    this.cameraX = this.player.x - this.canvas.width / 2;
    if (this.cameraX < 0) this.cameraX = 0;
    if (this.cameraX > this.level.width - this.canvas.width) {
      this.cameraX = this.level.width - this.canvas.width;
    }

    this.cameraY = this.player.y - this.canvas.height / 2;
    if (this.cameraY < 0) this.cameraY = 0;
    if (this.cameraY > this.level.height - this.canvas.height) {
      this.cameraY = this.level.height - this.canvas.height;
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt * 0.002;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private spawnDeathExplosion(x: number, y: number) {
    const count = 20;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 6 + 2,
        life: 1.0,
        color: '#06b6d4', // Cyan like the player
      });
    }
    // Also some white sparks
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 1,
        life: 0.8,
        color: '#ffffff',
      });
    }
  }

  private updateHazards(dt: number, time: number) {
    // Saws - Smooth oscillation
    for (const saw of this.currentSaws) {
      if (saw.path.length < 2) continue;
      
      const p1 = saw.path[0];
      const p2 = saw.path[1];
      
      // Use sine wave for smooth back-and-forth movement
      // Speed determines the frequency of oscillation
      const oscillation = (Math.sin(time * saw.speed) + 1) / 2;
      
      saw.x = p1.x + (p2.x - p1.x) * oscillation;
      saw.y = p1.y + (p2.y - p1.y) * oscillation;
    }

    // Lasers
    for (const laser of this.currentLasers) {
      const cycleTime = (time + laser.offset) % laser.period;
      const activeTime = laser.activeDuration || (laser.period / 2);
      laser.isActive = cycleTime < activeTime;
    }
  }

  private checkPlatformCollisions(horizontal: boolean) {
    if (!horizontal) this.player.grounded = false;
    
    for (const plat of this.level.platforms) {
      if (this.rectIntersect(this.player, plat)) {
        if (horizontal) {
          // Only resolve horizontal collision if we overlap significantly in Y
          const overlapY = Math.min(this.player.y + this.player.height, plat.y + plat.height) - Math.max(this.player.y, plat.y);
          if (overlapY > 5) {
            if (this.player.vx > 0) this.player.x = plat.x - this.player.width;
            else if (this.player.vx < 0) this.player.x = plat.x + plat.width;
            this.player.vx = 0;
          }
        } else {
          // Only resolve vertical collision if we overlap significantly in X
          const overlapX = Math.min(this.player.x + this.player.width, plat.x + plat.width) - Math.max(this.player.x, plat.x);
          if (overlapX > 2) {
            if (this.player.vy > 0) {
              this.player.y = plat.y - this.player.height;
              this.player.grounded = true;
            } else if (this.player.vy < 0) {
              this.player.y = plat.y + plat.height;
            }
            this.player.vy = 0;
          }
        }
      }
    }
  }

  private checkHazardCollisions() {
    // Spikes
    for (const spike of this.level.spikes) {
      if (this.rectIntersect(this.player, spike)) {
        this.handleDeath();
        return;
      }
    }

    // Saws
    for (const saw of this.currentSaws) {
      const dist = Math.sqrt(
        Math.pow(this.player.x + this.player.width / 2 - saw.x, 2) +
        Math.pow(this.player.y + this.player.height / 2 - saw.y, 2)
      );
      if (dist < saw.radius + Math.min(this.player.width, this.player.height) / 2) {
        this.handleDeath();
        return;
      }
    }

    // Lasers
    for (const laser of this.currentLasers) {
      if (!laser.isActive) continue;
      if (this.lineRectIntersect(laser.x1, laser.y1, laser.x2, laser.y2, this.player)) {
        this.handleDeath();
        return;
      }
    }
  }

  private checkCoinCollisions() {
    for (const coin of this.coins) {
      if (!coin.collected) {
        const coinRect = { x: coin.x - 10, y: coin.y - 10, width: 20, height: 20 };
        if (this.rectIntersect(this.player, coinRect)) {
          coin.collected = true;
          this.score += 100;
          this.onStateChange({ score: this.score, totalCoins: this.coins.filter(c => c.collected).length });
        }
      }
    }
  }

  private handleDeath() {
    if (this.isRespawning) return;
    this.isRespawning = true;
    this.spawnDeathExplosion(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
    
    setTimeout(() => {
      this.resetPlayer();
      this.onStateChange({ lives: -1 });
    }, 1000);
  }

  private rectIntersect(r1: Rect, r2: Rect): boolean {
    return !(r2.x > r1.x + r1.width ||
             r2.x + r2.width < r1.x ||
             r2.y > r1.y + r1.height ||
             r2.y + r2.height < r1.y);
  }

  private lineRectIntersect(x1: number, y1: number, x2: number, y2: number, rect: Rect): boolean {
    // Simplified: check if line segment intersects any of the 4 edges of the rect
    // For vertical/horizontal lasers as in our levels, this is easier
    if (x1 === x2) { // Vertical
      return x1 > rect.x && x1 < rect.x + rect.width && Math.min(y1, y2) < rect.y + rect.height && Math.max(y1, y2) > rect.y;
    } else if (y1 === y2) { // Horizontal
      return y1 > rect.y && y1 < rect.y + rect.height && Math.min(x1, x2) < rect.x + rect.width && Math.max(x1, x2) > rect.x;
    }
    return false; // Complex diagonal not used in current levels
  }

  private draw() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(-this.cameraX, -this.cameraY);

    // Draw Platforms
    ctx.fillStyle = '#1e1b4b'; // Dark blue/purple
    ctx.strokeStyle = '#a855f7'; // Purple glow
    ctx.lineWidth = 2;
    for (const plat of this.level.platforms) {
      ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
      ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);
    }

    // Draw Spikes
    ctx.fillStyle = '#ef4444';
    for (const spike of this.level.spikes) {
      const count = Math.ceil(spike.width / 20);
      const w = spike.width / count;
      for (let i = 0; i < count; i++) {
        ctx.beginPath();
        ctx.moveTo(spike.x + i * w, spike.y + spike.height);
        ctx.lineTo(spike.x + i * w + w / 2, spike.y);
        ctx.lineTo(spike.x + (i + 1) * w, spike.y + spike.height);
        ctx.fill();
      }
    }

    // Draw Saws
    for (const saw of this.currentSaws) {
      ctx.save();
      ctx.translate(saw.x, saw.y);
      ctx.rotate(performance.now() * 0.01);
      ctx.fillStyle = '#f43f5e'; // Rose
      ctx.beginPath();
      // Draw saw teeth
      const teeth = 8;
      for (let i = 0; i < teeth * 2; i++) {
        const angle = (i * Math.PI) / teeth;
        const r = i % 2 === 0 ? saw.radius : saw.radius * 0.7;
        ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(0, 0, saw.radius * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Draw Lasers
    for (const laser of this.currentLasers) {
      if (laser.isActive) {
        ctx.strokeStyle = '#f472b6'; // Pink
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(laser.x1, laser.y1);
        ctx.lineTo(laser.x2, laser.y2);
        ctx.stroke();
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(laser.x1, laser.y1);
        ctx.lineTo(laser.x2, laser.y2);
        ctx.stroke();

        // Glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#f472b6';
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    // Draw Coins
    ctx.fillStyle = '#fbbf24'; // Yellow/Gold
    ctx.shadowBlur = 5;
    ctx.shadowColor = '#fbbf24';
    for (const coin of this.coins) {
      if (!coin.collected) {
        ctx.beginPath();
        ctx.arc(coin.x, coin.y + Math.sin(performance.now() * 0.005) * 5, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.shadowBlur = 0;

    // Draw Goal
    ctx.fillStyle = '#22c55e'; // Green
    ctx.globalAlpha = 0.6;
    ctx.fillRect(this.level.goal.x, this.level.goal.y, this.level.goal.width, this.level.goal.height);
    ctx.globalAlpha = 1.0;
    ctx.strokeStyle = '#4ade80';
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(this.level.goal.x, this.level.goal.y, this.level.goal.width, this.level.goal.height);
    ctx.setLineDash([]);

    // Draw Player
    if (!this.isRespawning) {
      ctx.fillStyle = '#06b6d4'; // Cyan
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#06b6d4';
      // Square player
      ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
      // Eyes
      ctx.fillStyle = '#fff';
      ctx.fillRect(this.player.x + 5, this.player.y + 10, 5, 5);
      ctx.fillRect(this.player.x + 20, this.player.y + 10, 5, 5);
      ctx.shadowBlur = 0;
    }

    // Draw Particles
    for (const p of this.particles) {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1.0;

    ctx.restore();
  }
}
