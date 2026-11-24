import React, { useState, useEffect } from 'react';
import { ArrowRight, Play, Square, Activity } from 'lucide-react';
import { v12Engine } from '../utils/engineAudio';

export default function ShowroomSpotlightStage() {
  const [spotlightMode, setSpotlightMode] = useState('theater'); // 'theater' | 'ambient' | 'stealth'
  const [currentAngle, setCurrentAngle] = useState('aero'); // 'aero' | 'cockpit' | 'temerario'
  const [engineRunning, setEngineRunning] = useState(false);
  const [currentRPM, setCurrentRPM] = useState(0);

  const angleImages = {
    aero: {
      url: '/images/revuelto-yellow-spotlight.jpg',
      label: 'EXTERIOR 3/4 FRONT AERO',
      badge: 'GIALLO INTI SHOWROOM SPEC'
    },
    cockpit: {
      url: '/images/interior-cockpit-macro.jpg',
      label: 'AERONAUTICAL COCKPIT',
      badge: 'FORGED CARBON & AVVIO FLAP'
    },
    temerario: {
      url: '/images/temerario-studio.jpg',
      label: 'SANT\'AGATA STUDIO STAGE',
      badge: 'GRIGIO TELESTO MONOFUSELAGE'
    }
  };

  const handleToggleEngine = () => {
    if (engineRunning) {
      v12Engine.stop();
      setEngineRunning(false);
      setCurrentRPM(0);
    } else {
      v12Engine.startIdle((rpm) => {
        setCurrentRPM(rpm);
      });
      setEngineRunning(true);
    }
  };

  const handleRevThrottle = () => {
    if (!engineRunning) {
      v12Engine.startIdle((rpm) => {
        setCurrentRPM(rpm);
      });
      setEngineRunning(true);
      setTimeout(() => {
        v12Engine.revEngine();
      }, 400);
    } else {
      v12Engine.revEngine();
    }
  };

  useEffect(() => {
    return () => {
      v12Engine.stop();
    };
  }, []);

  return (
    <section
      id="showroom-spotlight"
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
      {/* Downward Theatrical Overhead Spotlight Beam */}
      <div className={`showroom-spotlight-beam ${spotlightMode}`} />

      <div className="lambo-container" style={{ position: 'relative', zIndex: 10 }}>
        {/* Section Heading Block — Dark Stage Variant */}
        <div className="lambo-section-header" style={{ paddingTop: 0 }}>
          <div>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--color-steel-mid)',
                letterSpacing: '0.0230em',
                marginBottom: '8px'
              }}
            >
              CENTRO STILE SANT'AGATA BOLOGNESE
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
          {/* Main Visual Display */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16/9',
              maxHeight: '680px',
              overflow: 'hidden',
              backgroundColor: '#000000'
            }}
          >
            <img
              src={angleImages[currentAngle].url}
              alt={angleImages[currentAngle].label}
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

            {/* Stage Mode & Perspective Badges */}
            <div
              style={{
                position: 'absolute',
                top: '24px',
                left: '24px',
                display: 'flex',
                gap: '12px',
                zIndex: 5
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

            {/* Live RPM Digital HUD Overlay (when engine is running) */}
            {engineRunning && (
              <div
                style={{
                  position: 'absolute',
                  top: '24px',
                  right: '24px',
                  backgroundColor: 'rgba(0, 0, 0, 0.85)',
                  border: '1px solid var(--color-graphite-border)',
                  padding: '12px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  zIndex: 5
                }}
              >
                <div style={{ fontSize: '10px', color: 'var(--color-steel-mid)', letterSpacing: '0.0230em' }}>
                  6.5L V12 NATURALLY ASPIRATED TELEMETRY
                </div>
                <div
                  style={{
                    fontSize: '32px',
                    color: 'var(--color-pearl-white)',
                    lineHeight: 1.1,
                    fontWeight: 400,
                    margin: '4px 0'
                  }}
                >
                  {currentRPM.toLocaleString()} <span style={{ fontSize: '14px', color: 'var(--color-steel-mid)' }}>RPM</span>
                </div>
                {/* Visual Equalizer / Soundwave */}
                <div style={{ display: 'flex', alignItems: 'flex-end', height: '18px', gap: '3px' }}>
                  {[...Array(12)].map((_, i) => {
                    const threshold = 1000 + i * 700;
                    const isActive = currentRPM >= threshold;
                    return (
                      <span
                        key={i}
                        className={`tach-bar ${isActive ? 'active' : ''}`}
                        style={{
                          backgroundColor: 'var(--color-pearl-white)',
                          height: isActive ? `${6 + (i * 1.2)}px` : '4px',
                          opacity: isActive ? 1 : 0.35
                        }}
                      />
                    );
                  })}
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
                  onClick={() => setCurrentAngle(angleKey)}
                  className="btn-outlined"
                  style={{
                    padding: '8px 14px',
                    fontSize: '11px',
                    borderColor: currentAngle === angleKey ? 'var(--color-pearl-white)' : 'var(--color-graphite-border)',
                    backgroundColor: currentAngle === angleKey ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: currentAngle === angleKey ? 'var(--color-pearl-white)' : 'var(--color-steel-mid)'
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
                  className="btn-outlined"
                  style={{
                    padding: '8px 14px',
                    fontSize: '11px',
                    borderColor: spotlightMode === mode.key ? 'var(--color-pearl-white)' : 'var(--color-graphite-border)',
                    backgroundColor: spotlightMode === mode.key ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: spotlightMode === mode.key ? 'var(--color-pearl-white)' : 'var(--color-steel-mid)'
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
                className="btn-outlined"
                style={{
                  padding: '8px 18px',
                  fontSize: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderColor: engineRunning ? 'var(--color-pearl-white)' : 'var(--color-steel-mid)',
                  color: '#ffffff'
                }}
              >
                {engineRunning ? <Square size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
                <span>{engineRunning ? 'SHUTDOWN V12 (STOP)' : 'IGNITE V12 (AVVIO)'}</span>
              </button>

              {engineRunning && (
                <button
                  onClick={handleRevThrottle}
                  className="btn-outlined"
                  style={{
                    padding: '8px 18px',
                    fontSize: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderColor: 'var(--color-pearl-white)',
                    color: 'var(--color-pearl-white)'
                  }}
                >
                  <Activity size={14} />
                  <span>REV TO 9,500 RPM</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Monolithic Specification Panels: 4 Equal Units with Hairline Borders */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1px',
            backgroundColor: 'var(--color-graphite-border)',
            marginTop: 'var(--spacing-40)',
            border: '1px solid var(--color-graphite-border)'
          }}
        >
          <div style={{ backgroundColor: 'var(--surface-carbon-deep)', padding: 'var(--spacing-32)' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-steel-mid)', letterSpacing: '0.0230em', marginBottom: '8px' }}>
              COMBINED SYSTEM POWER
            </div>
            <div style={{ fontSize: '48px', color: 'var(--color-pearl-white)', lineHeight: 1, marginBottom: '8px' }}>
              1,015 CV
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-steel-mid)' }}>
              6.5L L545 V12 ENGINE + 3 ELECTRIC MOTORS
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--surface-carbon-deep)', padding: 'var(--spacing-32)' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-steel-mid)', letterSpacing: '0.0230em', marginBottom: '8px' }}>
              0–100 KM/H ACCELERATION
            </div>
            <div style={{ fontSize: '48px', color: 'var(--color-pearl-white)', lineHeight: 1, marginBottom: '8px' }}>
              2.5 SEC
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-steel-mid)' }}>
              LAUNCH CONTROL WITH FULL E-TORQUE VECTORING
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--surface-carbon-deep)', padding: 'var(--spacing-32)' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-steel-mid)', letterSpacing: '0.0230em', marginBottom: '8px' }}>
              MAXIMUM VELOCITY
            </div>
            <div style={{ fontSize: '48px', color: 'var(--color-pearl-white)', lineHeight: 1, marginBottom: '8px' }}>
              &gt;350 KM/H
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-steel-mid)' }}>
              ACTIVE AERODYNAMICS GENERATING +61% DOWNFORCE
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--surface-carbon-deep)', padding: 'var(--spacing-32)' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-steel-mid)', letterSpacing: '0.0230em', marginBottom: '8px' }}>
              NATURAL INDUCTION REDLINE
            </div>
            <div style={{ fontSize: '48px', color: 'var(--color-pearl-white)', lineHeight: 1, marginBottom: '8px' }}>
              9,500 RPM
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-steel-mid)' }}>
              LIGHTEST &amp; MOST POWERFUL 12-CYLINDER IN BRAND HISTORY
            </div>
          </div>
        </div>

        {/* Chassis Monofuselage Engineering Note */}
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
              AERONAUTICAL MONOFUSELAGE ARCHITECTURE
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-steel-mid)' }}>
              100% FORGED COMPOSITES MONOCOQUE · +25% TORSIONAL RIGIDITY OVER AVENTADOR · -10% WEIGHT
            </div>
          </div>
          <a href="#event-banner" className="btn-ghost" style={{ fontSize: '12px', color: '#ffffff' }}>
            <span>DISCOVER MONOFUSELAGE ENGINEERING</span>
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
