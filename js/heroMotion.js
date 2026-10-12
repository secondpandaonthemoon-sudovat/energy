import { useEffect } from 'react';

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };

// Pure scene measurements: progress starts at this section's top, regardless of CMS order.
export function heroMotionFrame({ top, height, viewportHeight, enabled = true }) {
    const progress = enabled ? clamp(-top / Math.max(1, height - viewportHeight)) : 0;
    const titleExit = smooth(progress / 0.34);
    const reveal = smooth((progress - 0.66) / 0.24);
    const panelY = progress <= 0.18 ? 115
        : progress < 0.36 ? 115 * (1 - smooth((progress - 0.18) / 0.18))
        : progress <= 0.56 ? 0
        : progress < 0.78 ? -115 * smooth((progress - 0.56) / 0.22) : -115;
    return {
        progress,
        '--hero-top-y': `${-viewportHeight * 0.15 * titleExit}px`,
        '--hero-top-x': `${-viewportHeight * 0.055 * titleExit}px`,
        '--hero-bottom-y': `${viewportHeight * 0.14 * titleExit}px`,
        '--hero-bottom-x': `${viewportHeight * 0.055 * titleExit}px`,
        '--hero-title-opacity': `${1 - titleExit}`,
        '--hero-generator-y': `${enabled ? viewportHeight * (0.025 * smooth(progress / 0.4) - 0.04 * reveal) : 0}px`,
        '--hero-generator-scale': `${enabled ? 1 + 0.065 * smooth(progress / 0.45) + 0.035 * reveal : 1}`,
        '--hero-generator-rotate': `${enabled ? -3 * reveal : 0}deg`,
        '--hero-art-scale': `${enabled ? 1 + 0.13 * smooth(progress / 0.55) : 1}`,
        '--hero-art-y': `${enabled ? viewportHeight * 0.018 * smooth(progress / 0.5) : 0}px`,
        '--hero-panel-y': `${enabled ? panelY : 115}vh`,
        '--hero-panel-opacity': `${enabled && progress > 0.18 && progress < 0.78 ? 1 : 0}`,
        '--hero-stats-opacity': `${enabled ? 1 - 0.72 * smooth((progress - 0.12) / 0.2) + 0.72 * reveal : 1}`,
    };
}

export function useHeroMotion(sceneRef) {
    useEffect(() => {
        const scene = sceneRef.current;
        if (!scene) return;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const desktop = window.matchMedia('(min-width: 768px)');
        const infoCard = scene.querySelector('.hero-info-card');
        let frameId = 0;
        let disposed = false;
        let lastFrame = '';
        const update = () => {
            frameId = 0;
            if (disposed) return;
            const enabled = desktop.matches && !reducedMotion.matches;
            const mode = enabled ? 'full' : 'static';
            // Set mode before measuring; switching mode changes the scroll-track height.
            if (scene.dataset.motion !== mode) scene.dataset.motion = mode;
            const rect = scene.getBoundingClientRect();
            const frame = heroMotionFrame({ top: rect.top, height: rect.height, viewportHeight: window.innerHeight, enabled });
            const panelActive = enabled && frame.progress > 0.18 && frame.progress < 0.78;
            if (infoCard && panelActive && infoCard.contains(document.activeElement)) {
                scene.querySelector('.hero-actions button')?.focus({ preventScroll: true });
            }
            if (infoCard) infoCard.inert = panelActive;
            scene.dataset.panelActive = String(panelActive);
            const signature = JSON.stringify(frame);
            if (signature === lastFrame) return;
            lastFrame = signature;
            scene.style.setProperty('--hero-progress', String(frame.progress));
            for (const [name, value] of Object.entries(frame)) {
                if (name !== 'progress') scene.style.setProperty(name, value);
            }
        };
        const schedule = () => {
            if (!disposed && !frameId) frameId = window.requestAnimationFrame(update);
        };
        const listenMedia = query => {
            if (query.addEventListener) query.addEventListener('change', schedule);
            else query.addListener(schedule);
        };
        const unlistenMedia = query => {
            if (query.removeEventListener) query.removeEventListener('change', schedule);
            else query.removeListener(schedule);
        };
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule, { passive: true });
        window.addEventListener('pageshow', schedule);
        listenMedia(reducedMotion); listenMedia(desktop);
        const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
        resizeObserver?.observe(scene);
        // Earlier content can resize (fonts/images), shifting this section without a window resize.
        resizeObserver?.observe(document.documentElement);
        document.fonts?.ready.then(schedule);
        update();
        schedule();
        return () => {
            disposed = true;
            window.cancelAnimationFrame(frameId);
            window.removeEventListener('scroll', schedule);
            window.removeEventListener('resize', schedule);
            window.removeEventListener('pageshow', schedule);
            unlistenMedia(reducedMotion); unlistenMedia(desktop);
            resizeObserver?.disconnect();
        };
    }, [sceneRef]);
}
