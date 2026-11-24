import React from 'react';
import { ArrowRight } from 'lucide-react';

const editorialStories = [
  {
    id: 'defender-rally',
    date: '24 NOV 2026',
    category: 'EXPEDITION & RALLY',
    title: 'DEFENDER OCTA: RECORD TRANS-DESERT RALLY RAID ACROSS THE DAKAR CORRIDOR',
    summary: 'Special Vehicle Operations proves extreme durability with 6D Dynamics interlinked hydraulic suspension across 5,000 km of brutal wilderness.',
    image: '/images/defender-rally-expedition.jpg'
  },
  {
    id: 'tactical-luxury',
    date: '18 NOV 2026',
    category: 'MATERIAL INNOVATION',
    title: 'TACTICAL LUXURY: INSIDE THE REDESIGNED DEFENDER HIGH-DURABILITY COCKPIT',
    summary: 'Engineered with Ultrafabrics, powder-coated magnesium structural cross-beam, and integrated Pivi Pro navigation for limitless exploration.',
    image: '/images/defender-interior-cockpit.jpg'
  },
  {
    id: 'solihull-heritage',
    date: '04 NOV 2026',
    category: 'HERITAGE & CLASSIC WORKS',
    title: 'SOLIHULL CLASSIC WORKS: 75 YEARS OF DEFENDER HERITAGE RESTORATION',
    summary: 'Master technicians at the Solihull historical facility restore original Series I and Defender Works V8 Trophy icons using factory heritage archives.',
    image: '/images/defender-classic-heritage.jpg'
  }
];

export default function StoryGridSection() {
  return (
    <section
      id="story-grid"
      className="surface-canvas"
      style={{
        width: '100%',
        backgroundColor: 'var(--surface-canvas-white)',
        color: 'var(--color-carbony-black)'
      }}
    >
      <div className="defender-container lambo-container">
        {/* Signature Section Heading Block on #ffffff */}
        <div className="defender-section-header lambo-section-header">
          <div>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--color-steel-mid)',
                letterSpacing: '0.0230em',
                marginBottom: '8px'
              }}
            >
              NEWS, EXPEDITIONS &amp; HERITAGE
            </div>
            <h2 className="section-title" style={{ color: 'var(--color-carbony-black)' }}>
              NEWS &amp; STORIES
            </h2>
          </div>

          <a
            href="#footer"
            className="section-action"
            style={{ color: 'var(--color-carbony-black)' }}
          >
            <span>DISCOVER EDITORIALS</span>
            <ArrowRight size={14} />
          </a>
        </div>

        {/* Three-Column Story Grid: Three equal-width columns with 24px gap, no card chrome */}
        <div className="story-grid-3">
          {editorialStories.map((story) => (
            <article
              key={story.id}
              className="story-card-interactive"
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                padding: 0
              }}
            >
              {/* Date Stamp & Category: 10-12px UPPERCASE */}
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--color-steel-mid)',
                  letterSpacing: '0.0230em',
                  marginBottom: '10px'
                }}
              >
                {story.date} · {story.category}
              </div>

              {/* Headline: 16-27px UPPERCASE */}
              <h3
                style={{
                  fontSize: '20px',
                  lineHeight: '1.25',
                  letterSpacing: '0.0230em',
                  color: 'var(--color-carbon-deep)',
                  marginBottom: '16px',
                  minHeight: '50px',
                  fontWeight: 400
                }}
              >
                {story.title}
              </h3>

              {/* Full-bleed Photograph below headline at 0px radius */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16/10',
                  overflow: 'hidden',
                  backgroundColor: 'var(--color-marble-gray)',
                  marginBottom: '16px'
                }}
              >
                <img
                  src={story.image}
                  alt={story.title}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>

              {/* Summary text */}
              <p
                style={{
                  fontSize: '14px',
                  lineHeight: '1.5',
                  color: 'var(--color-anvil)',
                  marginBottom: '20px',
                  flex: 1
                }}
              >
                {story.summary}
              </p>

              {/* Ghost Link Button */}
              <div>
                <a
                  href="#event-banner"
                  className="btn-ghost"
                  style={{
                    fontSize: '12px',
                    color: 'var(--color-carbony-black)'
                  }}
                >
                  <span>READ STORY</span>
                  <ArrowRight size={14} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
