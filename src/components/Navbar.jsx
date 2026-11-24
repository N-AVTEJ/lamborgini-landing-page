import React, { useState, useEffect } from 'react';
import { Menu, X, Search, Camera, ArrowRight } from 'lucide-react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (searchOpen) setSearchOpen(false);
        if (menuOpen) setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, menuOpen]);

  const menuItems = [
    {
      category: 'MODELS',
      links: [
        { name: 'DEFENDER OCTA', desc: '4.4L TWIN-TURBO V8 MHEV — 635 PS / 250 KM/H' },
        { name: 'DEFENDER 110', desc: '5-DOOR EXPEDITION BENCHMARK — 525 PS V8' },
        { name: 'DEFENDER 90', desc: 'AGILE 3-DOOR SHORT WHEELBASE ROCK CRAWLER' },
        { name: 'DEFENDER 130', desc: '8-PASSENGER GRAND EXPEDITION EXPLORER' },
        { name: 'DEFENDER TROPHY', desc: 'LIMITED WORKS V8 EXPEDITION RECREATION' }
      ]
    },
    {
      category: 'EXPEDITIONS & CAPABILITY',
      links: [
        { name: 'DEFENDER EXPEDITION TROPHY', desc: 'THE WORLD\'S TOUGHEST OVERLAND TRIALS' },
        { name: '6D DYNAMICS', desc: 'HYDRAULIC INTERLINKED SUSPENSION TECH' },
        { name: 'TERRAIN RESPONSE 2', desc: 'ALL-SURFACE ALL-WHEEL DRIVE INTELLIGENCE' }
      ]
    },
    {
      category: 'HERITAGE & BESPOKE',
      links: [
        { name: 'SOLIHULL CLASSIC WORKS', desc: '75 YEARS OF DEFENDER 4X4 HERITAGE' },
        { name: 'SV BESPOKE', desc: 'COMMISSIONED PERSONALIZATION STUDIO' },
        { name: 'DEFENDER ARCHIVE', desc: 'SERIES I TO MODERN EXPEDITION ICONS' }
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

        {/* Center: Land Rover Defender Emblem & Wordmark (White Monochrome) */}
        <a
          href="#"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#ffffff'
          }}
          aria-label="Defender Homepage"
        >
          {/* Authentic Defender Geometric Shield Vector */}
          <svg width="30" height="30" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Outer Defender Octagonal/Geometric Shield */}
            <polygon points="50,4 96,22 96,78 50,96 4,78 4,22" stroke="#ffffff" strokeWidth="4" fill="#202020" />
            {/* Inner Bold Geometric 4x4 Grid Icon */}
            <rect x="22" y="32" width="56" height="36" rx="0" stroke="#ffffff" strokeWidth="3.5" fill="none" />
            <line x1="22" y1="50" x2="78" y2="50" stroke="#ffffff" strokeWidth="3" />
            <line x1="42" y1="32" x2="42" y2="68" stroke="#ffffff" strokeWidth="3" />
            <line x1="58" y1="32" x2="58" y2="68" stroke="#ffffff" strokeWidth="3" />
            <circle cx="50" cy="50" r="3" fill="#ffc000" />
          </svg>
          <span style={{ fontSize: '16px', letterSpacing: '0.08em', fontWeight: 400 }} className="brand-text">
            DEFENDER
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
            title="Search Defender Catalog"
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
          <div className="defender-container lambo-container" style={{ padding: 0 }}>
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
                SOLIHULL, WEST MIDLANDS, UNITED KINGDOM · EST. 1948
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
                SEARCH SOLIHULL ARCHIVE &amp; LINEUP
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
                placeholder="TYPE MODEL NAME, HORSEPOWER, OR EXPEDITION..."
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
