import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import fs from 'fs';
import path from 'path';

import App from '../App';
import Navbar from '../components/Navbar';
import HeroStage from '../components/HeroStage';
import ModelLineupSection from '../components/ModelLineupSection';
import ShowroomSpotlightStage from '../components/ShowroomSpotlightStage';
import StoryGridSection from '../components/StoryGridSection';
import FullBleedEditorialImage from '../components/FullBleedEditorialImage';
import EventBannerSection from '../components/EventBannerSection';
import Footer from '../components/Footer';

describe('Lamborghini Design Tokens & CSS Specification', () => {
  const cssPath = path.resolve(__dirname, '../index.css');
  const css = fs.readFileSync(cssPath, 'utf8');

  it('contains all 11 required Lamborghini color tokens in index.css', () => {
    expect(css).toContain('--color-giallo-vivo: #ffc000');
    expect(css).toContain('--color-giallo-ombra: #917300');
    expect(css).toContain('--color-carbony-black: #202020');
    expect(css).toContain('--color-pure-black: #000000');
    expect(css).toContain('--color-carbon-deep: #181818');
    expect(css).toContain('--color-pearl-white: #ffffff');
    expect(css).toContain('--color-marble-gray: #f5f5f5');
    expect(css).toContain('--color-graphite-border: #494949');
    expect(css).toContain('--color-steel-mid: #7d7d7d');
    expect(css).toContain('--color-ash-border: #969696');
    expect(css).toContain('--color-anvil: #313131');
  });

  it('contains all 5 surface elevation contrast tokens', () => {
    expect(css).toContain('--surface-canvas-white: #ffffff');
    expect(css).toContain('--surface-marble: #f5f5f5');
    expect(css).toContain('--surface-carbony: #202020');
    expect(css).toContain('--surface-carbon-deep: #181818');
    expect(css).toContain('--surface-pure-black: #000000');
  });

  it('strictly enforces 0px border-radius globally for cards, badges, images, and buttons', () => {
    expect(css).toContain('--radius-cards: 0px');
    expect(css).toContain('--radius-badges: 0px');
    expect(css).toContain('--radius-images: 0px');
    expect(css).toContain('--radius-buttons: 0px');
    expect(css).toContain('border-radius: 0 !important');
    expect(css).toContain('box-shadow: none !important');
  });

  it('strictly enforces single weight 400 for LamboType with no 500/600/700/bold weights', () => {
    expect(css).toContain('--font-weight-regular: 400');
    expect(css).not.toMatch(/font-weight:\s*(?:500|600|700|bold)/i);
  });

  it('configures LamboType typography with Barlow Condensed substitute and 0.0230em letter-spacing', () => {
    expect(css).toContain('--font-lambotype');
    expect(css).toContain('Barlow Condensed');
    expect(css).toContain('letter-spacing: 0.0230em');
    expect(css).toContain('text-transform: uppercase');
  });

  it('defines Giallo Action Button with white text (#ffffff or pearl white) and 0px radius', () => {
    expect(css).toContain('.btn-giallo');
    expect(css).toContain('background-color: var(--color-giallo-vivo)');
    expect(css).toContain('color: var(--color-pearl-white)');
  });
});

describe('Source Code Conformance Checks', () => {
  it('does not contain any unauthorized font-weight values (500, 600, 700, bold) in JSX components', () => {
    const compDir = path.resolve(__dirname, '../components');
    const files = fs.readdirSync(compDir).filter(f => f.endsWith('.jsx'));
    
    for (const file of files) {
      const content = fs.readFileSync(path.join(compDir, file), 'utf8');
      expect(content).not.toMatch(/fontWeight:\s*(?:500|600|700|['"]bold['"])/i);
    }
  });

  it('does not contain rogue unauthorized colors like #e2e2e2', () => {
    const compDir = path.resolve(__dirname, '../components');
    const files = fs.readdirSync(compDir).filter(f => f.endsWith('.jsx'));

    for (const file of files) {
      const content = fs.readFileSync(path.join(compDir, file), 'utf8');
      expect(content).not.toContain('#e2e2e2');
    }
  });
});

describe('Top Navigation Bar Component', () => {
  it('renders MENU label on left, bull logo in center, and camera + search on right', () => {
    render(<Navbar />);
    // Left: Menu
    const menuButton = screen.getByRole('button', { name: /toggle navigation menu/i });
    expect(menuButton).toBeInTheDocument();
    expect(screen.getByText('MENU')).toBeInTheDocument();

    // Center: Logo
    const homeLink = screen.getByRole('link', { name: /lamborghini homepage/i });
    expect(homeLink).toBeInTheDocument();

    // Right: Camera + Search
    expect(screen.getByRole('button', { name: /showroom camera view/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open search dialog/i })).toBeInTheDocument();

    // Open menu
    fireEvent.click(menuButton);
    expect(screen.getByText('CLOSE')).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: /main navigation menu/i })).toBeInTheDocument();
    expect(screen.getByText('REVUELTO')).toBeInTheDocument();
    expect(screen.getByText('TEMERARIO')).toBeInTheDocument();

    // Close menu
    fireEvent.click(menuButton);
    expect(screen.getByText('MENU')).toBeInTheDocument();
  });

  it('renders search modal and filters Lamborghini catalog models', () => {
    render(<Navbar />);
    const searchBtn = screen.getByRole('button', { name: /open search dialog/i });
    expect(searchBtn).toBeInTheDocument();

    fireEvent.click(searchBtn);
    const searchInput = screen.getByPlaceholderText(/TYPE MODEL NAME, HORSEPOWER, OR MOTORSPORT.../i);
    expect(searchInput).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'Revuelto' } });
    expect(screen.getByText('V12 HPEV HYBRID SUPER SPORTS CAR — 1015 CV')).toBeInTheDocument();
  });
});

describe('Hero Stage Component', () => {
  it('renders Revuelto display headline (80-120px scale), eyebrow, and primary Giallo action button', () => {
    render(<HeroStage />);
    expect(screen.getByText('FROM NOW ON')).toBeInTheDocument();
    const heading = screen.getByRole('heading', { level: 1, name: /REVUELTO/i });
    expect(heading).toBeInTheDocument();
    expect(screen.getByText(/THE FIRST SUPER SPORTS V12 HPEV HYBRID — 1015 CV/i)).toBeInTheDocument();

    const cta = screen.getByRole('link', { name: /EXPLORE REVUELTO/i });
    expect(cta).toHaveClass('btn-giallo');
  });

  it('renders carousel navigation pips with 2 horizontal lines and hexagonal pause control', () => {
    render(<HeroStage />);
    const slide1Btn = screen.getByRole('button', { name: /go to slide 1/i });
    const slide2Btn = screen.getByRole('button', { name: /go to slide 2/i });
    expect(slide1Btn).toBeInTheDocument();
    expect(slide2Btn).toBeInTheDocument();

    fireEvent.click(slide2Btn);
    expect(screen.getByRole('heading', { level: 1, name: /TEMERARIO/i })).toBeInTheDocument();

    const pauseBtn = screen.getByRole('button', { name: /pause slide carousel/i });
    fireEvent.click(pauseBtn);
    expect(screen.getByRole('button', { name: /play slide carousel/i })).toBeInTheDocument();
  });
});

describe('Model Lineup Section Component', () => {
  it('renders the signature 2-column section heading block', () => {
    render(<ModelLineupSection />);
    expect(screen.getByRole('heading', { level: 2, name: /MODELS/i })).toBeInTheDocument();
    expect(screen.getByText(/DISCOVER ALL MODELS/i)).toBeInTheDocument();
  });

  it('filters models dynamically based on category toolbar', () => {
    render(<ModelLineupSection />);
    expect(screen.getByText('REVUELTO')).toBeInTheDocument();
    expect(screen.getByText('TEMERARIO')).toBeInTheDocument();
    expect(screen.getByText('SC63')).toBeInTheDocument();

    const v8Btn = screen.getByRole('button', { name: 'V8 HPEV' });
    fireEvent.click(v8Btn);

    expect(screen.getByText('TEMERARIO')).toBeInTheDocument();
    expect(screen.queryByText('REVUELTO')).not.toBeInTheDocument();
  });
});

describe('Showroom Spotlight Stage — "Showroom black with one yellow car under spotlights"', () => {
  it('renders the spotlight stage with technical specification panels', () => {
    render(<ShowroomSpotlightStage />);
    expect(screen.getByRole('heading', { level: 2, name: /SHOWROOM STAGE/i })).toBeInTheDocument();
    expect(screen.getByText('GIALLO VIVO SPOTLIGHT SPEC')).toBeInTheDocument();

    expect(screen.getByText('1,015 CV')).toBeInTheDocument();
    expect(screen.getByText('2.5 SEC')).toBeInTheDocument();
    expect(screen.getByText('>350 KM/H')).toBeInTheDocument();
    expect(screen.getByText('9,500 RPM')).toBeInTheDocument();
  });

  it('allows switching perspective angles (AERO, COCKPIT, TEMERARIO)', () => {
    render(<ShowroomSpotlightStage />);
    const cockpitBtn = screen.getByRole('button', { name: /COCKPIT/i });
    fireEvent.click(cockpitBtn);

    expect(screen.getByText('FORGED CARBON & AVVIO FLAP')).toBeInTheDocument();
  });

  it('allows switching spotlight lighting modes', () => {
    const { container } = render(<ShowroomSpotlightStage />);
    const stealthBtn = screen.getByRole('button', { name: /STEALTH CONTRAST/i });
    fireEvent.click(stealthBtn);

    const beam = container.querySelector('.showroom-spotlight-beam');
    expect(beam).toHaveClass('stealth');
  });

  it('interacts with the V12 Web Audio Engine ignition and rev controls', () => {
    render(<ShowroomSpotlightStage />);
    const startBtn = screen.getByRole('button', { name: /IGNITE V12 \(AVVIO\)/i });
    expect(startBtn).toBeInTheDocument();

    fireEvent.click(startBtn);
    expect(screen.getByRole('button', { name: /SHUTDOWN V12 \(STOP\)/i })).toBeInTheDocument();
    expect(screen.getByText(/REV TO 9,500 RPM/i)).toBeInTheDocument();

    const stopBtn = screen.getByRole('button', { name: /SHUTDOWN V12 \(STOP\)/i });
    fireEvent.click(stopBtn);
    expect(screen.getByRole('button', { name: /IGNITE V12 \(AVVIO\)/i })).toBeInTheDocument();
  });
});

describe('Story Grid Section Component', () => {
  it('renders three editorial stories with date stamp and full-bleed image references without card chrome', () => {
    render(<StoryGridSection />);
    expect(screen.getByRole('heading', { level: 2, name: /NEWS & STORIES/i })).toBeInTheDocument();
    expect(screen.getByText(/LAMBORGHINI SC63: THE HYBRID HYPERCAR/i)).toBeInTheDocument();
    expect(screen.getByText(/DIREZIONE COR TAURI/i)).toBeInTheDocument();
    expect(screen.getByText(/POLO STORICO: 50 YEARS/i)).toBeInTheDocument();
    expect(screen.getByText(/24 NOV 2026/i)).toBeInTheDocument();
  });
});

describe('Full-Bleed Editorial Image Component', () => {
  it('renders 100% width edge-to-edge photograph without caption overlay', () => {
    const { container } = render(<FullBleedEditorialImage />);
    const section = screen.getByRole('region', { name: /editorial visual/i });
    expect(section).toBeInTheDocument();
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    // No text caption overlay inside region
    expect(section.textContent).toBe('');
  });
});

describe('Event Banner Section Component', () => {
  it('renders Esperienza Corsa announcement with 54-80px headline, body, and Giallo CTA button', () => {
    render(<EventBannerSection />);
    expect(screen.getByRole('heading', { level: 2, name: /ESPERIENZA CORSA & SUPER TROFEO WORLD FINALS/i })).toBeInTheDocument();
    expect(screen.getByText('AUTODROMO ENZO E DINO FERRARI')).toBeInTheDocument();
    expect(screen.getByText('CIRCUIT DE SPA-FRANCORCHAMPS')).toBeInTheDocument();
    expect(screen.getByText('YAS MARINA CIRCUIT')).toBeInTheDocument();

    // Verify presence of Giallo CTA button
    const cta = screen.getByRole('link', { name: /REQUEST TRACK INVITATION/i });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveClass('btn-giallo');
  });
});

describe('Footer Component', () => {
  it('renders Automobili Lamborghini S.p.A. brand mark and official EU WLTP consumption figures', () => {
    render(<Footer />);
    expect(screen.getByText('AUTOMOBILI LAMBORGHINI S.P.A.')).toBeInTheDocument();
    expect(screen.getByText(/CONSUMPTION AND EMISSIONS VALUES UNDER WLTP PROTOCOL/i)).toBeInTheDocument();
    expect(screen.getByText(/Combined Fuel Consumption: 10.3 l\/100km/i)).toBeInTheDocument();
    expect(screen.getByText(/Combined CO2 Emissions: 276 g\/km/i)).toBeInTheDocument();
    expect(screen.getByText(/ALL RIGHTS RESERVED/i)).toBeInTheDocument();
  });
});

describe('Full Application Integration', () => {
  it('renders entire page without crashes or runtime exceptions in alternating dark/light rhythm', () => {
    const { container } = render(<App />);
    expect(container.querySelector('.lambo-app')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /REVUELTO/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /SHOWROOM STAGE/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /ESPERIENZA CORSA & SUPER TROFEO WORLD FINALS/i })).toBeInTheDocument();
  });
});
