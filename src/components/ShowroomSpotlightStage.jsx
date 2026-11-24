import React, { useState, useEffect } from 'react';
import { ArrowRight, Play, Square, Activity } from 'lucide-react';
import { defenderV8Engine } from '../utils/engineAudio';

export default function ShowroomSpotlightStage() {
  const [spotlightMode, setSpotlightMode] = useState('theater'); // 'theater' | 'ambient' | 'stealth'
  const [currentAngle, setCurrentAngle] = useState('aero'); // 'aero' | 'cockpit' | 'studio'
  const [engineRunning, setEngineRunning] = useState(false);
  const [currentRPM, setCurrentRPM] = useState(0);

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

  const handleToggleEngine = () => {
    if (engineRunning) {
      defenderV8Engine.stop();
      setEngineRunning(false);
      setCurrentRPM(0);
    } else {
      defenderV8Engine.startIdle((rpm) => {
        setCurrentRPM(rpm);
      });
      setEngineRunning(true);
    }
  };

  const handleRevThrottle = () => {
    if (!engineRunning) {
      defenderV8Engine.startIdle((rpm) => {
        setCurrentRPM(rpm);
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
    return () => {
      defenderV8Engine.stop();
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
                  4.4L TWIN-TURBO V8 TELEMETRY
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
                    const threshold = 800 + i * 530;
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
                <span>{engineRunning ? 'SHUTDOWN DEFENDER V8 (STOP)' : 'IGNITE DEFENDER V8 (START)'}</span>
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
                  <span>REV TO 7,200 RPM</span>
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
              635 PS
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-steel-mid)' }}>
              4.4L TWIN-TURBO MHEV V8 ENGINE
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--surface-carbon-deep)', padding: 'var(--spacing-32)' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-steel-mid)', letterSpacing: '0.0230em', marginBottom: '8px' }}>
              0–100 KM/H ACCELERATION
            </div>
            <div style={{ fontSize: '48px', color: 'var(--color-pearl-white)', lineHeight: 1, marginBottom: '8px' }}>
              3.8 SEC
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-steel-mid)' }}>
              DYNAMIC LAUNCH MODE WITH 750 NM TORQUE
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--surface-carbon-deep)', padding: 'var(--spacing-32)' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-steel-mid)', letterSpacing: '0.0230em', marginBottom: '8px' }}>
              MAXIMUM VELOCITY
            </div>
            <div style={{ fontSize: '48px', color: 'var(--color-pearl-white)', lineHeight: 1, marginBottom: '8px' }}>
              250 KM/H
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-steel-mid)' }}>
              6D DYNAMICS HYDRAULIC INTERLINKED SUSPENSION
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--surface-carbon-deep)', padding: 'var(--spacing-32)' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-steel-mid)', letterSpacing: '0.0230em', marginBottom: '8px' }}>
              PEAK ENGINE REDLINE
            </div>
            <div style={{ fontSize: '48px', color: 'var(--color-pearl-white)', lineHeight: 1, marginBottom: '8px' }}>
              7,200 RPM
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-steel-mid)' }}>
              TUNED TWIN-TURBO INDUCTION WITH ACTIVE EXHAUST
            </div>
          </div>
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
