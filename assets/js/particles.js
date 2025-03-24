class Particles {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container with ID "${containerId}" not found.`);
            return;
        }
        this.options = {
            particleCount: 100,
            particleColor: '#ffffff',
            particleSize: 2,
            particleSpeed: 1,
            connectParticles: true,
            connectDistance: 100,
            responsive: [
                {
                    breakpoint: 768,
                    options: {
                        particleCount: 50,
                        connectDistance: 80
                    }
                },
                {
                    breakpoint: 480,
                    options: {
                        particleCount: 30,
                        connectDistance: 60
                    }
                }
            ]
        };
        this.options = { ...this.options, ...options };
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);
        this.resize();
        this.particles = [];
        this.createParticles();
        this.isAnimating = true;
        this.animate();
        window.addEventListener('resize', this.resize.bind(this));
        this.applyResponsiveOptions();
    }

    resize() {
        this.canvas.width = this.container.offsetWidth;
        this.canvas.height = this.container.offsetHeight;
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.options.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * this.options.particleSize + 1,
                color: this.options.particleColor,
                speedX: (Math.random() - 0.5) * this.options.particleSpeed,
                speedY: (Math.random() - 0.5) * this.options.particleSpeed
            });
        }
    }

    applyResponsiveOptions() {
        if (!this.options.responsive) return;
        const updateOptions = () => {
            const width = window.innerWidth;
            this.options.particleCount = 100;
            this.options.connectDistance = 100;
            for (const item of this.options.responsive) {
                if (width <= item.breakpoint) {
                    this.options = { ...this.options, ...item.options };
                    break;
                }
            }
            this.createParticles();
        };
        updateOptions();
        window.addEventListener('resize', updateOptions);
    }

    animate() {
        if (!this.isAnimating) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            p.x += p.speedX;
            p.y += p.speedY;
            if (p.x < 0 || p.x > this.canvas.width) {
                p.speedX *= -1;
            }
            if (p.y < 0 || p.y > this.canvas.height) {
                p.speedY *= -1;
            }
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.fill();
            if (this.options.connectParticles) {
                for (let j = i + 1; j < this.particles.length; j++) {
                    const p2 = this.particles[j];
                    const distance = Math.sqrt(
                        Math.pow(p.x - p2.x, 2) +
                        Math.pow(p.y - p2.y, 2)
                    );
                    if (distance <= this.options.connectDistance) {
                        this.ctx.beginPath();
                        this.ctx.strokeStyle = p.color;
                        this.ctx.lineWidth = 0.2;
                        this.ctx.moveTo(p.x, p.y);
                        this.ctx.lineTo(p2.x, p2.y);
                        this.ctx.stroke();
                    }
                }
            }
        }
        if (this.isAnimating) {
            requestAnimationFrame(this.animate.bind(this));
        }
    }

    stop() {
        this.isAnimating = false;
    }
}