import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

const modelList = [
  {
    id: 'revuelto',
    category: 'V12 HPEV',
    tag: 'HIGH PERFORMANCE ELECTRIFIED VEHICLE',
    name: 'REVUELTO',
    hp: '1,015 CV',
    speed: '>350 KM/H',
    accel: '2.5 S',
    image: '/images/revuelto-yellow-spotlight.jpg',
    descriptor: '6.5-LITER V12 NATURALLY ASPIRATED WITH THREE AXIAL FLUX ELECTRIC MOTORS'
  },
  {
    id: 'temerario',
    category: 'V8 HPEV',
    tag: 'TWIN-TURBO REVOLUTION',
    name: 'TEMERARIO',
    hp: '920 CV',
    speed: '343 KM/H',
    accel: '2.7 S',
    image: '/images/temerario-studio.jpg',
    descriptor: '4.0-LITER TWIN-TURBO FLAT-PLANE V8 REVVING UP TO AN UNPRECEDENTED 10,000 RPM'
  },
  {
    id: 'sc63',
    category: 'HYBRID LMDH',
    tag: 'SQUADRA CORSE RACING',
    name: 'SC63',
    hp: '680 CV',
    speed: '340+ KM/H',
    accel: '2.3 S',
    image: '/images/sc63-racing-lemans.jpg',
    descriptor: 'CUSTOM 3.8-LITER COLD-V TWIN-TURBO V8 ENGINEERED FOR ENDURANCE LE MANS GLORY'
  }
];

export default function ModelLineupSection({ onSelectModel }) {
  const [activeFilter, setActiveFilter] = useState('ALL');

  const filters = ['ALL', 'V12 HPEV', 'V8 HPEV', 'HYBRID LMDH'];

  const displayedModels = activeFilter === 'ALL'
    ? modelList
    : modelList.filter(m => m.category === activeFilter);

  return (
    <section
      id="models"
      className="surface-canvas"
      style={{
        width: '100%',
        backgroundColor: 'var(--surface-canvas-white)',
        color: 'var(--color-carbony-black)'
      }}
    >
      <div className="lambo-container">
        {/* Signature Section Heading Block */}
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
              CURRENT SANT'AGATA PRODUCTION
            </div>
            <h2 className="section-title" style={{ color: 'var(--color-carbony-black)' }}>
              MODELS
            </h2>
          </div>

          <a
            href="#showroom-spotlight"
            className="section-action"
            style={{ color: 'var(--color-carbony-black)' }}
          >
            <span>DISCOVER ALL MODELS</span>
            <ArrowRight size={14} />
          </a>
        </div>

        {/* Filter Toolbar (Outlined Nav Button Style) */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '48px'
          }}
        >
          {filters.map((flt) => (
            <button
              key={flt}
              onClick={() => setActiveFilter(flt)}
              className="btn-outlined"
              style={{
                borderColor: activeFilter === flt ? 'var(--color-carbony-black)' : 'var(--color-ash-border)',
                backgroundColor: activeFilter === flt ? 'var(--color-carbony-black)' : 'transparent',
                color: activeFilter === flt ? 'var(--color-pearl-white)' : 'var(--color-carbony-black)',
                fontSize: '12px',
                padding: '10px 20px'
              }}
            >
              {flt}
            </button>
          ))}
        </div>

        {/* Product Image Tiles: 3 Columns, 24px gap, 0px radius */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'var(--spacing-24)',
            paddingBottom: 'var(--spacing-80)'
          }}
        >
          {displayedModels.map((model) => (
            <div
              key={model.id}
              style={{
                backgroundColor: 'var(--surface-canvas-white)',
                border: 'none',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Full-bleed Product Photograph (0px radius) */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16/9',
                  overflow: 'hidden',
                  backgroundColor: 'var(--color-marble-gray)'
                }}
              >
                <img
                  src={model.image}
                  alt={model.name}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>

              {/* Caption Block below photograph with 24px internal padding */}
              <div style={{ padding: 'var(--spacing-24)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                {/* Date Stamp & Category above title (10-12px LamboType uppercase #7d7d7d) */}
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--color-steel-mid)',
                    letterSpacing: '0.0230em',
                    marginBottom: '8px'
                  }}
                >
                  2026 PRODUCTION · {model.category}
                </div>

                {/* Model Headline */}
                <h3
                  style={{
                    fontSize: '28px',
                    letterSpacing: '0.0230em',
                    lineHeight: 1.15,
                    color: 'var(--color-carbony-black)',
                    marginBottom: '12px',
                    fontWeight: 400
                  }}
                >
                  {model.name}
                </h3>

                {/* Spec Badges Row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '12px',
                    padding: '16px 0',
                    borderTop: '1px solid var(--color-marble-gray)',
                    borderBottom: '1px solid var(--color-marble-gray)',
                    marginBottom: '16px'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--color-steel-mid)' }}>POWER</div>
                    <div style={{ fontSize: '15px', color: 'var(--color-carbony-black)', fontWeight: 400 }}>{model.hp}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--color-steel-mid)' }}>0–100 KM/H</div>
                    <div style={{ fontSize: '15px', color: 'var(--color-carbony-black)', fontWeight: 400 }}>{model.accel}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--color-steel-mid)' }}>MAX SPEED</div>
                    <div style={{ fontSize: '15px', color: 'var(--color-carbony-black)', fontWeight: 400 }}>{model.speed}</div>
                  </div>
                </div>

                {/* Description */}
                <p
                  style={{
                    fontSize: '13px',
                    lineHeight: '1.45',
                    color: 'var(--color-anvil)',
                    marginBottom: '24px',
                    flex: 1
                  }}
                >
                  {model.descriptor}
                </p>

                {/* Ghost Link CTA */}
                <div>
                  <a
                    href="#showroom-spotlight"
                    className="btn-ghost"
                    onClick={() => {
                      if (onSelectModel) onSelectModel(model.id);
                    }}
                    style={{
                      fontSize: '12px',
                      color: 'var(--color-carbony-black)'
                    }}
                  >
                    <span>EXPLORE MODEL DETAILS</span>
                    <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
