import React from 'react';

export default function Footer() {
  const footerColumns = [
    {
      title: 'MODEL FAMILIES',
      links: [
        'DEFENDER OCTA V8',
        'DEFENDER 110 EXPEDITION',
        'DEFENDER 90 SHORT WHEELBASE',
        'DEFENDER 130 OUTBOUND',
        'DEFENDER WORKS V8 TROPHY',
        'SV BESPOKE COMMISSIONS'
      ]
    },
    {
      title: 'EXPEDITIONS & MOTORSPORT',
      links: [
        'DEFENDER EXPEDITION TROPHY',
        'DAKAR RALLY RAID PROGRAM',
        'TERRAIN RESPONSE 2',
        'ARCTIC POLAR TRIALS',
        'LAND ROVER EXPERIENCE ACADEMY'
      ]
    },
    {
      title: 'HERITAGE & INNOVATION',
      links: [
        'SOLIHULL CLASSIC WORKS',
        'D7X ALUMINUM MONOCOQUE',
        '6D DYNAMICS LAB',
        '75 YEARS HERITAGE ARCHIVE',
        'SUSTAINABLE EXPLORATION ROADMAP'
      ]
    },
    {
      title: 'COMPANY & CONTACT',
      links: [
        'CORPORATE GOVERNANCE',
        'SPECIAL VEHICLE OPERATIONS',
        'RETAILER LOCATOR',
        'PRESS & MEDIA ASSETS',
        'SUSTAINABILITY REPORT 2026'
      ]
    }
  ];

  return (
    <footer
      id="footer"
      style={{
        backgroundColor: 'var(--surface-carbon-deep)',
        color: 'var(--color-pearl-white)',
        borderTop: '1px solid var(--color-graphite-border)',
        paddingTop: 'var(--spacing-80)',
        paddingBottom: 'var(--spacing-48)'
      }}
    >
      <div className="defender-container lambo-container">
        {/* Brand Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '24px',
            paddingBottom: 'var(--spacing-40)',
            borderBottom: '1px solid var(--color-graphite-border)',
            marginBottom: 'var(--spacing-48)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Defender Geometric Shield Vector */}
            <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="50,4 96,22 96,78 50,96 4,78 4,22" stroke="#ffffff" strokeWidth="4" fill="#202020" />
              <rect x="22" y="32" width="56" height="36" stroke="#ffffff" strokeWidth="3.5" fill="none" />
              <line x1="22" y1="50" x2="78" y2="50" stroke="#ffffff" strokeWidth="3" />
              <line x1="42" y1="32" x2="42" y2="68" stroke="#ffffff" strokeWidth="3" />
              <line x1="58" y1="32" x2="58" y2="68" stroke="#ffffff" strokeWidth="3" />
              <circle cx="50" cy="50" r="3" fill="#ffc000" />
            </svg>
            <div>
              <div style={{ fontSize: '18px', letterSpacing: '0.08em', fontWeight: 400 }}>
                LAND ROVER DEFENDER
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-steel-mid)', letterSpacing: '0.0230em' }}>
                LODE LANE, SOLIHULL, WEST MIDLANDS B92 8NW, UNITED KINGDOM
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <a
              href="#showroom-spotlight"
              className="btn-outlined"
              style={{ fontSize: '11px', padding: '10px 18px' }}
            >
              BACK TO SPOTLIGHT STAGE ↑
            </a>
          </div>
        </div>

        {/* 4 Multi-Column Directory */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '32px',
            marginBottom: 'var(--spacing-64)'
          }}
        >
          {footerColumns.map((col, idx) => (
            <div key={idx}>
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--color-steel-mid)',
                  letterSpacing: '0.0230em',
                  marginBottom: '16px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid var(--color-graphite-border)'
                }}
              >
                {col.title}
              </div>
              <ul style={{ listStyle: 'none' }}>
                {col.links.map((link, lIdx) => (
                  <li key={lIdx} style={{ marginBottom: '12px' }}>
                    <a
                      href="#models"
                      style={{
                        fontSize: '13px',
                        color: 'var(--color-pearl-white)',
                        letterSpacing: '0.0230em',
                        transition: 'opacity 0.2s ease, color 0.2s ease'
                      }}
                      onMouseEnter={(e) => (e.target.style.opacity = '0.7')}
                      onMouseLeave={(e) => (e.target.style.opacity = '1')}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Official EU Fuel Consumption & CO2 Emissions Compliance Box */}
        <div
          style={{
            backgroundColor: 'var(--surface-carbony)',
            border: '1px solid var(--color-graphite-border)',
            padding: '24px',
            marginBottom: 'var(--spacing-40)'
          }}
        >
          <div
            style={{
              fontSize: '11px',
              color: 'var(--color-steel-mid)',
              letterSpacing: '0.0230em',
              marginBottom: '8px'
            }}
          >
            CONSUMPTION AND EMISSIONS VALUES UNDER WLTP PROTOCOL
          </div>
          <p
            style={{
              fontSize: '11px',
              lineHeight: '1.6',
              color: 'var(--color-ash-border)',
              letterSpacing: '0.0230em'
            }}
          >
            Fuel consumption and emission figures for Defender OCTA: Combined Fuel Consumption: 11.5 l/100km; Combined CO2 Emissions: 262 g/km (WLTP). Fuel consumption figures for Defender 110 V8: Combined Fuel Consumption: 12.8 l/100km; Combined CO2 Emissions: 290 g/km (WLTP). Fuel consumption figures for Defender 90 V8: Combined Fuel Consumption: 12.6 l/100km; Combined CO2 Emissions: 285 g/km (WLTP). Fuel consumption figures for Defender 130 V8: Combined Fuel Consumption: 13.1 l/100km; Combined CO2 Emissions: 298 g/km (WLTP). Values are determined in accordance with the mandatory European measurement procedure.
          </p>
        </div>

        {/* Legal & Copyright */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '11px',
            color: 'var(--color-steel-mid)',
            letterSpacing: '0.0230em'
          }}
        >
          <div>
            © 2026 DEFENDER. JAGUAR LAND ROVER LIMITED. REGISTERED IN ENGLAND. ALL RIGHTS RESERVED.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="#" style={{ color: 'var(--color-steel-mid)' }}>PRIVACY STATEMENT</a>
            <a href="#" style={{ color: 'var(--color-steel-mid)' }}>COOKIE POLICY</a>
            <a href="#" style={{ color: 'var(--color-steel-mid)' }}>LEGAL NOTICE</a>
            <a href="#" style={{ color: 'var(--color-steel-mid)' }}>WHISTLEBLOWING</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
