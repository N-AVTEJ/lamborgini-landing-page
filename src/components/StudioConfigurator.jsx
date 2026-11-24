import React, { useState, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { Palette, Check, RefreshCw, Sliders, Maximize2 } from 'lucide-react';
import { useReducedMotion } from '../utils/useReducedMotion';

const DEFENDER_PALETTE = [
  { id: 'giallo-vivo', name: 'GIALLO VIVO', hex: '#ffc000', badge: 'HERO OCTA LAUNCH SPEC' },
  { id: 'pangea-green', name: 'PANGEA GREEN', hex: '#4b5b48', badge: 'SOLIHULL HERITAGE SPEC' },
  { id: 'tasman-blue', name: 'TASMAN BLUE', hex: '#2e434f', badge: 'EXPEDITION OCEANIC METALLIC' },
  { id: 'carpathian-grey', name: 'CARPATHIAN GREY', hex: '#35393c', badge: 'PREMIUM SATIN GRAPHITE' },
  { id: 'fuji-white', name: 'FUJI WHITE', hex: '#f0f2f3', badge: 'HIGH-CONTRAST ARCTIC SPEC' }
];

// 3D Model Renderer with real-time body paint lerp (~400ms transition)
function Defender3DModel({ targetColorHex }) {
  const { scene } = useGLTF('/models/defender.glb');
  const targetColor = useMemo(() => new THREE.Color(targetColorHex), [targetColorHex]);

  // Clone scene so different instances don't cross-contaminate materials
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material = child.material.map((m) => m.clone());
        } else {
          child.material = child.material.clone();
        }
      }
    });
    return clone;
  }, [scene]);

  // Find all body painted meshes
  const bodyMaterials = useMemo(() => {
    const mats = [];
    clonedScene.traverse((child) => {
      if (child.isMesh && child.material) {
        const list = Array.isArray(child.material) ? child.material : [child.material];
        for (const mat of list) {
          if (mat.name === 'Defender_Body') {
            mats.push(mat);
          }
        }
      }
    });
    return mats;
  }, [clonedScene]);

  // Lerp material color smoothly toward targetColor with ~400ms half-life
  useFrame((_, delta) => {
    // 7.5 rate achieves ~95% transition in 400ms
    const step = Math.min(1, delta * 7.5);
    for (const mat of bodyMaterials) {
      mat.color.lerp(targetColor, step);
    }
  });

  return (
    <primitive
      object={clonedScene}
      position={[0, 0, 0]}
      rotation={[0, -Math.PI / 4, 0]}
    />
  );
}

// Studio Ground Floor with Neutral Soft Contact Shadow
function StudioStageFloor() {
  return (
    <group position={[0, -0.01, 0]}>
      {/* Dark Studio Floor Disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[7, 64]} />
        <meshStandardMaterial
          color="#121212"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Soft Contact Shadow beneath vehicle wheels */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <planeGeometry args={[5.2, 3.2]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.65}
        />
      </mesh>
    </group>
  );
}

// Check if running in browser with functional WebGL support
function canUseWebGL() {
  if (typeof window === 'undefined') return false;
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')));
  } catch {
    return false;
  }
}

export default function StudioConfigurator({
  initialColor = '#ffc000',
  currentColor: propCurrentColor,
  onColorChange,
  selectedPresetId: propSelectedPresetId,
  onSelectPreset,
  forceReducedMotion
}) {
  const [internalColor, setInternalColor] = useState(initialColor);
  const [internalPresetId, setInternalPresetId] = useState('giallo-vivo');
  const [autoRotate, setAutoRotate] = useState(true);
  const colorInputRef = useRef(null);

  const currentColor = propCurrentColor !== undefined ? propCurrentColor : internalColor;
  const selectedPresetId = propSelectedPresetId !== undefined ? propSelectedPresetId : internalPresetId;

  const systemReducedMotion = useReducedMotion();
  const prefersReducedMotion = forceReducedMotion !== undefined ? forceReducedMotion : systemReducedMotion;
  const hasWebGL = useMemo(() => canUseWebGL(), []);

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

  const handleResetCamera = () => {
    setAutoRotate(true);
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
      {/* 3D Canvas / Video Viewport */}
      <div style={{ position: 'relative', width: '100%', flex: 1, minHeight: '380px', touchAction: 'none' }}>
        {/* studio-turntable: STUDIO tab background/base layer */}
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
              className="studio-turntable-video"
              autoPlay
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

          {/* Color-swatch configurator sits as an overlay on top (tint/filter overlay, the base video itself never changes color) */}
          <div
            className="studio-swatch-tint-overlay"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: currentColor,
              mixBlendMode: 'color',
              opacity: 0.38,
              pointerEvents: 'none',
              transition: 'background-color 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />
        </div>

        {/* Real 3D Material Swap path if WebGL is supported */}
        {hasWebGL && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
            <Canvas
              shadows
              gl={{ alpha: true }}
              camera={{ position: [3.8, 1.6, 3.8], fov: 42 }}
              style={{ width: '100%', height: '100%', background: 'transparent' }}
              onPointerDown={() => setAutoRotate(false)}
            >
              {/* Neutral Studio HDRI / Photo Studio Lighting Rig */}
              <ambientLight intensity={0.7} color="#ffffff" />
              <directionalLight position={[0, 7, 0]} intensity={1.4} color="#ffffff" />
              <directionalLight position={[4, 3.5, 3]} intensity={1.6} color="#ffffff" />
              <directionalLight position={[-4, 2.5, -2]} intensity={0.9} color="#e5effa" />
              <directionalLight position={[-2, 3, 4]} intensity={1.1} color="#ffffff" />

              <Suspense fallback={null}>
                <Defender3DModel targetColorHex={currentColor} />
                <StudioStageFloor />
              </Suspense>

              {/* OrbitControls: Drag rotate, Scroll zoom, Clamped vertical angle */}
              <OrbitControls
                enablePan={false}
                minDistance={2.8}
                maxDistance={7.5}
                minPolarAngle={Math.PI / 6}
                maxPolarAngle={Math.PI / 2.05}
                autoRotate={autoRotate}
                autoRotateSpeed={0.8}
              />
            </Canvas>
          </div>
        )}

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
                border: '1px solid rgba(255, 255, 255, 0.4)'
              }}
            />
            <span>{currentSwatchInfo.name}</span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-steel-mid)', letterSpacing: '0.04em' }}>
            {currentSwatchInfo.badge}
          </div>
        </div>

        {/* Orbit Hint & Reset Control */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 15
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              border: '1px solid var(--color-graphite-border)',
              padding: '6px 10px',
              fontSize: '10px',
              color: 'var(--color-steel-mid)',
              letterSpacing: '0.03em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Maximize2 size={11} />
            <span>DRAG TO ORBIT · PINCH/SCROLL TO ZOOM</span>
          </div>

          <button
            onClick={handleResetCamera}
            className="btn-outlined spec-chip-tactile"
            title="Reset Auto-Orbit"
            style={{
              padding: '6px 10px',
              fontSize: '10px',
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              borderColor: 'var(--color-graphite-border)',
              color: 'var(--color-pearl-white)',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={11} color="var(--color-giallo-vivo)" />
            <span>AUTO ORBIT</span>
          </button>
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
