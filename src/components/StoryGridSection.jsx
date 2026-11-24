import React from 'react';
import { ArrowRight } from 'lucide-react';

const editorialStories = [
  {
    id: 'sc63-lemans',
    date: '24 NOV 2026',
    category: 'MOTORSPORT',
    title: 'LAMBORGHINI SC63: THE HYBRID HYPERCAR CONQUERS THE 24 HOURS OF LE MANS',
    summary: 'Squadra Corse demonstrates unprecedented hybrid reliability and blistering pace against global prototype competition in FIA WEC.',
    image: '/images/sc63-racing-lemans.jpg'
  },
  {
    id: 'cor-tauri',
    date: '18 NOV 2026',
    category: 'SUSTAINABILITY & ROADMAP',
    title: 'DIREZIONE COR TAURI: FULL HYBRIDIZATION MILESTONE ACHIEVED IN SANT\'AGATA',
    summary: 'With Revuelto, Temerario, and Urus SE now active in production, Automobili Lamborghini completes Phase 2 of its historic environmental pact.',
    image: '/images/interior-cockpit-macro.jpg'
  },
  {
    id: 'polo-storico',
    date: '04 NOV 2026',
    category: 'HERITAGE & POLO STORICO',
    title: 'POLO STORICO: 50 YEARS OF COUNTACH LP400 CHASSIS RESTORATION',
    summary: 'Master craftspeople at the historical workshop resurrect the iconic wedge masterpiece using original engineering blueprints from 1974.',
    image: '/images/polo-storico-countach.jpg'
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
      <div className="lambo-container">
        {/* Signature Section Heading Block on #ffffff */}
        <div className="lambo-section-header">
          <div>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--color-steel-mid)',
                letterSpacing: '0.0230em',
                marginBottom: '8px'
              }}
            >
              NEWS, MOTORSPORT &amp; HERITAGE
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
            <span>DESCUBRIR EDITORIALS</span>
            <ArrowRight size={14} />
          </a>
        </div>

        {/* Three-Column Story Grid: Three equal-width columns with 24px gap, no card chrome */}
        <div className="story-grid-3">
          {editorialStories.map((story) => (
            <article
              key={story.id}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                padding: 0
              }}
            >
              {/* Date Stamp & Category: 10-12px LamboType UPPERCASE */}
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

              {/* Headline: 16-27px LamboType UPPERCASE */}
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
