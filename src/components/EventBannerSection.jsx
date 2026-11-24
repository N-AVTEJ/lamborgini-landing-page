import React from 'react';
import { ArrowRight, Trophy } from 'lucide-react';

/**
 * Event Banner Component
 * Role: Promotional or event announcement band
 * Lighter photographic background with overlay text block at left.
 * Headline at 54–80px LamboType uppercase white, supporting body at 16–18px uppercase white,
 * then a Giallo CTA button below. Right side: implicit photographic content.
 * Padding: 40px top/bottom.
 */
export default function EventBannerSection() {
  return (
    <section
      id="event-banner"
      aria-label="Defender Expedition Event Banner"
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: 'var(--surface-carbony)',
        backgroundImage: 'linear-gradient(to right, rgba(24, 24, 24, 0.94) 0%, rgba(24, 24, 24, 0.82) 48%, rgba(24, 24, 24, 0.45) 100%), url(/images/defender-rally-expedition.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%',
        padding: '40px 0',
        borderTop: '1px solid var(--color-graphite-border)',
        borderBottom: '1px solid var(--color-graphite-border)'
      }}
    >
      <div className="lambo-container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'var(--spacing-48)',
            alignItems: 'center'
          }}
        >
          {/* Overlay Text Block at Left */}
          <div style={{ maxWidth: '680px' }}>
            <div
              style={{
                fontSize: '13px',
                color: 'var(--color-steel-mid)',
                letterSpacing: '0.0230em',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textTransform: 'uppercase'
              }}
            >
              <Trophy size={16} color="var(--color-steel-mid)" />
              <span>OFFICIAL DEFENDER EXPEDITION TROPHY</span>
            </div>

            {/* Headline at 54–80px uppercase white */}
            <h2
              style={{
                fontSize: 'clamp(54px, 5.5vw, 76px)',
                lineHeight: 1.0,
                letterSpacing: '0.0230em',
                color: 'var(--color-pearl-white)',
                marginBottom: '20px',
                fontWeight: 400,
                textTransform: 'uppercase'
              }}
            >
              DEFENDER EXPEDITION TROPHY &amp; GLOBAL OFF-ROAD FINALS
            </h2>

            {/* Supporting body at 16–18px uppercase white */}
            <p
              style={{
                fontSize: '16px',
                lineHeight: 1.5,
                letterSpacing: '0.0230em',
                color: 'var(--color-pearl-white)',
                marginBottom: '32px',
                textTransform: 'uppercase',
                fontWeight: 400
              }}
            >
              TEST YOUR EXPEDITION LIMITS ACROSS THE PLANET'S MOST UNFORGIVING WILDERNESS. RECEIVE EXCLUSIVE ONE-ON-ONE ALL-TERRAIN TELEMETRY COACHING FROM OFFICIAL LAND ROVER EXPEDITION MASTERS BEHIND THE WHEEL OF THE DEFENDER 110 TROPHY.
            </p>

            {/* Giallo CTA Button Below */}
            <div>
              <a
                href="#footer"
                className="btn-giallo"
                style={{
                  fontSize: '14px',
                  padding: '16px 24px',
                  color: 'var(--color-pearl-white)'
                }}
              >
                <span>REQUEST EXPEDITION INVITATION</span>
                <ArrowRight size={16} strokeWidth={2} />
              </a>
            </div>
          </div>

          {/* Right Side: Expedition destinations */}
          <div
            style={{
              backgroundColor: 'rgba(24, 24, 24, 0.78)',
              border: '1px solid var(--color-graphite-border)',
              padding: 'var(--spacing-32)'
            }}
          >
            <div
              style={{
                fontSize: '12px',
                color: 'var(--color-steel-mid)',
                letterSpacing: '0.0230em',
                paddingBottom: '16px',
                marginBottom: '20px',
                borderBottom: '1px solid var(--color-graphite-border)',
                textTransform: 'uppercase'
              }}
            >
              CONFIRMED EXPEDITION DESTINATIONS
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--color-graphite-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '16px', color: 'var(--color-pearl-white)', letterSpacing: '0.0230em' }}>
                    MOAB RED ROCK CANYONS
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--color-steel-mid)', letterSpacing: '0.0230em' }}>
                    UTAH, USA
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-steel-mid)', letterSpacing: '0.0230em' }}>
                  OCTOBER 28–30, 2026 · GLOBAL TROPHY FINALS
                </div>
              </div>

              <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--color-graphite-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '16px', color: 'var(--color-pearl-white)', letterSpacing: '0.0230em' }}>
                    NAMIB DESERT DUNES
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--color-steel-mid)', letterSpacing: '0.0230em' }}>
                    SWAKOPMUND, NAMIBIA
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-steel-mid)', letterSpacing: '0.0230em' }}>
                  NOVEMBER 14–16, 2026 · CONTINENTAL CHALLENGE
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '16px', color: 'var(--color-pearl-white)', letterSpacing: '0.0230em' }}>
                    ARCTIC ICE FIELDS
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--color-steel-mid)', letterSpacing: '0.0230em' }}>
                    ARJEPLOG, SWEDEN
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-steel-mid)', letterSpacing: '0.0230em' }}>
                  DECEMBER 04–06, 2026 · SUB-ZERO POLAR FINALE
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
