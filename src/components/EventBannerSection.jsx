import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Trophy } from 'lucide-react';
import { useReducedMotion } from '../utils/useReducedMotion';

/**
 * Event Banner Component
 * Role: Promotional or event announcement band
 * Background: desert-expedition video (autoplay, muted, loop, playsInline),
 * lazy-mounted via IntersectionObserver so it only loads/plays once scrolled near.
 * Reduced motion fallback: mounts poster <img> instead of <video> (zero <video> tags in DOM).
 * Headline at 54–80px uppercase white, supporting body at 16–18px uppercase white,
 * then a Giallo CTA button below. Right side: confirmed expedition destinations.
 * Padding: 40px top/bottom.
 */
export default function EventBannerSection({ forceMount = false, forceReducedMotion }) {
  const systemReducedMotion = useReducedMotion();
  const prefersReducedMotion = forceReducedMotion !== undefined ? forceReducedMotion : systemReducedMotion;
  const sectionRef = useRef(null);
  const [isInViewport, setIsInViewport] = useState(() => {
    return forceMount || typeof window === 'undefined' || typeof IntersectionObserver === 'undefined';
  });

  const shouldMountMedia = forceMount || isInViewport;

  useEffect(() => {
    if (forceMount || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsInViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: '250px 0px', threshold: 0.01 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [forceMount]);

  return (
    <section
      id="event-banner"
      ref={sectionRef}
      aria-label="Defender Expedition Event Banner"
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: 'var(--surface-carbony)',
        padding: '40px 0',
        borderTop: '1px solid var(--color-graphite-border)',
        borderBottom: '1px solid var(--color-graphite-border)',
        overflow: 'hidden'
      }}
    >
      {/* Background Media Layer: Lazy-mounted via IntersectionObserver */}
      {shouldMountMedia && (
        prefersReducedMotion ? (
          <img
            src="/videos/desert-expedition-poster.jpg"
            alt="Defender Desert Expedition"
            className="event-banner-bg-poster"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 40%',
              zIndex: 0
            }}
          />
        ) : (
          <video
            className="event-banner-bg-video"
            autoPlay
            muted
            loop
            playsInline
            poster="/videos/desert-expedition-poster.jpg"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 40%',
              zIndex: 0
            }}
          >
            <source src="/videos/desert-expedition.webm" type="video/webm" />
            <source src="/videos/desert-expedition.mp4" type="video/mp4" />
          </video>
        )
      )}

      {/* Atmospheric High-Contrast Dark Gradient Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(24, 24, 24, 0.94) 0%, rgba(24, 24, 24, 0.82) 48%, rgba(24, 24, 24, 0.45) 100%)',
          zIndex: 1,
          pointerEvents: 'none'
        }}
      />

      <div className="defender-container lambo-container" style={{ position: 'relative', zIndex: 2 }}>
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
              <Trophy size={16} color="var(--color-giallo-vivo)" />
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

          {/* Right Side: Expedition destinations with hairline hover feedback */}
          <div
            style={{
              backgroundColor: 'rgba(24, 24, 24, 0.82)',
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
