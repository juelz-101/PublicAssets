import React, { useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ParticleBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { mode } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        let animationFrameId: number;
        const particles: { x: number; y: number; vx: number; vy: number; radius: number; alpha: number; }[] = [];
        let particleCount = 100;

        const resizeCanvas = () => {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
                particleCount = Math.floor((canvas.width * canvas.height) / 15000);
            }
        };

        const createParticles = () => {
            particles.length = 0;
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    radius: Math.random() * 1.5 + 0.5,
                    alpha: Math.random() * 0.5 + 0.1
                });
            }
        };

        resizeCanvas();
        createParticles();

        const color = mode === 'dark' ? 'rgba(8, 247, 254,' : 'rgba(255, 127, 80,';

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > canvas.width) p.x = Math.random() * canvas.width;
                if (p.y < 0 || p.y > canvas.height) p.y = Math.random() * canvas.height;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `${color} ${p.alpha})`;
                ctx.fill();
            });
            animationFrameId = requestAnimationFrame(animate);
        };
        
        animate();

        const handleResize = () => {
            resizeCanvas();
            createParticles();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };

    }, [mode]);


    return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" />;
};

export default ParticleBackground;