import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Sliders, Sparkles } from 'lucide-react';
import { useReducedMotion } from '../utils/useReducedMotion';

function safePlay(video, name = 'turntableVideo') {
  if (!video || typeof video.play !== 'function') return;
  try {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    const p = video.play();
    if (p && typeof p.catch === 'function') {
      p.catch((err) => {
        console.error(`[safePlay] ${name}.play() blocked or rejected:`, err.name, err.message);
      });
    }
  } catch (err) {
    console.error(`[safePlay] ${name}.play() threw synchronously:`, err);
  }
}

const DEFENDER_PALETTE = [
  { id: 'giallo-vivo', name: 'GIALLO VIVO', hex: '#ffc000', badge: 'HERO OCTA LAUNCH SPEC' },
  { id: 'pangea-green', name: 'PANGEA GREEN', hex: '#4b5b48', badge: 'SOLIHULL HERITAGE SPEC' },
  { id: 'tasman-blue', name: 'TASMAN BLUE', hex: '#2e434f', badge: 'EXPEDITION OCEANIC METALLIC' },
  { id: 'carpathian-grey', name: 'CARPATHIAN GREY', hex: '#35393c', badge: 'PREMIUM SATIN GRAPHITE' },
  { id: 'fuji-white', name: 'FUJI WHITE', hex: '#f0f2f3', badge: 'HIGH-CONTRAST ARCTIC SPEC' }
];

export default function StudioConfigurator({
  initialColor = '#ffc000',
  currentColor: propCurrentColor,
  onColorChange,
  selectedPresetId: propSelectedPresetId,
  onSelectPreset,
  forceReducedMotion,
  isActive = true
}) {
  const [internalColor, setInternalColor] = useState(initialColor);
  const [internalPresetId, setInternalPresetId] = useState('giallo-vivo');
  const colorInputRef = useRef(null);
  const turntableVideoRef = useRef(null);

  const currentColor = propCurrentColor !== undefined ? propCurrentColor : internalColor;
  const selectedPresetId = propSelectedPresetId !== undefined ? propSelectedPresetId : internalPresetId;

  const systemReducedMotion = useReducedMotion();
  const prefersReducedMotion = forceReducedMotion !== undefined ? forceReducedMotion : systemReducedMotion;

  // Pause background turntable video when tab is inactive to preserve CPU, GPU & battery
  useEffect(() => {
    if (!turntableVideoRef.current) return;
    if (isActive) {
      safePlay(turntableVideoRef.current, 'turntableVideo');
    } else {
      try {
        turntableVideoRef.current.pause();
      } catch {
        // ignore pause errors
      }
    }
  }, [isActive]);

  const handleSelectPreset = (swatch) => {
    if (onSelectPreset) {
      onSelectPreset(swatch);
    } else {
      setInternalPresetId(swatch.id);
      setInternalColor(swatch.hex);
    }
  };

  const handleCustomHexChange = (e) => {
    const hex = e.target.value;
    if (onColorChange) {
      onColorChange(hex);
    } else {
      setInternalColor(hex);
      setInternalPresetId('custom');
    }
  };

  const currentSwatchInfo = DEFENDER_PALETTE.find((s) => s.id === selectedPresetId) || {
    id: 'custom',
    name: 'BESPOKE SVO COLOR',
    hex: currentColor,
    badge: 'SPECIAL VEHICLE OPERATIONS BESPOKE SPEC'
  };

  return (
    <div
      className="studio-configurator-wrap"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#0c0c0c',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        touchAction: 'none'
      }}
    >
      {/* 2D Studio Photography Canvas on Turntable Video */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          flex: 1,
          minHeight: '380px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Layer 1: studio-turntable background loop */}
        <div
          className="studio-turntable-base-layer"
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            zIndex: 1
          }}
        >
          {prefersReducedMotion ? (
            <img
              src="/videos/studio-turntable-poster.jpg"
              alt="Defender Solihull Studio Turntable"
              className="studio-turntable-poster"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <video
              ref={(el) => {
                turntableVideoRef.current = el;
                if (el) {
                  el.muted = true;
                  el.defaultMuted = true;
                  el.playsInline = true;
                }
              }}
              className="studio-turntable-video"
              autoPlay={isActive}
              muted
              loop
              playsInline
              preload="metadata"
              poster="/videos/studio-turntable-poster.jpg"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            >
              <source src="/videos/studio-turntable.webm" type="video/webm" />
              <source src="/videos/studio-turntable.mp4" type="video/mp4" />
            </video>
          )}

          {/* Color-swatch tint overlay on turntable background for ambient lighting reflection */}
          <div
            className="studio-swatch-tint-overlay"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: currentColor,
              mixBlendMode: 'color',
              opacity: 0.06,
              pointerEvents: 'none',
              transition: 'background-color 400ms cubic-bezier(0.16, 1, 0.3, 1), opacity 400ms ease'
            }}
          />
        </div>

        {/* Layer 2: ORIGINAL 2D Studio Photography Asset Centered on Turntable */}
        <div
          className="studio-vehicle-stage"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            pointerEvents: 'none'
          }}
        >
          <div
            className="studio-2d-vehicle-wrapper"
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            {/* High-res 2D Studio Defender Photograph */}
            <img
              src="/images/defender-90-studio.jpg"
              alt="Defender Solihull Studio 2D Spec"
              className="studio-vehicle-photo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                pointerEvents: 'none',
                userSelect: 'none',
                filter: 'contrast(1.05) brightness(1.02)'
              }}
            />

            {/* Body Panel Color Overlay with smooth ~400ms transition (body panels only, not glass/tires/trim) */}
            <div
              className="studio-vehicle-body-tint"
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: currentColor,
                mixBlendMode: 'color',
                opacity: selectedPresetId === 'carpathian-grey' ? 0.35 : selectedPresetId === 'fuji-white' ? 0.40 : 0.88,
                pointerEvents: 'none',
                transition: 'background-color 400ms cubic-bezier(0.16, 1, 0.3, 1), opacity 400ms ease',
                maskImage: 'url(/images/defender-body-mask.png)',
                WebkitMaskImage: 'url(/images/defender-body-mask.png)',
                maskSize: 'cover',
                WebkitMaskSize: 'cover',
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat'
              }}
            />

            {/* Specular highlights & reflections layer for metallic/satin paint depth */}
            <div
              className="studio-vehicle-specular-accent"
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: currentColor,
                mixBlendMode: 'soft-light',
                opacity: selectedPresetId === 'fuji-white' ? 0.65 : 0.45,
                pointerEvents: 'none',
                transition: 'background-color 400ms cubic-bezier(0.16, 1, 0.3, 1), opacity 400ms ease',
                maskImage: 'url(/images/defender-body-mask.png)',
                WebkitMaskImage: 'url(/images/defender-body-mask.png)',
                maskSize: 'cover',
                WebkitMaskSize: 'cover',
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat'
              }}
            />
          </div>
        </div>

        {/* Studio Top Control & HUD Badges */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            zIndex: 15,
            pointerEvents: 'none'
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(20, 20, 20, 0.88)',
              border: '1px solid var(--color-graphite-border)',
              padding: '8px 14px',
              fontSize: '11px',
              color: 'var(--color-pearl-white)',
              letterSpacing: '0.0230em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span
              style={{
                width: '10px',
                height: '10px',
                backgroundColor: currentColor,
                border: '1px solid rgba(255, 255, 255, 0.4)',
                transition: 'background-color 400ms ease'
              }}
            />
            <span>{currentSwatchInfo.name}</span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-steel-mid)', letterSpacing: '0.04em' }}>
            {currentSwatchInfo.badge}
          </div>
        </div>

        {/* 2D Studio Photography Badge */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 15,
            pointerEvents: 'none'
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              border: '1px solid var(--color-graphite-border)',
              padding: '6px 12px',
              fontSize: '10px',
              color: 'var(--color-steel-mid)',
              letterSpacing: '0.03em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={11} color="var(--color-giallo-vivo)" />
            <span>SOLIHULL STUDIO SPECIFICATION · 2D BESPOKE COLOR CONFIGURATOR</span>
          </div>
        </div>
      </div>

      {/* Bottom Color Swatch Rail & Custom Hex Selector */}
      <div
        className="studio-configurator-toolbar"
        style={{
          padding: '16px 24px',
          backgroundColor: 'var(--color-carbon-deep)',
          borderTop: '1px solid var(--color-graphite-border)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          zIndex: 10
        }}
      >
        {/* Left: Swatch Rail Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Palette size={15} color="var(--color-giallo-vivo)" />
          <span style={{ fontSize: '11px', color: 'var(--color-steel-mid)', letterSpacing: '0.04em' }}>
            SVO BESPOKE PAINTWORK:
          </span>
        </div>

        {/* Center: Swatch Color Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {DEFENDER_PALETTE.map((swatch) => {
            const isSelected = selectedPresetId === swatch.id;
            return (
              <button
                key={swatch.id}
                onClick={() => handleSelectPreset(swatch)}
                className="btn-outlined spec-chip-tactile"
                aria-label={`Select ${swatch.name}`}
                style={{
                  padding: '6px 12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                  borderColor: isSelected ? 'var(--color-pearl-white)' : 'var(--color-graphite-border)',
                  color: isSelected ? 'var(--color-pearl-white)' : 'var(--color-steel-mid)',
                  cursor: 'pointer'
                }}
              >
                <span
                  style={{
                    width: '14px',
                    height: '14px',
                    backgroundColor: swatch.hex,
                    display: 'inline-block',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: isSelected ? `0 0 10px ${swatch.hex}` : 'none'
                  }}
                />
                <span style={{ fontSize: '11px' }}>{swatch.name}</span>
                {isSelected && <Check size={11} color="var(--color-giallo-vivo)" />}
              </button>
            );
          })}
        </div>

        {/* Right: Custom Hex Color Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => colorInputRef.current?.click()}
            className="btn-outlined spec-chip-tactile"
            style={{
              padding: '6px 12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              borderColor: selectedPresetId === 'custom' ? 'var(--color-pearl-white)' : 'var(--color-graphite-border)',
              backgroundColor: selectedPresetId === 'custom' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              color: 'var(--color-pearl-white)',
              cursor: 'pointer'
            }}
          >
            <Sliders size={12} color="var(--color-giallo-vivo)" />
            <span style={{ fontSize: '11px' }}>CUSTOM HEX: {currentColor.toUpperCase()}</span>
          </button>

          <input
            ref={colorInputRef}
            type="color"
            value={currentColor}
            onChange={handleCustomHexChange}
            style={{
              width: '28px',
              height: '28px',
              padding: 0,
              border: '1px solid var(--color-graphite-border)',
              backgroundColor: 'transparent',
              cursor: 'pointer'
            }}
            title="Choose custom hex color"
            aria-label="Choose custom paint color"
          />
        </div>
      </div>
    </div>
  );
}
