class Sky {
  constructor({ canvas, ctx }) {
    this.canvas = canvas;
    this.ctx = ctx;

    this.clouds = [];

    this.cloudSpawnInterval = 1500; // spawn new clouds every 1.5s
    this.lastSpawn = 0;

    this.cloudSpeedMin = 0.1;
    this.cloudSpeedMax = 0.5;

    requestAnimationFrame(this.update.bind(this));
  }

  // Generates a cloud with random shape, returns offscreen canvas
  generateCloudImage(width = 150, height = 60, puffCount = 3) {
    const cloudCanvas = document.createElement("canvas");
    cloudCanvas.width = width;
    cloudCanvas.height = height;
    const cctx = cloudCanvas.getContext("2d");

    for (let i = 0; i < puffCount; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height * 0.7;
      const r = 20 + Math.random() * 25;

      const gradient = cctx.createRadialGradient(rx, ry, r * 0.3, rx, ry, r);
      gradient.addColorStop(0, "rgba(255,255,255," + (0.7 + Math.random() * 0.3) + ")");
      gradient.addColorStop(1, "rgba(255,255,255,0)");

      cctx.fillStyle = gradient;
      cctx.beginPath();
      cctx.arc(rx, ry, r, 0, Math.PI * 2);
      cctx.fill();
    }

    return cloudCanvas;
  }

  spawnCloud() {
    const y = Math.random() * this.canvas.height * 0.4; // top 40% of screen
    const speed = this.cloudSpeedMin + Math.random() * (this.cloudSpeedMax - this.cloudSpeedMin);
    const scale = 0.5 + Math.random() * 1.0;
    const width = 100 + Math.random() * 100;
    const height = 40 + Math.random() * 40;
    const puffCount = 3 + Math.floor(Math.random() * 5);

    const cloudImage = this.generateCloudImage(width, height, puffCount);

    this.clouds.push({
      x: -width - 50, // spawn offscreen left
      y,
      speed,
      scale,
      cloudImage
    });
  }

  update(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const delta = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.lastSpawn += delta;
    if (this.lastSpawn > this.cloudSpawnInterval) {
      this.spawnCloud();
      this.lastSpawn = 0;
    }

    // Move clouds
    for (let cloud of this.clouds) {
      cloud.x += cloud.speed * delta;
    }

    // Remove offscreen clouds
    this.clouds = this.clouds.filter(c => c.x - c.cloudImage.width * c.scale < this.canvas.width);

    requestAnimationFrame(this.update.bind(this));
  }

  draw() {
    const ctx = this.ctx;

    // Draw darker sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    grad.addColorStop(0, "#0d1f3c"); // dark blue top
    grad.addColorStop(1, "#4a6fa5"); // lighter at bottom
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw clouds
    for (let cloud of this.clouds) {
      ctx.drawImage(
        cloud.cloudImage,
        cloud.x,
        cloud.y,
        cloud.cloudImage.width * cloud.scale,
        cloud.cloudImage.height * cloud.scale
      );
    }
  }
}
