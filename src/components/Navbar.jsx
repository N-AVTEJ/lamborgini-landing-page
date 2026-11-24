import React, { useState } from 'react';
import { Menu, X, Search, Camera, ArrowRight } from 'lucide-react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const menuItems = [
    {
      category: 'MODELS',
      links: [
        { name: 'REVUELTO', desc: 'V12 HPEV HYBRID SUPER SPORTS CAR — 1015 CV' },
        { name: 'TEMERARIO', desc: 'V8 TWIN-TURBO HPEV — 920 CV / 10,000 RPM' },
        { name: 'URUS SE', desc: 'SUPER SUV PLUG-IN HYBRID — 800 CV' },
        { name: 'HURACÁN STERRATO', desc: 'ALL-TERRAIN V10 NATURALLY ASPIRATED' },
        { name: 'LIMITED SERIES', desc: 'COUNTACH LPI 800-4 & FEW-OFFS' }
      ]
    },
    {
      category: 'MOTORSPORT',
      links: [
        { name: 'SC63 LMDH', desc: 'FIA WEC & IMSA GTP HYBRID HYPERCAR' },
        { name: 'SUPER TROFEO', desc: 'THE FASTEST ONE-MAKE CHAMPIONSHIP' },
        { name: 'SQUADRA CORSE', desc: 'FACTORY RACING & DRIVER ACADEMY' }
      ]
    },
    {
      category: 'HERITAGE & INNOVATION',
      links: [
        { name: 'DIREZIONE COR TAURI', desc: 'DECARBONIZATION & HYBRID ROADMAP' },
        { name: 'POLO STORICO', desc: 'ARCHIVE & HISTORIC RESTORATION' },
        { name: 'CENTRO STILE', desc: 'DESIGN LANGUAGE & AERODYNAMICS' }
      ]
    }
  ];

  const filteredLinks = searchQuery.trim() === ''
    ? []
    : menuItems.flatMap(cat => cat.links).filter(link => 
        link.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.desc.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '64px',
          backgroundColor: 'var(--color-carbony-black)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          borderBottom: 'none'
        }}
      >
        {/* Left: Hamburger + MENU */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: 'var(--color-pearl-white)',
            background: 'none',
            border: 'none',
            padding: '8px 0',
            cursor: 'pointer'
          }}
        >
          {menuOpen ? <X size={20} color="#ffffff" strokeWidth={1.5} /> : <Menu size={20} color="#ffffff" strokeWidth={1.5} />}
          <span style={{ fontSize: '12px', letterSpacing: '0.0230em', color: '#ffffff' }}>
            {menuOpen ? 'CLOSE' : 'MENU'}
          </span>
        </button>

        {/* Center: Lamborghini Bull Logo (White Monochrome) */}
        <a
          href="#"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#ffffff'
          }}
          aria-label="Lamborghini Homepage"
        >
          {/* Authentic Silhouette Bull Shield Vector */}
          <svg width="28" height="34" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Outer Shield */}
            <polygon points="50,2 96,18 86,102 50,118 14,102 4,18" stroke="#ffffff" strokeWidth="4" fill="#202020" />
            {/* Bull Silhouette */}
            <path
              d="M32 38 C36 34, 44 32, 50 32 C56 32, 64 34, 68 38 C72 42, 70 48, 65 52 C61 55, 59 58, 63 64 C67 70, 71 78, 69 86 C67 92, 58 95, 50 95 C42 95, 33 92, 31 86 C29 78, 33 70, 37 64 C41 58, 39 55, 35 52 C30 48, 28 42, 32 38 Z"
              fill="#ffffff"
            />
            {/* Horns & Shoulders */}
            <path d="M26 40 Q22 28 34 26 Q38 32 36 40 Z" fill="#ffffff" />
            <path d="M74 40 Q78 28 66 26 Q62 32 64 40 Z" fill="#ffffff" />
          </svg>
          <span style={{ fontSize: '14px', letterSpacing: '0.0230em', fontWeight: 400, display: 'none' }} className="brand-text">
            AUTOMOBILI LAMBORGHINI
          </span>
        </a>

        {/* Right: Camera icon + Search icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button
            onClick={() => {
              const el = document.getElementById('showroom-spotlight');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            title="Jump to Showroom Spotlight"
            aria-label="Showroom Camera View"
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Camera size={19} color="#ffffff" strokeWidth={1.5} />
          </button>

          <button
            onClick={() => setSearchOpen(true)}
            title="Search Lamborghini Catalog"
            aria-label="Open search dialog"
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Search size={19} color="#ffffff" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* Slide-out Full Drawer Menu */}
      {menuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Main Navigation Menu"
          style={{
            position: 'fixed',
            top: '64px',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'var(--color-carbony-black)',
            zIndex: 999,
            overflowY: 'auto',
            padding: '48px 32px',
            borderTop: '1px solid var(--color-graphite-border)'
          }}
        >
          <div className="lambo-container" style={{ padding: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '48px' }}>
              {menuItems.map((sec, idx) => (
                <div key={idx}>
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--color-steel-mid)',
                      letterSpacing: '0.0230em',
                      paddingBottom: '16px',
                      marginBottom: '20px',
                      borderBottom: '1px solid var(--color-graphite-border)'
                    }}
                  >
                    {sec.category}
                  </div>
                  <ul style={{ listStyle: 'none' }}>
                    {sec.links.map((link, lIdx) => (
                      <li key={lIdx} style={{ marginBottom: '24px' }}>
                        <a
                          href="#models"
                          onClick={() => setMenuOpen(false)}
                          style={{ display: 'block', color: 'var(--color-pearl-white)' }}
                        >
                          <div
                            style={{
                              fontSize: '22px',
                              letterSpacing: '0.0230em',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: '6px'
                            }}
                          >
                            <span>{link.name}</span>
                            <ArrowRight size={16} color="var(--color-steel-mid)" />
                          </div>
                          <div
                            style={{
                              fontSize: '12px',
                              color: 'var(--color-steel-mid)',
                              letterSpacing: '0.0230em'
                            }}
                          >
                            {link.desc}
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Quick Contact & Showroom Link */}
            <div
              style={{
                marginTop: '48px',
                paddingTop: '32px',
                borderTop: '1px solid var(--color-graphite-border)',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '24px'
              }}
            >
              <div style={{ fontSize: '12px', color: 'var(--color-steel-mid)' }}>
                SANT'AGATA BOLOGNESE, BOLOGNA, ITALY · EST. 1963
              </div>
              <div style={{ display: 'flex', gap: '24px' }}>
                <a
                  href="#showroom-spotlight"
                  onClick={() => setMenuOpen(false)}
                  className="btn-outlined"
                  style={{ fontSize: '11px', padding: '10px 18px' }}
                >
                  ENTER SPOTLIGHT SHOWROOM →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {searchOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search Catalog"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.92)',
            zIndex: 1100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '120px 24px 48px'
          }}
        >
          <div style={{ width: '100%', maxWidth: '720px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-steel-mid)', letterSpacing: '0.0230em' }}>
                SEARCH SANT'AGATA ARCHIVE &amp; LINEUP
              </span>
              <button
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
                style={{ color: '#ffffff', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ position: 'relative', width: '100%', marginBottom: '32px' }}>
              <input
                type="text"
                autoFocus
                placeholder="TYPE MODEL NAME, HORSEPOWER, OR MOTORSPORT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--color-carbon-deep)',
                  border: '1px solid var(--color-graphite-border)',
                  color: '#ffffff',
                  fontSize: '18px',
                  fontFamily: 'var(--font-lambotype)',
                  letterSpacing: '0.0230em',
                  textTransform: 'uppercase',
                  padding: '16px 20px',
                  outline: 'none'
                }}
              />
            </div>

            {searchQuery && (
              <div style={{ backgroundColor: 'var(--color-carbony-black)', border: '1px solid var(--color-graphite-border)', maxHeight: '360px', overflowY: 'auto' }}>
                {filteredLinks.length > 0 ? (
                  filteredLinks.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setSearchOpen(false);
                        const el = document.getElementById('models');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid var(--color-graphite-border)',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontSize: '18px', color: '#ffffff', marginBottom: '4px' }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--color-steel-mid)' }}>{item.desc}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '24px', fontSize: '14px', color: 'var(--color-steel-mid)', textAlign: 'center' }}>
                    NO MATCHING SPECIFICATIONS OR MODELS FOUND
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
