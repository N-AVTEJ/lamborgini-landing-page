import React from 'react';

/**
 * Full-Bleed Editorial Image
 * Role: Large product or lifestyle photograph
 * 100% width, 0px radius, no caption overlay. Photograph extends edge to edge of viewport.
 * Used for car close-ups (tactical switchgear, badges) and lifestyle shots (desert rally, expedition).
 * The image does the talking — no frame, no shadow, no rounded corner.
 */
export default function FullBleedEditorialImage({
  image = '/images/defender-rally-expedition.jpg',
  alt = 'Land Rover Defender OCTA High-Speed Rally Raid Expedition'
}) {
  return (
    <section
      aria-label="Editorial Visual"
      style={{
        width: '100%',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        backgroundColor: 'var(--surface-carbony)'
      }}
    >
      <div
        style={{
          width: '100%',
          height: '560px',
          maxHeight: '75vh',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <img
          src={image}
          alt={alt}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
            display: 'block'
          }}
        />
      </div>
    </section>
  );
}
