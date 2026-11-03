export const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    const randomInRange = (min, max) => {
        return Math.random() * (max - min) + min;
    };
    const timer = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
            return clearInterval(timer);
        }
        const particleCount = 50 * (timeLeft / duration);
        // Since particles fall down, start a bit higher than random
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
    }, 250);
};
const confetti = (options) => {
    // This is a placeholder. For the best visual effect with ZERO dependencies, 
    // we would insert a canvas and animate it. 
    // Given the limited scope of a single file utility without modifying global styles too much,
    // I will assume we might install 'canvas-confetti' for the best result.
    // BUT, to stick to the plan of "Zero-Dependency", I'll create a DOM-based confetti burst here.
    const colors = ['#a864fd', '#29cdff', '#78ff44', '#ff718d', '#fdff6a'];
    for (let i = 0; i < (options.particleCount || 50); i++) {
        const el = document.createElement('div');
        el.style.position = 'fixed';
        // Random Start Position if origin not fixed
        const x = options.origin ? options.origin.x * 100 : Math.random() * 100;
        const y = options.origin ? options.origin.y * 100 : Math.random() * 100;
        el.style.left = x + 'vw';
        el.style.top = y + 'vh';
        el.style.width = '10px';
        el.style.height = '10px';
        el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        el.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        el.style.zIndex = '9999';
        el.style.pointerEvents = 'none';
        // Physics Simulation via CSS
        const angle = Math.random() * 360;
        const velocity = 50 + Math.random() * 100;
        el.animate([
            { transform: `translate(0, 0) rotate(0deg)`, opacity: 1 },
            { transform: `translate(${Math.cos(angle) * velocity}px, ${Math.sin(angle) * velocity + 200}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
        ], {
            duration: 1000 + Math.random() * 1000,
            easing: 'cubic-bezier(0, .9, .57, 1)',
            fill: 'forwards'
        }).onfinish = () => el.remove();
        document.body.appendChild(el);
    }
};
