import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Play, Square, Activity } from 'lucide-react';
import { defenderV8Engine } from '../utils/engineAudio';
import CockpitSequence from './CockpitSequence';
import StudioConfigurator from './StudioConfigurator';

// Smooth Count-Up Telemetry Metric Component
function TelemetryCard({ label, unit, subtext, targetNumber, decimals = 0 }) {
  const isTest = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
  const prefersReducedMotion = typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
  const shouldSkipAnimation = isTest || prefersReducedMotion;
  const [displayNumber, setDisplayNumber] = useState(shouldSkipAnimation ? targetNumber : 0);
  const cardRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(shouldSkipAnimation);

  useEffect(() => {
    if (shouldSkipAnimation || hasAnimated) return;

    let animId;
    const startVal = 0;
    const endVal = targetNumber;
    const duration = 1400; // 1.4s smooth count up
    let startTime = null;

    const runCountUp = (now) => {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (endVal - startVal) * eased;
      setDisplayNumber(current);

      if (progress < 1) {
        animId = requestAnimationFrame(runCountUp);
      } else {
        setDisplayNumber(endVal);
        setHasAnimated(true);
      }
    };

    if (typeof IntersectionObserver !== 'undefined' && cardRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0] && entries[0].isIntersecting) {
            animId = requestAnimationFrame(runCountUp);
            observer.disconnect();
          }
        },
        { threshold: 0.15 }
      );
      observer.observe(cardRef.current);
      return () => {
        observer.disconnect();
        if (animId) cancelAnimationFrame(animId);
      };
    } else {
      animId = requestAnimationFrame(runCountUp);
      return () => {
        if (animId) cancelAnimationFrame(animId);
      };
    }
  }, [targetNumber, isTest, hasAnimated, shouldSkipAnimation]);

  const formattedNum = isTest
    ? (decimals === 1 ? targetNumber.toFixed(1) : targetNumber.toLocaleString())
    : (decimals === 1 ? displayNumber.toFixed(1) : Math.round(displayNumber).toLocaleString());

  const fullDisplay = `${formattedNum} ${unit}`;

  return (
    <div
      ref={cardRef}
      className="telemetry-card"
      style={{
        backgroundColor: 'var(--surface-carbon-deep)',
        padding: 'var(--spacing-32)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div className="telemetry-hairline-accent" />
      <div style={{ fontSize: '11px', color: 'var(--color-steel-mid)', letterSpacing: '0.0230em', marginBottom: '8px' }}>
        {label}
      </div>
      <div
        style={{
          fontSize: '44px',
          color: 'var(--color-pearl-white)',
          lineHeight: 1,
          marginBottom: '8px',
          fontVariantNumeric: 'tabular-nums'
        }}
      >
        {fullDisplay}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--color-steel-mid)' }}>
        {subtext}
      </div>
    </div>
  );
}

export default function ShowroomSpotlightStage() {
  const [spotlightMode, setSpotlightMode] = useState('theater'); // 'theater' | 'ambient' | 'stealth'
  const [currentAngle, setCurrentAngle] = useState('aero'); // 'aero' | 'cockpit' | 'studio'
  const [previousAngle, setPreviousAngle] = useState(null);
  const currentAngleRef = useRef('aero');
  const [engineRunning, setEngineRunning] = useState(false);
  const [currentRPM, setCurrentRPM] = useState(0);
  const [peakRPM, setPeakRPM] = useState(0);
  const [studioColor, setStudioColor] = useState('#ffc000');
  const [studioPresetId, setStudioPresetId] = useState('giallo-vivo');
  const [cockpitDoorPreload, setCockpitDoorPreload] = useState('metadata');
  const [cockpitReplayTrigger, setCockpitReplayTrigger] = useState(0);
  const switchTimerRef = useRef(null);

  // Keep currentAngleRef in sync
  useEffect(() => {
    currentAngleRef.current = currentAngle;
  }, [currentAngle]);

  // Dynamic Spotlight Beam mouse follow & ambient drift
  const [beamPos, setBeamPos] = useState({ x: 50, tilt: 0 });
  const beamPosRef = useRef({ x: 50, tilt: 0 });
  const [isHoveringStage, setIsHoveringStage] = useState(false);
  const stageRef = useRef(null);

  const angleImages = {
    aero: {
      url: '/images/defender-octa-yellow-spotlight.jpg',
      label: 'EXTERIOR 3/4 FRONT STANCE',
      badge: 'OCTA TROPHY YELLOW SHOWROOM SPEC'
    },
    cockpit: {
      url: '/images/defender-interior-cockpit.jpg',
      label: 'TACTICAL LUXURY COCKPIT',
      badge: 'MAGNESIUM BEAM & PIVI PRO'
    },
    studio: {
      url: '/images/defender-90-studio.jpg',
      label: 'SOLIHULL STUDIO STAGE',
      badge: 'CARPATHIAN GREY SATIN FINISH'
    }
  };

  const handleSelectAngle = (newAngle) => {
    if (newAngle === currentAngleRef.current) return;
    const prev = currentAngleRef.current;
    currentAngleRef.current = newAngle;
    if (switchTimerRef.current) {
      clearTimeout(switchTimerRef.current);
    }
    setPreviousAngle(prev);
    setCurrentAngle(newAngle);
    switchTimerRef.current = setTimeout(() => {
      setPreviousAngle(null);
      switchTimerRef.current = null;
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (switchTimerRef.current) clearTimeout(switchTimerRef.current);
    };
  }, []);

  // Ambient gentle beam drift when mouse is not actively hovering
  useEffect(() => {
    if (isHoveringStage) return;
    let animId;
    const startX = beamPosRef.current.x;
    const startTilt = beamPosRef.current.tilt;
    const start = performance.now();
    const driftLoop = (now) => {
      const elapsed = (now - start) / 1000;
      // Smoothly blend from where cursor exited toward the center oscillation
      const blend = Math.min(1, elapsed / 1.2);
      const targetX = 50 + Math.sin(elapsed * 0.7) * 6;
      const targetTilt = Math.sin(elapsed * 0.7) * 2.5;
      const x = startX + (targetX - startX) * blend;
      const tilt = startTilt + (targetTilt - startTilt) * blend;
      const current = { x, tilt };
      beamPosRef.current = current;
      setBeamPos(current);
      animId = requestAnimationFrame(driftLoop);
    };
    animId = requestAnimationFrame(driftLoop);
    return () => cancelAnimationFrame(animId);
  }, [isHoveringStage]);

  const handleStageMouseMove = (e) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = Math.max(15, Math.min(85, ((e.clientX - rect.left) / rect.width) * 100));
    const tilt = ((x - 50) / 35) * 12; // tilt between -12deg and +12deg
    const nextPos = { x, tilt };
    beamPosRef.current = nextPos;
    setBeamPos(nextPos);
    setIsHoveringStage(true);
  };

  const handleStageMouseLeave = () => {
    setIsHoveringStage(false);
  };

  const handleToggleEngine = () => {
    if (engineRunning) {
      defenderV8Engine.stop();
      setEngineRunning(false);
      setCurrentRPM(0);
      setPeakRPM(0);
    } else {
      defenderV8Engine.startIdle((rpm) => {
        setCurrentRPM(rpm);
        setPeakRPM((prev) => Math.max(prev, rpm));
      });
      setEngineRunning(true);
    }
  };

  const handleRevThrottle = () => {
    if (!engineRunning) {
      defenderV8Engine.startIdle((rpm) => {
        setCurrentRPM(rpm);
        setPeakRPM((prev) => Math.max(prev, rpm));
      });
      setEngineRunning(true);
      setTimeout(() => {
        defenderV8Engine.revEngine();
      }, 400);
    } else {
      defenderV8Engine.revEngine();
    }
  };

  useEffect(() => {
    defenderV8Engine.preloadAudioClips();
    return () => {
      defenderV8Engine.stop();
    };
  }, []);

  const isNearRedline = currentRPM >= 6800;

  return (
    <section
      id="showroom-spotlight"
      ref={stageRef}
      onMouseMove={handleStageMouseMove}
      onMouseLeave={handleStageMouseLeave}
      aria-label="Showroom Spotlight Stage"
      className="surface-pure-black showroom-stage-wrap"
      style={{
        width: '100%',
        backgroundColor: 'var(--surface-pure-black)',
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        borderTop: '1px solid var(--color-graphite-border)',
        borderBottom: '1px solid var(--color-graphite-border)'
      }}
    >
      {/* 1. Atmospheric Ambient Stage Haze */}
      <div className="showroom-stage-haze" />

      {/* 2. Softened Downward Overhead Spotlight Beam with Dynamic Follow */}
      <div
        className={`showroom-spotlight-beam ${spotlightMode}`}
        style={{
          left: `${beamPos.x}%`,
          transform: `translateX(-50%) rotate(${beamPos.tilt}deg)`,
          transformOrigin: 'top center',
          transition: isHoveringStage
            ? 'left 0.18s ease-out, transform 0.18s ease-out, opacity 0.5s ease'
            : 'opacity 0.5s ease, background 0.5s ease'
        }}
      />

      {/* 3. Soft Floor Specular Pool beneath Vehicle */}
      <div
        className="showroom-floor-pool"
        style={{
          left: `${45 + beamPos.x * 0.1}%`,
          transform: `translateX(-50%) scale(${spotlightMode === 'theater' ? 1.05 : spotlightMode === 'ambient' ? 1.2 : 0.85})`,
          opacity: spotlightMode === 'stealth' ? 0.2 : 0.85
        }}
      />

      <div className="defender-container lambo-container" style={{ position: 'relative', zIndex: 10 }}>
        {/* Section Heading Block — Dark Stage Variant */}
        <div className="defender-section-header lambo-section-header" style={{ paddingTop: 0 }}>
          <div>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--color-steel-mid)',
                letterSpacing: '0.0230em',
                marginBottom: '8px'
              }}
            >
              SPECIAL VEHICLE OPERATIONS · SOLIHULL
            </div>
            <h2 className="section-title" style={{ color: 'var(--color-pearl-white)' }}>
              SHOWROOM STAGE
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span
              style={{
                fontSize: '12px',
                color: 'var(--color-steel-mid)',
                letterSpacing: '0.0230em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  backgroundColor: 'var(--color-giallo-vivo)'
                }}
              />
              GIALLO VIVO SPOTLIGHT SPEC
            </span>
          </div>
        </div>

        {/* Theatrical Spotlight Showcase Canvas */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            backgroundColor: 'var(--surface-carbon-deep)',
            border: '1px solid var(--color-graphite-border)',
            overflow: 'hidden'
          }}
        >
          {/* Main Visual Display: Shared-Element Staging Canvas with Zero-Blank Crossfade */}
          <div
            className="shared-staging-canvas"
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16/9',
              maxHeight: '680px',
              overflow: 'hidden',
              backgroundColor: '#000000'
            }}
          >
            {/* Perspective Layer 1: AERO Exterior 3/4 Front Stance */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                opacity: currentAngle === 'aero' ? 1 : 0,
                transform: currentAngle === 'aero' ? 'scale(1)' : 'scale(1.025)',
                transition: 'opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
                pointerEvents: currentAngle === 'aero' ? 'auto' : 'none',
                zIndex: currentAngle === 'aero' ? 4 : (previousAngle === 'aero' ? 3 : 1)
              }}
            >
              <img
                src={angleImages.aero.url}
                alt={angleImages.aero.label}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: spotlightMode === 'stealth' ? 'contrast(1.25) brightness(0.8)' : 'contrast(1.08) brightness(1.02)',
                  transition: 'filter 0.4s ease, transform 0.6s ease'
                }}
              />
              {/* Floor reflection gradient overlay */}
              <div className="showroom-floor-reflection" />
            </div>

            {/* Perspective Layer 2: COCKPIT Scripted Sequence */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                opacity: currentAngle === 'cockpit' ? 1 : 0,
                transform: currentAngle === 'cockpit' ? 'scale(1)' : 'scale(0.97)',
                transition: 'opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
                pointerEvents: currentAngle === 'cockpit' ? 'auto' : 'none',
                zIndex: currentAngle === 'cockpit' ? 4 : (previousAngle === 'cockpit' ? 3 : 1)
              }}
            >
              <CockpitSequence
                isActive={currentAngle === 'cockpit'}
                doorPreload={cockpitDoorPreload}
                replayTrigger={cockpitReplayTrigger}
              />
            </div>

            {/* Perspective Layer 3: STUDIO 2D Configurator */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                opacity: currentAngle === 'studio' ? 1 : 0,
                transform: currentAngle === 'studio' ? 'scale(1)' : 'scale(1.02)',
                transition: 'opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
                pointerEvents: currentAngle === 'studio' ? 'auto' : 'none',
                zIndex: currentAngle === 'studio' ? 4 : (previousAngle === 'studio' ? 3 : 1)
              }}
            >
              <StudioConfigurator
                isActive={currentAngle === 'studio'}
                currentColor={studioColor}
                onColorChange={(hex) => {
                  setStudioColor(hex);
                  setStudioPresetId('custom');
                }}
                selectedPresetId={studioPresetId}
                onSelectPreset={(swatch) => {
                  setStudioPresetId(swatch.id);
                  setStudioColor(swatch.hex);
                }}
              />
            </div>

            {/* Stage Mode & Perspective Badges */}
            <div
              style={{
                position: 'absolute',
                top: '24px',
                left: '24px',
                display: currentAngle === 'studio' ? 'none' : 'flex',
                gap: '12px',
                zIndex: 10,
                pointerEvents: 'none'
              }}
            >
              <div
                style={{
                  backgroundColor: 'rgba(24, 24, 24, 0.85)',
                  border: '1px solid var(--color-graphite-border)',
                  padding: '8px 14px',
                  fontSize: '11px',
                  color: 'var(--color-pearl-white)',
                  letterSpacing: '0.0230em'
                }}
              >
                {angleImages[currentAngle].badge}
              </div>
            </div>

            {/* Live RPM Digital HUD Overlay with Peak Hold and Rev-Limit Shift Flash */}
            {engineRunning && (
              <div
                style={{
                  position: 'absolute',
                  top: '24px',
                  right: '24px',
                  backgroundColor: 'rgba(0, 0, 0, 0.90)',
                  border: isNearRedline ? '1px solid var(--color-giallo-vivo)' : '1px solid var(--color-graphite-border)',
                  padding: '14px 22px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  zIndex: 10,
                  minWidth: '220px',
                  transition: 'border-color 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '4px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--color-steel-mid)', letterSpacing: '0.0230em' }}>
                    4.4L TWIN-TURBO V8 TELEMETRY
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--color-giallo-vivo)', letterSpacing: '0.0230em' }}>
                    PEAK: {peakRPM.toLocaleString()} RPM
                  </span>
                </div>

                {/* Rev-Limit Shift Flash Banner */}
                {isNearRedline && (
                  <div className="hud-shift-alert" style={{ marginBottom: '6px' }}>
                    REV LIMIT · SHIFT DEFENDER V8
                  </div>
                )}

                <div
                  style={{
                    fontSize: '34px',
                    color: isNearRedline ? 'var(--color-giallo-vivo)' : 'var(--color-pearl-white)',
                    lineHeight: 1.1,
                    fontVariantNumeric: 'tabular-nums',
                    margin: '2px 0'
                  }}
                >
                  {currentRPM.toLocaleString()} <span style={{ fontSize: '14px', color: 'var(--color-steel-mid)' }}>RPM</span>
                </div>

                {/* 16-Segment Tachometer Visualizer with Peak Hold Needle */}
                <div style={{ display: 'flex', alignItems: 'flex-end', height: '20px', gap: '3px', marginTop: '4px' }}>
                  {(() => {
                    const peakIndex = peakRPM > 0 ? Math.min(15, Math.floor(Math.max(0, peakRPM - 650) / 410)) : -1;
                    return [...Array(16)].map((_, i) => {
                      const threshold = 650 + i * 410;
                      const isActive = currentRPM >= threshold;
                      const isPeak = i === peakIndex;
                      const isRedlineZone = i >= 13;

                      return (
                        <div
                          key={i}
                          style={{
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            height: '100%'
                          }}
                        >
                          {isPeak && <div className="peak-hold-marker" />}
                          <span
                            className={`tach-bar ${isActive ? 'active' : ''}`}
                            style={{
                              backgroundColor: isRedlineZone ? 'var(--color-giallo-vivo)' : 'var(--color-pearl-white)',
                              height: isActive ? `${6 + (i * 0.9)}px` : '4px',
                              opacity: isActive ? 1 : 0.25,
                              marginRight: 0
                            }}
                          />
                        </div>
                      );
                    });
                  })()}
                </div>

                <div style={{ fontSize: '10px', color: 'var(--color-steel-mid)', letterSpacing: '0.0230em', marginTop: '6px' }}>
                  ACTIVE SPORT EXHAUST: QUAD VALVES UNLEASHED
                </div>
              </div>
            )}
          </div>

          {/* Interactive Showroom Control Bar */}
          <div
            style={{
              padding: '24px 32px',
              backgroundColor: 'var(--color-carbony-black)',
              borderTop: '1px solid var(--color-graphite-border)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '24px'
            }}
          >
            {/* Camera / Angle Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-steel-mid)', marginRight: '8px' }}>
                PERSPECTIVE:
              </span>
              {Object.keys(angleImages).map((angleKey) => (
                <button
                  key={angleKey}
                  onClick={() => {
                    if (angleKey === 'cockpit') {
                      setCockpitDoorPreload('auto');
                      if (currentAngle === 'cockpit' || currentAngleRef.current === 'cockpit') {
                        setCockpitReplayTrigger((prev) => prev + 1);
                      }
                    }
                    handleSelectAngle(angleKey);
                  }}
                  onMouseEnter={angleKey === 'cockpit' ? () => setCockpitDoorPreload('auto') : undefined}
                  onFocus={angleKey === 'cockpit' ? () => setCockpitDoorPreload('auto') : undefined}
                  onTouchStart={angleKey === 'cockpit' ? () => setCockpitDoorPreload('auto') : undefined}
                  className="btn-outlined spec-chip-tactile"
                  style={{
                    padding: '8px 14px',
                    fontSize: '11px',
                    borderColor: currentAngle === angleKey ? 'var(--color-pearl-white)' : 'var(--color-graphite-border)',
                    backgroundColor: currentAngle === angleKey ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: currentAngle === angleKey ? 'var(--color-pearl-white)' : 'var(--color-steel-mid)',
                    cursor: 'pointer'
                  }}
                >
                  {angleKey.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Lighting Mode Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-steel-mid)', marginRight: '8px' }}>
                SPOTLIGHT:
              </span>
              {[
                { key: 'theater', label: 'THEATRICAL BEAM' },
                { key: 'ambient', label: 'AMBIENT GLOW' },
                { key: 'stealth', label: 'STEALTH CONTRAST' }
              ].map((mode) => (
                <button
                  key={mode.key}
                  onClick={() => setSpotlightMode(mode.key)}
                  className="btn-outlined spec-chip-tactile"
                  style={{
                    padding: '8px 14px',
                    fontSize: '11px',
                    borderColor: spotlightMode === mode.key ? 'var(--color-pearl-white)' : 'var(--color-graphite-border)',
                    backgroundColor: spotlightMode === mode.key ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: spotlightMode === mode.key ? 'var(--color-pearl-white)' : 'var(--color-steel-mid)',
                    cursor: 'pointer'
                  }}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Engine Audio Synthesizer Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={handleToggleEngine}
                className="btn-outlined spec-chip-tactile"
                style={{
                  padding: '8px 18px',
                  fontSize: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderColor: engineRunning ? 'var(--color-pearl-white)' : 'var(--color-steel-mid)',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                {engineRunning ? <Square size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
                <span>{engineRunning ? 'SHUTDOWN DEFENDER V8 (STOP)' : 'IGNITE DEFENDER V8 (START)'}</span>
              </button>

              {engineRunning && (
                <button
                  onClick={handleRevThrottle}
                  className="btn-outlined spec-chip-tactile"
                  style={{
                    padding: '8px 18px',
                    fontSize: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderColor: 'var(--color-pearl-white)',
                    color: 'var(--color-pearl-white)',
                    cursor: 'pointer'
                  }}
                >
                  <Activity size={14} />
                  <span>REV TO 7,200 RPM</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Monolithic Telemetry Specification Panels with Smooth Count-Up Animations */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1px',
            backgroundColor: 'var(--color-graphite-border)',
            marginTop: 'var(--spacing-40)',
            border: '1px solid var(--color-graphite-border)'
          }}
        >
          <TelemetryCard
            label="COMBINED SYSTEM POWER"
            unit="PS"
            targetNumber={635}
            subtext="4.4L TWIN-TURBO MHEV V8 ENGINE"
          />

          <TelemetryCard
            label="0–100 KM/H ACCELERATION"
            unit="SEC"
            targetNumber={3.8}
            decimals={1}
            subtext="DYNAMIC LAUNCH MODE WITH 750 NM TORQUE"
          />

          <TelemetryCard
            label="MAXIMUM VELOCITY"
            unit="KM/H"
            targetNumber={250}
            subtext="6D DYNAMICS HYDRAULIC INTERLINKED SUSPENSION"
          />

          <TelemetryCard
            label="WADING DEPTH CAPACITY"
            unit="MM"
            targetNumber={1000}
            subtext="CLASS-EXCLUSIVE EXTREME TERRAIN WATER FORDING"
          />

          <TelemetryCard
            label="PEAK ENGINE REDLINE"
            unit="RPM"
            targetNumber={7200}
            subtext="TUNED TWIN-TURBO INDUCTION WITH ACTIVE EXHAUST"
          />
        </div>

        {/* Chassis Architecture Engineering Note */}
        <div
          style={{
            marginTop: '24px',
            padding: '24px',
            backgroundColor: 'var(--color-carbon-deep)',
            border: '1px solid var(--color-graphite-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div>
            <div style={{ fontSize: '13px', color: 'var(--color-pearl-white)', marginBottom: '4px' }}>
              D7X ALL-ALUMINUM MONOCOQUE ARCHITECTURE
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-steel-mid)' }}>
              LIGHTWEIGHT EXTREME-STIFFNESS ALUMINUM MONOCOQUE · 29 KNM/DEG TORSIONAL RIGIDITY · 3X STRONGER THAN BODY-ON-FRAME
            </div>
          </div>
          <a href="#event-banner" className="btn-ghost" style={{ fontSize: '12px', color: '#ffffff' }}>
            <span>DISCOVER D7X ARCHITECTURE</span>
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
