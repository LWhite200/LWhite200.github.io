class Water {
  constructor({ canvas, ctx, terrain }) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.terrain = terrain;

    this.tileSize = terrain.tileSize;
    this.COLS = terrain.COLS;
    this.ROWS = terrain.ROWS;

    this.grid = Array.from({ length: this.ROWS }, () =>
      Array.from({ length: this.COLS }, () => ({ water: 0 }))
    );

    this.MAX_WATER = 1.0;
    this.MIN_WATER = 0.01;

    this.sectionPixelHeight = Math.floor(terrain.ROWS / terrain.SECTION_ROWS);
    this.waterLine = terrain.AverageSectionHeight * this.sectionPixelHeight;

    this.totalWater = this.calculateWaterVolume();
    this.spawnWaterMass();

    setInterval(() => this.simulateStep(), 16);

    // Water color (base) and max opacity
    this.baseColor = [26, 84, 144]; // RGB for water
    this.maxAlpha = 0.8;            // max opacity
  }

  calculateWaterVolume() {
    let count = 0;
    for (let y = this.waterLine; y < this.ROWS; y++) {
      for (let x = 0; x < this.COLS; x++) {
        if (this.terrain.grid[y][x] === 0) count++;
      }
    }
    return count * 0.7;
  }

  spawnWaterMass() {
    let remaining = this.totalWater;
    for (let y = 0; y < this.ROWS && remaining > 0; y++) {
      for (let x = 0; x < this.COLS && remaining > 0; x++) {
        if (this.terrain.grid[y][x] === 0) {
          const amount = Math.min(remaining, this.MAX_WATER);
          this.grid[y][x].water = amount;
          remaining -= amount;
        }
      }
    }
    console.log("Spawned water:", this.totalWater - remaining);
  }

  isSolid(x, y) {
    if (x < 0 || x >= this.COLS || y < 0 || y >= this.ROWS) return true;
    return this.terrain.grid[y][x] === 1;
  }

  simulateStep() {
    const newGrid = this.grid.map(row => row.map(cell => ({ water: cell.water })));

    for (let y = this.ROWS - 1; y >= 0; y--) {
      for (let x = 0; x < this.COLS; x++) {
        if (newGrid[y][x].water < this.MIN_WATER) {
          newGrid[y][x].water = 0;
          continue;
        }

        let water = newGrid[y][x].water;

        // 1. Fall straight down
        if (y < this.ROWS - 1 && !this.isSolid(x, y + 1)) {
          const space = this.MAX_WATER - newGrid[y + 1][x].water;
          if (space > 0) {
            const flow = Math.min(water, space);
            newGrid[y][x].water -= flow;
            newGrid[y + 1][x].water += flow;
            continue;
          }
        }

        // 2. Fall diagonally
        const diags = [
          [x - 1, y + 1],
          [x + 1, y + 1]
        ].sort(() => Math.random() - 0.5);

        let movedDiag = false;
        for (let [dx, dy] of diags) {
          if (!this.isSolid(dx, dy)) {
            const space = this.MAX_WATER - newGrid[dy][dx].water;
            if (space > this.MIN_WATER) {
              const flow = Math.min(water * 0.5, space);
              newGrid[y][x].water -= flow;
              newGrid[dy][dx].water += flow;
              movedDiag = true;
              break;
            }
          }
        }
        if (movedDiag) continue;

        // 3. Spread horizontally
        water = newGrid[y][x].water;
        const neighbors = [[x - 1, y], [x + 1, y]];
        for (let [nx, ny] of neighbors) {
          if (!this.isSolid(nx, ny)) {
            const nWater = newGrid[ny][nx].water;
            const diff = water - nWater;
            if (diff > 0.05) {
              const flow = Math.min(diff * 0.1, water * 0.1);
              if (flow > this.MIN_WATER) {
                newGrid[y][x].water -= flow;
                newGrid[ny][nx].water += flow;
                water -= flow;
              }
            }
          }
        }
      }
    }

    this.grid = newGrid;
  }

  draw() {
    for (let y = 0; y < this.ROWS; y++) {
      for (let x = 0; x < this.COLS; x++) {
        const w = this.grid[y][x].water;
        if (w > this.MIN_WATER) {
          // Set fill style with semi-transparent alpha
          const alpha = w * this.maxAlpha; // stronger water = more opaque
          this.ctx.fillStyle = `rgba(${this.baseColor[0]}, ${this.baseColor[1]}, ${this.baseColor[2]}, ${alpha})`;
          this.ctx.fillRect(
            x * this.tileSize,
            y * this.tileSize,
            this.tileSize,
            this.tileSize
          );
        }
      }
    }
  }
}
