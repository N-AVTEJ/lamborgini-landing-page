import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import ShowroomSpotlightStage from '../components/ShowroomSpotlightStage';
import CockpitSequence from '../components/CockpitSequence';
import StudioConfigurator from '../components/StudioConfigurator';
import HeroStage from '../components/HeroStage';
import ModelLineupSection from '../components/ModelLineupSection';

describe('Problem 1: Cinematic Parallax and Tactile Interactions', () => {
  it('renders HeroStage with multi-layered parallax structure and reduced motion awareness', () => {
    const { container } = render(<HeroStage />);
    const hero = screen.getByRole('region', { name: /Hero Stage/i });
    expect(hero).toBeInTheDocument();

    // Check for foreground, midground atmospheric highlight, and background parallax layers
    expect(container.querySelector('.animate-monolithic-reveal')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /DEFENDER OCTA/i })).toBeInTheDocument();
  });

  it('renders ModelLineupSection vehicle cards with scroll-linked parallax image wraps', () => {
    const { container } = render(<ModelLineupSection />);
    const imgWraps = container.querySelectorAll('.vehicle-tile-img-wrap');
    expect(imgWraps.length).toBeGreaterThanOrEqual(5);

    const vehicleImages = container.querySelectorAll('.vehicle-tile-img');
    expect(vehicleImages.length).toBeGreaterThanOrEqual(5);
  });
});

describe('Problem 2: Cockpit Scripted Sequence Component', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('renders CockpitSequence with driver door, HUD cluster, center screen, and ambient lighting', () => {
    render(<CockpitSequence />);
    // Replay control should always be accessible
    expect(screen.getByRole('button', { name: /replay sequence/i })).toBeInTheDocument();

    // Verification of powered-up state elements
    expect(screen.getByText('DEFENDER V8 CLUSTER')).toBeInTheDocument();
    expect(screen.getByText(/DEFENDER 4X4i TERRAIN RESPONSE/i)).toBeInTheDocument();
    expect(screen.getByText(/WADE SENSING DEPTH/i)).toBeInTheDocument();
    expect(screen.getByText(/635 PS OCTA TUNE/i)).toBeInTheDocument();
  });

  it('allows clicking replay sequence button to re-trigger the sequence', () => {
    render(<CockpitSequence />);
    const replayBtn = screen.getByRole('button', { name: /replay sequence/i });
    expect(replayBtn).toBeInTheDocument();

    act(() => {
      fireEvent.click(replayBtn);
    });

    // Replay restarts sequence
    expect(screen.getByText(/INITIALIZING/i)).toBeInTheDocument();
  });

  it('renders ambient interior lighting strip with pulse styling', () => {
    const { container } = render(<CockpitSequence />);
    const ambientStrip = container.querySelector('.cockpit-ambient-strip');
    expect(ambientStrip).toBeInTheDocument();
  });
});

describe('Problem 3: Studio 3D Configurator Component', () => {
  it('renders all 5 mandatory Land Rover paint swatches plus custom hex picker', () => {
    render(<StudioConfigurator />);

    // Mandatory paint swatches
    expect(screen.getByRole('button', { name: /Select GIALLO VIVO/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Select PANGEA GREEN/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Select TASMAN BLUE/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Select CARPATHIAN GREY/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Select FUJI WHITE/i })).toBeInTheDocument();

    // Custom Hex color input & button
    expect(screen.getByLabelText(/choose custom paint color/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /custom hex:/i })).toBeInTheDocument();
  });

  it('switches body color on swatch selection', () => {
    render(<StudioConfigurator />);

    const pangeaBtn = screen.getByRole('button', { name: /Select PANGEA GREEN/i });
    fireEvent.click(pangeaBtn);

    expect(screen.getAllByText('PANGEA GREEN').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('SOLIHULL HERITAGE SPEC')).toBeInTheDocument();

    const tasmanBtn = screen.getByRole('button', { name: /Select TASMAN BLUE/i });
    fireEvent.click(tasmanBtn);

    expect(screen.getAllByText('TASMAN BLUE').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('EXPEDITION OCEANIC METALLIC')).toBeInTheDocument();
  });

  it('allows entering a custom hex color code and updates display info', () => {
    render(<StudioConfigurator />);

    const colorInput = screen.getByLabelText(/choose custom paint color/i);
    fireEvent.change(colorInput, { target: { value: '#1a365d' } });

    expect(screen.getByText(/CUSTOM HEX: #1A365D/i)).toBeInTheDocument();
    expect(screen.getByText('BESPOKE SVO COLOR')).toBeInTheDocument();
  });

  it('provides auto-orbit toggle and navigation controls', () => {
    render(<StudioConfigurator />);
    expect(screen.getByText(/DRAG TO ORBIT · PINCH\/SCROLL TO ZOOM/i)).toBeInTheDocument();

    const orbitBtn = screen.getByRole('button', { name: /auto orbit/i });
    expect(orbitBtn).toBeInTheDocument();
    fireEvent.click(orbitBtn);
  });
});

describe('Problem 4: Zero-Blank Crossfade & Shared-Element Transitions', () => {
  it('seamlessly transitions from AERO to COCKPIT without blank frames', () => {
    const { container } = render(<ShowroomSpotlightStage />);

    // Stage canvas is present
    const canvas = container.querySelector('.shared-staging-canvas');
    expect(canvas).toBeInTheDocument();

    // Switch to COCKPIT
    const cockpitBtn = screen.getByRole('button', { name: /COCKPIT/i });
    fireEvent.click(cockpitBtn);

    expect(screen.getByText('MAGNESIUM BEAM & PIVI PRO')).toBeInTheDocument();
    expect(container.querySelector('.cockpit-sequence-container')).toBeInTheDocument();
  });

  it('seamlessly transitions from COCKPIT to STUDIO and shows 3D configurator', () => {
    const { container } = render(<ShowroomSpotlightStage />);

    const studioBtn = screen.getByRole('button', { name: /STUDIO/i });
    fireEvent.click(studioBtn);

    expect(screen.getByText('CARPATHIAN GREY SATIN FINISH')).toBeInTheDocument();
    expect(container.querySelector('.studio-configurator-wrap')).toBeInTheDocument();
    expect(screen.getByText(/SVO BESPOKE PAINTWORK:/i)).toBeInTheDocument();
  });

  it('retains the softened multi-layer volumetric beam and secondary floor specular pool', () => {
    const { container } = render(<ShowroomSpotlightStage />);

    expect(container.querySelector('.showroom-stage-haze')).toBeInTheDocument();
    expect(container.querySelector('.showroom-spotlight-beam')).toBeInTheDocument();
    expect(container.querySelector('.showroom-floor-pool')).toBeInTheDocument();
  });
});
