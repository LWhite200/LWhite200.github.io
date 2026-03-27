class TerrainClass {
    constructor({ canvas, ctx }) {
        this.canvas = canvas;
        this.ctx = ctx;

        this.tileSize = 12;
        this.COLS = Math.floor(canvas.width / this.tileSize);
        this.ROWS = Math.floor(canvas.height / this.tileSize);

        this.SECTION_COLS = 6;
        this.SECTION_ROWS = 6;
        this.SECTION_ROWS_VARIANCE = 1;

        this.AverageSectionHeight = this.SECTION_COLS / 2;

        this.grid = Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(0));
        this.heightMap = Array(this.COLS).fill(0); // Store continuous height values
    }

    // Generate smooth noise for natural bumpiness
    perlinNoise(x, frequency, amplitude) {
        const xi = Math.floor(x * frequency);
        const lerp = (x * frequency) - xi;
        
        // Simple hash function for pseudo-random values
        const hash = (n) => {
            n = ((n << 13) ^ n);
            return (n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff;
        };
        
        const a = (hash(xi) / 0x7fffffff) * amplitude;
        const b = (hash(xi + 1) / 0x7fffffff) * amplitude;
        
        // Smoothstep interpolation
        const smooth = lerp * lerp * (3 - 2 * lerp);
        return a + smooth * (b - a);
    }

    // Cubic interpolation for smooth transitions
    cubicInterpolate(p0, p1, p2, p3, t) {
        const t2 = t * t;
        const a0 = p3 - p2 - p0 + p1;
        const a1 = p0 - p1 - a0;
        const a2 = p2 - p0;
        const a3 = p1;
        
        return a0 * t * t2 + a1 * t2 + a2 * t + a3;
    }

    SECTION_COLS_HEIGHT() {
        const heights = Array(this.SECTION_COLS);
        const baseHeight = Math.floor(this.SECTION_ROWS / 2);

        heights[0] = baseHeight + Math.floor(Math.random() * this.SECTION_ROWS_VARIANCE);

        for (let i = 1; i < this.SECTION_COLS; i++) {
            let prev = heights[i - 1];
            let delta = Math.floor(Math.random() * (this.SECTION_ROWS_VARIANCE * 2 + 1)) - this.SECTION_ROWS_VARIANCE;
            let next = Math.max(1, Math.min(this.SECTION_ROWS - 1, prev + delta));
            heights[i] = next;
        }

        return heights;
    }

    FILL_SECTIONS_COLS_HEIGHTS(heights) {
        const sectionWidth = this.COLS / this.SECTION_COLS;
        const sectionHeightPixels = this.ROWS / this.SECTION_ROWS;

        // Create smooth height map for each column
        for (let x = 0; x < this.COLS; x++) {
            const sectionIndex = x / sectionWidth;
            const sectionFloor = Math.floor(sectionIndex);
            const sectionCeil = Math.min(this.SECTION_COLS - 1, Math.ceil(sectionIndex));
            
            // Get surrounding section heights for smooth interpolation
            const p0 = heights[Math.max(0, sectionFloor - 1)];
            const p1 = heights[sectionFloor];
            const p2 = heights[sectionCeil];
            const p3 = heights[Math.min(this.SECTION_COLS - 1, sectionCeil + 1)];
            
            // Interpolation parameter within section
            const t = sectionIndex - sectionFloor;
            
            // Smooth cubic interpolation between sections
            const smoothHeight = this.cubicInterpolate(p0, p1, p2, p3, t);
            
            // Add natural bumpiness using multiple octaves of noise
            let bumpiness = 0;
            bumpiness += this.perlinNoise(x, 0.05, 0.3);  // Large features
            bumpiness += this.perlinNoise(x, 0.15, 0.15); // Medium features
            bumpiness += this.perlinNoise(x, 0.4, 0.08);  // Small details
            
            // Reduce bumpiness on steep slopes
            const slope = Math.abs(p2 - p1);
            const bumpScale = Math.max(0.3, 1 - slope * 0.3);
            bumpiness *= bumpScale;
            
            const finalHeight = (smoothHeight + bumpiness) * sectionHeightPixels;
            this.heightMap[x] = finalHeight;
            
            // Fill grid based on height
            const terrainTop = Math.floor(this.ROWS - finalHeight);
            for (let y = terrainTop; y < this.ROWS; y++) {
                this.grid[y][x] = 1;
            }
        }
    }

    generate() {
        const heights = this.SECTION_COLS_HEIGHT();
        this.AverageSectionHeight = Math.floor(heights.reduce((a, b) => a + b, 0) / heights.length);
        console.log("Average Section Height:", this.AverageSectionHeight);
        this.FILL_SECTIONS_COLS_HEIGHTS(heights);
    }

    draw() {
        const ctx = this.ctx;
        
        for (let x = 0; x < this.COLS; x++) {
            // Find the top of terrain in this column
            let terrainTop = this.ROWS;
            for (let y = 0; y < this.ROWS; y++) {
                if (this.grid[y][x] === 1) {
                    terrainTop = y;
                    break;
                }
            }
            
            // Draw terrain column with depth-based coloring
            for (let y = terrainTop; y < this.ROWS; y++) {
                if (this.grid[y][x] === 1) {
                    const depth = y - terrainTop;
                    
                    // Grass/topsoil layer
                    if (depth === 0) {
                        ctx.fillStyle = "#5a8f3a";
                    }
                    // Dirt layers with variation
                    else if (depth < 3) {
                        const shade = 101 - depth * 8;
                        ctx.fillStyle = `rgb(${shade}, ${shade - 30}, ${shade - 60})`;
                    }
                    // Deeper layers - darker brown/stone
                    else {
                        const variation = (x + y) % 3;
                        const baseShade = Math.max(50, 80 - depth * 2);
                        const r = baseShade + variation * 3;
                        const g = baseShade - 20 + variation * 2;
                        const b = baseShade - 40 + variation;
                        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                    }
                    
                    ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                }
            }
            
            // Add surface highlights/shadows for depth
            if (terrainTop < this.ROWS) {
                // Calculate slope for this column
                const leftHeight = x > 0 ? this.heightMap[x - 1] : this.heightMap[x];
                const rightHeight = x < this.COLS - 1 ? this.heightMap[x + 1] : this.heightMap[x];
                const slope = rightHeight - leftHeight;
                
                // Highlight on left slopes, shadow on right slopes
                if (Math.abs(slope) > 0.1) {
                    const px = x * this.tileSize;
                    const py = terrainTop * this.tileSize;
                    
                    if (slope < 0) {
                        // Left-facing slope - highlight
                        ctx.fillStyle = 'rgba(255, 255, 200, 0.15)';
                    } else {
                        // Right-facing slope - shadow
                        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
                    }
                    ctx.fillRect(px, py, this.tileSize, this.tileSize);
                }
            }
        }
    }

    digUp(y, x) { this.grid[y][x] = 0; }
    digDown(y, x) { this.grid[y][x] = 0; }
}