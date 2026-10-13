import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Shield } from 'lucide-react';
import { siteConfig } from '../data/siteConfig.js';
import { cmsValue } from '../runtimeContent.js';
export const VideoReelModal = ({ isOpen, onClose, onOpenQuote, videoItem = null, }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [loadPercent, setLoadPercent] = useState(100);
    useEffect(() => {
        if (!isOpen)
            return;
        const interval = setInterval(() => {
            setLoadPercent((prev) => (prev === 100 ? 102 : prev === 102 ? 99 : 100));
        }, 1800);
        return () => clearInterval(interval);
    }, [isOpen]);
    const videoUrl = videoItem?.video || cmsValue('media.videoReel', '');
    const poster = videoItem?.poster || cmsValue('media.videoPoster', siteConfig.images.facilityEngineer);
    const autoPlay = videoItem?.autoplay ?? cmsValue('media.videoAutoplay', false);
    const loop = videoItem?.loop ?? cmsValue('media.videoLoop', true);
    const mutedDefault = videoItem?.muted ?? cmsValue('media.videoMuted', true);
    const modalTitle = videoItem?.title || 'Asay P33 Fabrika Yük & Harmonik Testi';
    const modalSubtitle = videoItem?.subtitle || 'TEST BENCH CAM 01 // LOAD BANK TELEMETRY';
    useEffect(() => { if (isOpen) { setIsMuted(Boolean(mutedDefault)); setIsPlaying(Boolean(videoUrl && autoPlay)); } }, [isOpen, mutedDefault, videoUrl, autoPlay]);
    const togglePlayback = async () => {
        const video = videoRef.current;
        if (!video) { setIsPlaying(value => !value); return; }
        if (video.paused) { try { await video.play(); } catch { setIsPlaying(false); } }
        else video.pause();
    };
    if (!isOpen) return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-in fade-in duration-200", children: _jsxs("div", { className: "relative w-full max-w-4xl bg-[#111] rounded-3xl shadow-2xl border border-white/10 overflow-hidden my-8 text-white", children: [_jsxs("div", { className: "p-4 md:p-6 bg-black/60 flex items-center justify-between border-b border-white/10", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" }), _jsxs("div", { children: [_jsx("span", { className: "text-[10px] font-mono tracking-widest text-neutral-400 uppercase", children: modalSubtitle }), _jsx("h3", { className: "text-base font-bold font-['Space_Grotesk'] text-white", children: modalTitle })] })] }), _jsx("button", { onClick: onClose, className: "p-2 rounded-full bg-[var(--theme-surface)]/10 text-white hover:bg-[var(--theme-surface)]/20 transition-colors cursor-pointer", "aria-label": "Kapat", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "relative aspect-video w-full bg-neutral-950 flex items-center justify-center overflow-hidden", children: [videoUrl ? _jsx("video", { ref: videoRef, onPlay: () => setIsPlaying(true), onPause: () => setIsPlaying(false), onEnded: () => setIsPlaying(false), onVolumeChange: () => setIsMuted(Boolean(videoRef.current?.muted)), src: videoUrl, poster: poster, autoPlay: autoPlay, loop: loop, muted: isMuted, controls: true, className: "w-full h-full object-cover" }) : _jsx("img", { src: poster, alt: "Y\u00FCk Testi", className: "w-full h-full object-cover filter brightness-[0.7] contrast-[1.1] scale-105 animate-pulse", style: { animationDuration: '4s' } }), _jsxs("div", { className: "absolute inset-0 p-6 flex flex-col justify-between pointer-events-none", children: [_jsxs("div", { className: "flex items-center justify-between text-xs font-mono text-emerald-400 bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("span", { children: "VOLTAJ: 401.2 V" }), _jsx("span", { children: "FREKANS: 50.04 HZ" }), _jsxs("span", { children: ["Y\u00DCK: %", loadPercent] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-400" }), _jsx("span", { children: "LOAD BANK: AKT\u0130F" })] })] }), _jsx("div", { className: "self-center pointer-events-auto", children: _jsx("button", { onClick: togglePlayback, className: "w-16 h-16 rounded-full bg-[var(--theme-primary)] text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer", children: isPlaying ? _jsx(Pause, { className: "w-7 h-7" }) : _jsx(Play, { className: "w-7 h-7 ml-1" }) }) }), _jsxs("div", { className: "flex items-center justify-between text-xs text-neutral-300 bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Shield, { className: "w-4 h-4 text-[var(--theme-primary)]" }), _jsx("span", { className: "font-semibold", children: "S\u0131cakl\u0131k: 84\u00B0C \u00B7 Ya\u011F Bas\u0131nc\u0131: 4.8 Bar \u00B7 Titre\u015Fim: 1.2 mm/s" })] }), _jsx("button", { onClick: () => setIsMuted(!isMuted), className: "pointer-events-auto p-1.5 rounded-lg hover:bg-[var(--theme-surface)]/10 cursor-pointer", children: isMuted ? _jsx(VolumeX, { className: "w-4 h-4" }) : _jsx(Volume2, { className: "w-4 h-4" }) })] })] })] }), _jsxs("div", { className: "p-4 md:p-6 bg-black flex flex-wrap items-center justify-between gap-4 border-t border-white/10", children: [_jsx("div", { className: "text-xs text-neutral-400", children: "T\u00FCm Asay Energy jenerat\u00F6rleri sevkiyat \u00F6ncesi 4 saat kesintisiz tam y\u00FCk testine tabi tutulur." }), _jsx("button", { onClick: () => {
                                onClose();
                                onOpenQuote();
                            }, className: "px-6 py-2.5 rounded-full bg-[var(--theme-primary)] text-white text-xs font-bold uppercase tracking-wider hover:bg-[var(--theme-primary-hover)] transition-colors cursor-pointer", children: "Bu Seri \u0130\u00E7in Teklif Al" })] })] }) }));
};
