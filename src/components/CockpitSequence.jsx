import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, CheckCircle, ShieldCheck, Compass, Zap } from 'lucide-react';
import { gsap } from 'gsap';

export default function CockpitSequence() {
  const isTest = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
  const prefersReducedMotion = typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
  const alreadyPlayed = typeof window !== 'undefined' && Boolean(window.sessionStorage?.getItem('defender_cockpit_sequence_played'));
  const startStatic = isTest || prefersReducedMotion || alreadyPlayed;

  // States: 'door-open' -> 'camera-push' -> 'cluster-boot' -> 'screen-boot' -> 'ambient-strip' -> 'idle'
  const [phase, setPhase] = useState(startStatic ? 'idle' : 'door-open');
  const [doorAngle, setDoorAngle] = useState(startStatic ? 68 : 0);
  const [cameraZoom, setCameraZoom] = useState(startStatic ? 1.4 : 1);
  const [showInterior, setShowInterior] = useState(startStatic);
  const [clusterLit, setClusterLit] = useState(startStatic);
  const [screenBooting, setScreenBooting] = useState(false);
  const [screenOnline, setScreenOnline] = useState(startStatic);
  const [ambientLit, setAmbientLit] = useState(startStatic);

  const timelineRef = useRef(null);
  const timersRef = useRef([]);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
    if (timelineRef.current) {
      timelineRef.current.kill();
      timelineRef.current = null;
    }
  }, []);

  const startTimeline = useCallback(() => {
    clearAllTimers();

    // GSAP Scripted Sequence Timeline
    const tl = gsap.timeline({
      onComplete: () => {
        setPhase('idle');
        setAmbientLit(true);
        if (typeof window !== 'undefined') {
          window.sessionStorage?.setItem('defender_cockpit_sequence_played', 'true');
        }
      }
    });
    timelineRef.current = tl;

    // Step 1: Driver door rotates open (3D transform, hinge-point perspective origin, 750ms eased)
    tl.to({}, {
      duration: 0.75,
      ease: 'power2.out',
      onStart: () => setPhase('door-open'),
      onUpdate: function () {
        const progress = this.progress();
        setDoorAngle(Math.round(progress * 68));
      }
    }, 0.05);

    // Step 2: Camera pushes in to interior POV
    tl.to({}, {
      duration: 0.7,
      ease: 'power2.inOut',
      onStart: () => setPhase('camera-push'),
      onUpdate: function () {
        const progress = this.progress();
        setCameraZoom(1 + progress * 0.4);
      }
    }, 0.65);

    // Step 3: Crossfade into interior cockpit view
    tl.add(() => {
      setShowInterior(true);
      setPhase('cluster-boot');
    }, 1.25);

    // Step 4: Instrument cluster backlight fades up
    tl.add(() => {
      setClusterLit(true);
      setPhase('screen-boot');
      setScreenBooting(true);
    }, 1.65);

    // Step 5: Center Pivi Pro screen boots with logo flash
    tl.add(() => {
      setScreenBooting(false);
      setScreenOnline(true);
      setPhase('ambient-strip');
    }, 2.3);

    // Step 6: Ambient interior LED light strip fades in last
    tl.add(() => {
      setAmbientLit(true);
    }, 2.9);
  }, [clearAllTimers]);

  useEffect(() => {
    if (!startStatic) {
      startTimeline();
    }
    return () => clearAllTimers();
  }, [startStatic, startTimeline, clearAllTimers]);

  const handleReplay = () => {
    clearAllTimers();
    setPhase('door-open');
    setShowInterior(false);
    setDoorAngle(0);
    setCameraZoom(1);
    setClusterLit(false);
    setScreenBooting(false);
    setScreenOnline(false);
    setAmbientLit(false);
    startTimeline();
  };

  return (
    <div
      className="cockpit-sequence-container"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#000000',
        perspective: '1200px'
      }}
    >
      {/* Exterior Stage with 3D Hinge-point Door Opening & Push-in POV */}
      <div
        className="cockpit-exterior-stage"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/images/defender-octa-yellow-spotlight.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: `scale(${cameraZoom}) translate3d(${cameraZoom > 1 ? '-8%' : '0px'}, ${cameraZoom > 1 ? '-3%' : '0px'}, 0)`,
          transformOrigin: '35% 55%',
          transition: prefersReducedMotion ? 'none' : 'transform 0.4s ease-out',
          filter: 'contrast(1.1) brightness(0.95)',
          opacity: showInterior ? 0 : 1,
          pointerEvents: showInterior ? 'none' : 'auto',
          zIndex: showInterior ? 1 : 2
        }}
      >
        {/* 3D Driver Door Layer with Hinge Point Perspective Origin */}
        <div
          className="cockpit-driver-door-hinge"
          style={{
            position: 'absolute',
            top: '32%',
            left: '26%',
            width: '28%',
            height: '42%',
            transformOrigin: 'left center',
            transform: `rotateY(-${doorAngle}deg) translateZ(${doorAngle * 0.8}px)`,
            transition: prefersReducedMotion ? 'none' : 'box-shadow 0.3s ease',
            background: 'linear-gradient(135deg, rgba(255, 192, 0, 0.92) 0%, rgba(200, 150, 0, 0.65) 100%)',
            borderLeft: '4px solid var(--color-carbony-black)',
            borderTop: '1px solid rgba(255, 255, 255, 0.45)',
            borderBottom: '3px solid var(--color-graphite-border)',
            boxShadow: doorAngle > 0 ? '24px 12px 48px rgba(0, 0, 0, 0.95)' : 'none',
            zIndex: 8,
            pointerEvents: 'none',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Outer swage crease line */}
          <div
            style={{
              position: 'absolute',
              top: '46%',
              left: '4%',
              right: '4%',
              height: '1px',
              backgroundColor: 'rgba(255, 255, 255, 0.35)'
            }}
          />

          {/* Door Window Pane with Authentic Safari Glass Tint */}
          <div
            style={{
              position: 'absolute',
              top: '5%',
              left: '5%',
              right: '7%',
              height: '38%',
              backgroundColor: 'rgba(17, 22, 29, 0.88)',
              border: '1px solid var(--color-graphite-border)'
            }}
          />

          {/* Flush Satin Black Door Handle */}
          <div
            style={{
              position: 'absolute',
              top: '52%',
              right: '10%',
              width: '20%',
              height: '6%',
              backgroundColor: 'var(--color-carbony-black)',
              border: '1px solid var(--color-graphite-border)',
              boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.7)'
            }}
          />

          {/* Lower Protective Matte Cladding */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '18%',
              backgroundColor: 'rgba(24, 24, 24, 0.95)',
              borderTop: '1px solid var(--color-graphite-border)'
            }}
          />
        </div>

        {/* Door Frame Aperture Interior Inset Glow */}
        {doorAngle > 10 && (
          <div
            style={{
              position: 'absolute',
              top: '32%',
              left: '26%',
              width: '26%',
              height: '42%',
              backgroundColor: 'rgba(10, 10, 10, 0.95)',
              border: '1px solid var(--color-graphite-border)',
              zIndex: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div
              style={{
                fontSize: '10px',
                color: 'var(--color-giallo-vivo)',
                letterSpacing: '0.04em',
                opacity: Math.min(1, doorAngle / 50)
              }}
            >
              ENTERING COCKPIT...
            </div>
          </div>
        )}
      </div>

      {/* Interior Cockpit POV with Sequential Lighting Power-Up */}
      <div
        className="cockpit-interior-view"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/images/defender-interior-cockpit.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'contrast(1.12) brightness(1.02)',
          opacity: showInterior ? 1 : 0,
          transform: showInterior ? 'scale(1)' : 'scale(1.06)',
          transition: prefersReducedMotion ? 'none' : 'opacity 0.55s ease, transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: showInterior ? 'auto' : 'none',
          zIndex: showInterior ? 3 : 1
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
