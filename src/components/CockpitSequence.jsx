import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, CheckCircle, ShieldCheck, Compass, Zap } from 'lucide-react';

function safePlay(video, name = 'video') {
  if (!video || typeof video.play !== 'function') {
    console.warn(`[safePlay] ${name} is not a valid video element:`, video);
    return;
  }
  // Enforce DOM properties required by browser autoplay policies
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;

  try {
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch((err) => {
        console.error(`[safePlay] ${name}.play() promise rejected:`, err.name, err.message);
        // If rejected by autoplay policy, ensure muted property and retry
        if (err.name === 'NotAllowedError') {
          video.muted = true;
          video.defaultMuted = true;
          video.play().catch((retryErr) => {
            console.error(`[safePlay] ${name}.play() retry failed:`, retryErr);
          });
        }
      });
    }
  } catch (err) {
    console.error(`[safePlay] ${name}.play() threw synchronously:`, err);
  }
}

export default function CockpitSequence({
  isActive = true,
  doorPreload = 'metadata',
  forceReducedMotion,
  startStatic: propStartStatic,
  replayTrigger = 0
}) {
  const isTest = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
  const prefersReducedMotion = forceReducedMotion !== undefined ? forceReducedMotion : false;
  const startStatic = propStartStatic !== undefined ? propStartStatic : (isTest || prefersReducedMotion);

  // States: 'door-open' -> 'cluster-boot' -> 'screen-boot' -> 'ambient-strip' -> 'idle'
  const [phase, setPhase] = useState(startStatic ? 'idle' : 'door-open');
  const [showInterior, setShowInterior] = useState(startStatic);
  const [clusterLit, setClusterLit] = useState(startStatic);
  const [screenBooting, setScreenBooting] = useState(false);
  const [screenOnline, setScreenOnline] = useState(startStatic);
  const [ambientLit, setAmbientLit] = useState(startStatic);

  const doorVideoRef = useRef(null);
  const interiorVideoRef = useRef(null);
  const timersRef = useRef([]);
  const prevActiveRef = useRef(isActive);
  const prevReplayTriggerRef = useRef(replayTrigger);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
  }, []);

  const triggerPowerUpSequence = useCallback(() => {
    clearAllTimers();
    // Step 1: Instrument cluster backlight illuminates
    setPhase('cluster-boot');
    setClusterLit(true);
    setScreenBooting(true);

    const t1 = setTimeout(() => {
      // Step 2: Center Pivi Pro screen boots with logo flash -> online
      setScreenBooting(false);
      setScreenOnline(true);
      setPhase('ambient-strip');
    }, 600);

    const t2 = setTimeout(() => {
      // Step 3: Ambient interior LED light strip fades in last
      setAmbientLit(true);
      setPhase('idle');
    }, 1200);

    timersRef.current.push(t1, t2);
  }, [clearAllTimers]);

  // Handle cockpit-door video ended: immediately play interior video & trigger power-up
  const handleDoorEnded = useCallback(() => {
    setShowInterior(true);
    if (interiorVideoRef.current) {
      try {
        interiorVideoRef.current.currentTime = 0;
      } catch {
        // ignore seek errors on unseekable media
      }
      safePlay(interiorVideoRef.current);
    }
    triggerPowerUpSequence();
  }, [triggerPowerUpSequence]);

  // Handle cockpit-interior video ended: hold/freeze last frame into live UI state
  const handleInteriorEnded = useCallback(() => {
    if (interiorVideoRef.current) {
      try {
        interiorVideoRef.current.pause();
      } catch {
        // ignore pause errors
      }
    }
  }, []);

  const resetAndPlay = useCallback(() => {
    clearAllTimers();
    setPhase('door-open');
    setShowInterior(false);
    setClusterLit(false);
    setScreenBooting(false);
    setScreenOnline(false);
    setAmbientLit(false);

    if (doorVideoRef.current) {
      doorVideoRef.current.muted = true;
      doorVideoRef.current.defaultMuted = true;
      doorVideoRef.current.playsInline = true;
      if (doorVideoRef.current.currentTime > 0) {
        try {
          doorVideoRef.current.currentTime = 0;
        } catch (e) {
          console.warn('[CockpitSequence] Failed to reset currentTime:', e);
        }
      }
      safePlay(doorVideoRef.current, 'cockpit-door');
    }
    if (interiorVideoRef.current) {
      interiorVideoRef.current.muted = true;
      interiorVideoRef.current.defaultMuted = true;
      interiorVideoRef.current.playsInline = true;
      if (interiorVideoRef.current.currentTime > 0) {
        try {
          interiorVideoRef.current.currentTime = 0;
        } catch {
          // ignore seek errors
        }
      }
      try {
        interiorVideoRef.current.pause();
      } catch {
        // ignore pause errors
      }
    }
  }, [clearAllTimers]);

  // For reduced motion: if active, in door-open phase and showInterior is false,
  // advance to interior view and power-up after a brief non-motion delay
  useEffect(() => {
    if (isActive && prefersReducedMotion && phase === 'door-open' && !showInterior) {
      const timer = setTimeout(() => {
        handleDoorEnded();
      }, 400);
      timersRef.current.push(timer);
      return () => clearTimeout(timer);
    }
  }, [isActive, prefersReducedMotion, phase, showInterior, handleDoorEnded]);

  // When tab becomes inactive: pause videos and clear pending power-up timers to save CPU & battery
  useEffect(() => {
    if (!isActive) {
      clearAllTimers();
      if (doorVideoRef.current && typeof doorVideoRef.current.pause === 'function') {
        try {
          doorVideoRef.current.pause();
        } catch {
          // ignore pause errors
        }
      }
      if (interiorVideoRef.current && typeof interiorVideoRef.current.pause === 'function') {
        try {
          interiorVideoRef.current.pause();
        } catch {
          // ignore pause errors
        }
      }
    }
  }, [isActive, clearAllTimers]);

  // When tab becomes active or is clicked from another tab: reset and play cockpit-door
  useEffect(() => {
    const justBecameActive = isActive && !prevActiveRef.current;
    prevActiveRef.current = isActive;

    if (justBecameActive && !startStatic) {
      resetAndPlay();
    } else if (isActive && !startStatic && phase === 'door-open') {
      if (doorVideoRef.current) {
        safePlay(doorVideoRef.current);
      }
    }
  }, [isActive, startStatic, phase, resetAndPlay]);

  // Handle replay trigger from parent (e.g. clicking COCKPIT tab while already active)
  useEffect(() => {
    if (replayTrigger > prevReplayTriggerRef.current) {
      prevReplayTriggerRef.current = replayTrigger;
      resetAndPlay();
    }
  }, [replayTrigger, resetAndPlay]);

  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  const handleReplay = () => {
    resetAndPlay();
  };

  return (
    <div
      className="cockpit-sequence-container"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#000000'
      }}
    >
      {/* Background Media Layers: Videos or Reduced Motion Static Posters */}
      {prefersReducedMotion ? (
        showInterior ? (
          <img
            src="/videos/cockpit-interior-poster.jpg"
            alt="Defender Cockpit Interior"
            className="cockpit-interior-poster"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 1
            }}
          />
        ) : (
          <img
            src="/videos/cockpit-door-poster.jpg"
            alt="Defender Cockpit Door"
            className="cockpit-door-poster"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 1
            }}
          />
        )
      ) : (
        <>
          {/* 1. cockpit-door: plays once on COCKPIT tab click */}
          <video
            ref={(el) => {
              doorVideoRef.current = el;
              if (el) {
                el.muted = true;
                el.defaultMuted = true;
                el.playsInline = true;
              }
            }}
            className="cockpit-door-video"
            autoPlay={isActive}
            muted
            playsInline
            loop={false}
            preload={doorPreload}
            poster="/videos/cockpit-door-poster.jpg"
            onEnded={handleDoorEnded}
            onError={(e) => {
              console.error('[CockpitSequence] cockpit-door video error:', e);
              handleDoorEnded();
            }}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: showInterior ? 0 : 1,
              pointerEvents: showInterior ? 'none' : 'auto',
              zIndex: showInterior ? 1 : 3,
              transition: 'opacity 0.45s ease'
            }}
          >
            <source src="/videos/cockpit-door.webm" type="video/webm" />
            <source src="/videos/cockpit-door.mp4" type="video/mp4" />
          </video>

          {/* 2. cockpit-interior: plays immediately after cockpit-door ends and freezes last frame */}
          <video
            ref={(el) => {
              interiorVideoRef.current = el;
              if (el) {
                el.muted = true;
                el.defaultMuted = true;
                el.playsInline = true;
              }
            }}
            className="cockpit-interior-video"
            muted
            playsInline
            loop={false}
            preload="auto"
            poster="/videos/cockpit-interior-poster.jpg"
            onEnded={handleInteriorEnded}
            onError={(e) => {
              console.error('[CockpitSequence] cockpit-interior video error:', e);
              handleInteriorEnded();
            }}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: showInterior ? 1 : 0,
              pointerEvents: showInterior ? 'auto' : 'none',
              zIndex: 2,
              transition: 'opacity 0.45s ease'
            }}
          >
            <source src="/videos/cockpit-interior.webm" type="video/webm" />
            <source src="/videos/cockpit-interior.mp4" type="video/mp4" />
          </video>
        </>
      )}

      {/* Interior Cockpit POV Overlays (HUD, Center Screen, Ambient Strip) */}
      <div
        className="cockpit-interior-view"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: showInterior ? 1 : 0,
          pointerEvents: showInterior ? 'auto' : 'none',
          zIndex: 4,
          transition: prefersReducedMotion ? 'none' : 'opacity 0.45s ease'
        }}
      >
        {/* Subtle Ambient Vignette */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 50% 60%, transparent 40%, rgba(0, 0, 0, 0.65) 100%)',
            pointerEvents: 'none'
          }}
        />

        {/* 1. Instrument Cluster Backlight & Digital HUD Graphic */}
        <div
          className="cockpit-cluster-hud"
          style={{
            position: 'absolute',
            top: '36%',
            left: '18%',
            width: '22%',
            height: '24%',
            backgroundColor: clusterLit ? 'rgba(8, 16, 24, 0.88)' : 'rgba(0, 0, 0, 0.92)',
            border: clusterLit ? '1px solid var(--color-pearl-white)' : '1px solid var(--color-graphite-border)',
            boxShadow: clusterLit ? '0 0 24px rgba(255, 255, 255, 0.22)' : 'none',
            opacity: clusterLit ? 1 : 0.2,
            transition: 'opacity 0.6s ease, border-color 0.6s ease, box-shadow 0.6s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '10px 14px',
            zIndex: 10,
            pointerEvents: 'none'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '9px', color: 'var(--color-steel-mid)', letterSpacing: '0.04em' }}>
              DEFENDER V8 CLUSTER
            </span>
            <span style={{ fontSize: '9px', color: 'var(--color-giallo-vivo)' }}>
              {clusterLit ? 'READY · SPORT' : 'STANDBY'}
            </span>
          </div>

          {/* Dials Graphic */}
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', margin: '4px 0' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', color: 'var(--color-pearl-white)', lineHeight: 1 }}>
                {clusterLit ? '0' : '--'}
              </div>
              <div style={{ fontSize: '8px', color: 'var(--color-steel-mid)' }}>KM/H</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Compass size={18} color={clusterLit ? 'var(--color-giallo-vivo)' : 'var(--color-steel-mid)'} />
              <div style={{ fontSize: '8px', color: 'var(--color-steel-mid)' }}>NW 315°</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', color: 'var(--color-pearl-white)', lineHeight: 1 }}>
                {clusterLit ? '850' : '--'}
              </div>
              <div style={{ fontSize: '8px', color: 'var(--color-steel-mid)' }}>RPM</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: 'var(--color-steel-mid)' }}>
            <span>AIR SUSPENSION: +75MM</span>
            <span style={{ color: 'var(--color-giallo-vivo)' }}>6D ACTIVE</span>
          </div>
        </div>

        {/* 2. Pivi Pro Center Screen (Boot Flash -> Navigation & Off-Road Telemetry) */}
        <div
          className="cockpit-center-screen"
          style={{
            position: 'absolute',
            top: '40%',
            left: '46%',
            width: '26%',
            height: '32%',
            backgroundColor: '#0a0d11',
            border: '1px solid var(--color-graphite-border)',
            zIndex: 10,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Screen Boot Flash Banner */}
          {screenBooting && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: '#000000',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 12,
                animation: 'monolithicReveal 0.4s ease forwards'
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  backgroundColor: 'var(--color-giallo-vivo)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '8px'
                }}
              >
                <ShieldCheck size={24} color="#000000" />
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-pearl-white)', letterSpacing: '0.04em' }}>
                LAND ROVER DEFENDER
              </div>
              <div style={{ fontSize: '8px', color: 'var(--color-steel-mid)', marginTop: '2px' }}>
                PIVI PRO BOOTING...
              </div>
            </div>
          )}

          {/* Active Pivi Pro Interface */}
          {screenOnline && (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '12px 14px',
                backgroundColor: 'rgba(10, 14, 20, 0.95)',
                boxShadow: 'inset 0 0 16px rgba(0, 0, 0, 0.8)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-giallo-vivo)' }} />
                  <span style={{ fontSize: '9px', color: 'var(--color-pearl-white)', letterSpacing: '0.03em' }}>
                    DEFENDER 4X4i TERRAIN RESPONSE
                  </span>
                </div>
                <span style={{ fontSize: '9px', color: 'var(--color-steel-mid)' }}>12:48 PM</span>
              </div>

              {/* 3D Topographical Gradient / Off-Road Grid Graphic */}
              <div
                style={{
                  flex: 1,
                  margin: '8px 0',
                  backgroundColor: 'rgba(20, 26, 34, 0.8)',
                  border: '1px solid var(--color-graphite-border)',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: 'var(--color-steel-mid)' }}>
                  <span>WADE SENSING DEPTH</span>
                  <span style={{ color: 'var(--color-giallo-vivo)' }}>0.12M / 1.0M MAX</span>
                </div>
                <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--color-carbony-black)' }}>
                  <div style={{ width: '12%', height: '100%', backgroundColor: 'var(--color-giallo-vivo)' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: 'var(--color-steel-mid)', marginTop: '4px' }}>
                  <span>LOCKING DIFFERENTIALS</span>
                  <span style={{ color: 'var(--color-pearl-white)' }}>CENTER: LOCKED · REAR: AUTO</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '8px', color: 'var(--color-steel-mid)' }}>
                  <CheckCircle size={10} color="var(--color-giallo-vivo)" />
                  <span>SYSTEMS NOMINAL · ALL VALVES ARMED</span>
                </div>
                <div style={{ fontSize: '8px', color: 'var(--color-pearl-white)' }}>
                  635 PS OCTA TUNE
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Ambient Interior Light Strip under Structural Magnesium Cross Beam */}
        <div
          className="cockpit-ambient-strip"
          style={{
            position: 'absolute',
            top: '56%',
            left: '12%',
            right: '12%',
            height: '3px',
            backgroundColor: 'var(--color-giallo-vivo)',
            opacity: ambientLit ? 0.88 : 0,
            boxShadow: ambientLit ? '0 0 20px 4px rgba(255, 192, 0, 0.45)' : 'none',
            transition: 'opacity 0.8s ease, box-shadow 0.8s ease',
            animation: (ambientLit && !prefersReducedMotion) ? 'cockpitAmbientBreathing 3.6s infinite ease-in-out' : 'none',
            zIndex: 9,
            pointerEvents: 'none'
          }}
        />

        {/* Footwell / Door Accent Ambience */}
        <div
          style={{
            position: 'absolute',
            bottom: '12%',
            left: '20%',
            right: '20%',
            height: '2px',
            backgroundColor: 'var(--color-giallo-vivo)',
            opacity: ambientLit ? 0.35 : 0,
            boxShadow: ambientLit ? '0 0 16px 2px rgba(255, 192, 0, 0.25)' : 'none',
            transition: 'opacity 0.8s ease, box-shadow 0.8s ease',
            zIndex: 9,
            pointerEvents: 'none'
          }}
        />
      </div>

      {/* Floating Tactical Overlay: Replay Control & Spec Badges */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 20
        }}
      >
        <button
          onClick={handleReplay}
          className="btn-outlined spec-chip-tactile"
          title="Replay scripted cockpit power-up sequence"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            border: '1px solid var(--color-graphite-border)',
            color: 'var(--color-pearl-white)',
            fontSize: '11px',
            padding: '8px 14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
        >
          <RotateCcw size={12} color="var(--color-giallo-vivo)" />
          <span>REPLAY SEQUENCE</span>
        </button>

        <div
          style={{
            backgroundColor: 'rgba(24, 24, 24, 0.85)',
            border: '1px solid var(--color-graphite-border)',
            padding: '8px 14px',
            fontSize: '11px',
            color: 'var(--color-pearl-white)',
            letterSpacing: '0.0230em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Zap size={11} color="var(--color-giallo-vivo)" />
          <span>{phase === 'idle' ? 'COCKPIT SYSTEM ONLINE' : `INITIALIZING · ${phase.toUpperCase()}`}</span>
        </div>
      </div>
    </div>
  );
}
