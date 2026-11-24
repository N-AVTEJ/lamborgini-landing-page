import React from 'react';

export default function Footer() {
  const footerColumns = [
    {
      title: 'MODEL FAMILIES',
      links: [
        'REVUELTO V12 HPEV',
        'TEMERARIO V8 HPEV',
        'URUS SE HYBRID',
        'HURACÁN STERRATO',
        'COUNTACH LPI 800-4',
        'FEW-OFF & CONCEPTS'
      ]
    },
    {
      title: 'MOTORSPORT',
      links: [
        'SC63 LMDH HYBRID',
        'SUPER TROFEO EVO2',
        'GT3 CUSTOMER RACING',
        'ESPERIENZA CORSA',
        'SQUADRA CORSE DRIVER PROGRAM'
      ]
    },
    {
      title: 'HERITAGE & INNOVATION',
      links: [
        'CENTRO STILE SANT\'AGATA',
        'DIREZIONE COR TAURI',
        'POLO STORICO ARCHIVE',
        'MUSEO AUTOMOBILI LAMBORGHINI',
        'CARBON MONOFUSELAGE LAB'
      ]
    },
    {
      title: 'COMPANY & CONTACT',
      links: [
        'CORPORATE GOVERNANCE',
        'DEALERSHIP LOCATOR',
        'CAREERS & TALENT',
        'PRESS & MEDIA CENTER',
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
      <div className="lambo-container">
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
            {/* Bull Shield Vector */}
            <svg width="32" height="38" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="50,2 96,18 86,102 50,118 14,102 4,18" stroke="#ffffff" strokeWidth="4" fill="#202020" />
              <path
                d="M32 38 C36 34, 44 32, 50 32 C56 32, 64 34, 68 38 C72 42, 70 48, 65 52 C61 55, 59 58, 63 64 C67 70, 71 78, 69 86 C67 92, 58 95, 50 95 C42 95, 33 92, 31 86 C29 78, 33 70, 37 64 C41 58, 39 55, 35 52 C30 48, 28 42, 32 38 Z"
                fill="#ffffff"
              />
              <path d="M26 40 Q22 28 34 26 Q38 32 36 40 Z" fill="#ffffff" />
              <path d="M74 40 Q78 28 66 26 Q62 32 64 40 Z" fill="#ffffff" />
            </svg>
            <div>
              <div style={{ fontSize: '18px', letterSpacing: '0.0230em', fontWeight: 400 }}>
                AUTOMOBILI LAMBORGHINI S.P.A.
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-steel-mid)', letterSpacing: '0.0230em' }}>
                VIA MODENA, 12, 40019 SANT'AGATA BOLOGNESE BO, ITALY
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
            Fuel consumption and emission figures for Revuelto: Combined Fuel Consumption: 10.3 l/100km; Combined Electrical Consumption: 10.1 kWh/100km; Combined CO2 Emissions: 276 g/km (WLTP). Fuel consumption figures for Temerario: Combined Fuel Consumption: 11.2 l/100km; Combined CO2 Emissions: 290 g/km (WLTP). Fuel consumption figures for Urus SE: Combined Fuel Consumption: 14.1 l/100km; Combined Electrical Consumption: 15.2 kWh/100km; Combined CO2 Emissions: 325 g/km (WLTP). Values are determined in accordance with the mandatory European measurement procedure.
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
            © 2026 AUTOMOBILI LAMBORGHINI S.P.A. A SOLE SHAREHOLDER COMPANY PART OF AUDI GROUP. ALL RIGHTS RESERVED.
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
