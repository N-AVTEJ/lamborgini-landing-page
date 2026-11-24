import React, { useState, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

const modelList = [
  {
    id: 'defender-octa',
    category: 'DEFENDER OCTA',
    tag: 'EXTREME HIGH-PERFORMANCE V8',
    name: 'DEFENDER OCTA',
    hp: '635 PS',
    speed: '250 KM/H',
    accel: '3.8 S',
    image: '/images/defender-octa-yellow-spotlight.jpg',
    descriptor: '4.4-LITER TWIN-TURBO MHEV V8 WITH HYDRAULIC 6D DYNAMICS AND FLARED WHEEL ARCHES'
  },
  {
    id: 'defender-110',
    category: 'DEFENDER 110',
    tag: 'EXPEDITION BENCHMARK',
    name: 'DEFENDER 110',
    hp: '525 PS',
    speed: '240 KM/H',
    accel: '5.2 S',
    image: '/images/defender-110-hero-night.jpg',
    descriptor: '5.0-LITER SUPERCHARGED V8 WITH DUAL-SPEED TRANSFER BOX AND 900MM WADING CAPABILITY'
  },
  {
    id: 'defender-90',
    category: 'DEFENDER 90',
    tag: 'AGILE SHORT WHEELBASE',
    name: 'DEFENDER 90',
    hp: '525 PS',
    speed: '240 KM/H',
    accel: '5.2 S',
    image: '/images/defender-90-studio.jpg',
    descriptor: 'COMPACT THREE-DOOR CHASSIS WITH EXCEPTIONAL BREAKOVER ANGLE AND SUPERCHARGED MUSCLE'
  },
  {
    id: 'defender-130',
    category: 'DEFENDER 130',
    tag: '8-PASSENGER EXPEDITION',
    name: 'DEFENDER 130 OUTBOUND',
    hp: '500 PS',
    speed: '220 KM/H',
    accel: '5.7 S',
    image: '/images/defender-130-outbound.jpg',
    descriptor: 'EXPANDED 8-PASSENGER ADVENTURE VEHICLE WITH 2,516 LITERS CARGO CAPACITY AND OVERLAND GEAR SYSTEM'
  },
  {
    id: 'defender-trophy',
    category: 'DEFENDER TROPHY',
    tag: 'LIMITED WORKS EXPEDITION',
    name: 'DEFENDER WORKS TROPHY',
    hp: '405 PS',
    speed: '170 KM/H',
    accel: '5.6 S',
    image: '/images/defender-rally-expedition.jpg',
    descriptor: 'PURPOSE-BUILT LIMITED WORKS V8 EXPEDITION RECREATION WITH INTEGRATED WINCH AND UNDERBODY ARMOR'
  }
];

// Interactive Vehicle Card with Cursor Spotlight Reflection & Hairline Illumination
function VehicleTile({ model, onSelectModel }) {
  const [lightCoords, setLightCoords] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [scrollParallax, setScrollParallax] = useState(0);
  const imgWrapRef = useRef(null);

  // Scroll-linked parallax layer for gallery vehicle cards
  React.useEffect(() => {
    const isTest = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
    const prefersReducedMotion = typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
    if (isTest || prefersReducedMotion) return;

    let ticking = false;
    const calculateParallax = () => {
      if (!imgWrapRef.current) return;
      const rect = imgWrapRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight || 800;
      const centerDelta = (rect.top + rect.height / 2) - (windowHeight / 2);
      const offset = Math.max(-18, Math.min(18, -centerDelta * 0.045));
      setScrollParallax(offset);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(calculateParallax);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    calculateParallax();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleMouseMove = (e) => {
    if (!imgWrapRef.current) return;
    const rect = imgWrapRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setLightCoords({ x, y });
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="vehicle-tile-interactive"
      style={{
        backgroundColor: 'var(--surface-canvas-white)',
        border: isHovered ? '1px solid var(--color-carbony-black)' : '1px solid var(--color-marble-gray)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.25s ease, background-color 0.25s ease'
      }}
    >
      {/* Full-bleed Product Photograph with Interactive Specular Sheen & Scroll Parallax */}
      <div
        ref={imgWrapRef}
        onMouseMove={handleMouseMove}
        className="vehicle-tile-img-wrap"
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
          className="vehicle-tile-img"
          style={{
            transform: `translate3d(0, ${scrollParallax}px, 0) scale(${isHovered ? 1.07 : 1.03})`,
            transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        />

        {/* Dynamic Specular Light Reflection Follower */}
        <div
          className="vehicle-specular-sheen"
          style={{
            background: `radial-gradient(circle at ${lightCoords.x}% ${lightCoords.y}%, rgba(255, 255, 255, 0.32) 0%, rgba(255, 255, 255, 0.08) 40%, transparent 70%)`,
            opacity: isHovered ? 1 : 0
          }}
        />

        {/* Corner Telemetry Notch */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            backgroundColor: 'rgba(24, 24, 24, 0.88)',
            border: '1px solid var(--color-graphite-border)',
            padding: '4px 8px',
            fontSize: '10px',
            color: 'var(--color-pearl-white)',
            letterSpacing: '0.0230em',
            zIndex: 3
          }}
        >
          {model.hp} · {model.speed}
        </div>
      </div>

      {/* Caption Block below photograph with 24px internal padding */}
      <div style={{ padding: 'var(--spacing-24)', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Date Stamp & Category above title */}
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
            <ArrowRight
              size={14}
              style={{
                transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                transition: 'transform 0.2s ease'
              }}
            />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ModelLineupSection({ onSelectModel }) {
  const [activeFilter, setActiveFilter] = useState('ALL');

  const filters = ['ALL', 'DEFENDER OCTA', 'DEFENDER 110', 'DEFENDER 90', 'DEFENDER 130', 'DEFENDER TROPHY'];

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
      <div className="defender-container lambo-container">
        {/* Signature Section Heading Block */}
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
              SOLIHULL PRODUCTION &amp; EXPEDITION
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
            <VehicleTile
              key={model.id}
              model={model}
              onSelectModel={onSelectModel}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
