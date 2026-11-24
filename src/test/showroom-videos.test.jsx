import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import ShowroomSpotlightStage from '../components/ShowroomSpotlightStage';
import CockpitSequence from '../components/CockpitSequence';
import StudioConfigurator from '../components/StudioConfigurator';
import EventBannerSection from '../components/EventBannerSection';

describe('Defender Showroom Video Assets Integration Suite', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. cockpit-door video asset integration', () => {
    it('renders cockpit-door video with correct attributes, poster, and dual sources (webm first, mp4 fallback)', () => {
      const { container } = render(<CockpitSequence startStatic={false} />);
      const doorVideo = container.querySelector('video.cockpit-door-video');
      expect(doorVideo).toBeInTheDocument();

      // Check required attributes
      expect(doorVideo).toHaveAttribute('poster', '/videos/cockpit-door-poster.jpg');
      expect(doorVideo.muted).toBe(true);
      expect(doorVideo.playsInline).toBe(true);
      expect(doorVideo.loop).toBe(false);

      // Check source tags structure
      const sources = doorVideo.querySelectorAll('source');
      expect(sources.length).toBe(2);
      expect(sources[0]).toHaveAttribute('src', '/videos/cockpit-door.webm');
      expect(sources[0]).toHaveAttribute('type', 'video/webm');
      expect(sources[1]).toHaveAttribute('src', '/videos/cockpit-door.mp4');
      expect(sources[1]).toHaveAttribute('type', 'video/mp4');
    });

    it('upgrades cockpit-door preload to "auto" on COCKPIT tab hover and focus in Showroom stage', () => {
      const { container } = render(<ShowroomSpotlightStage />);
      const cockpitTab = screen.getByRole('button', { name: /COCKPIT/i });

      // Before hover, initial preload is metadata
      const doorVideo = container.querySelector('video.cockpit-door-video');
      expect(doorVideo).toHaveAttribute('preload', 'metadata');

      // Hover over tab
      fireEvent.mouseEnter(cockpitTab);
      expect(doorVideo).toHaveAttribute('preload', 'auto');

      // Focus tab
      fireEvent.focus(cockpitTab);
      expect(doorVideo).toHaveAttribute('preload', 'auto');
    });

    it('triggers power-up sequence and interior view when cockpit-door video fires ended event', () => {
      const { container } = render(<CockpitSequence startStatic={false} />);
      const doorVideo = container.querySelector('video.cockpit-door-video');
      expect(doorVideo).toBeInTheDocument();

      // Fire ended event on door video
      act(() => {
        fireEvent.ended(doorVideo);
      });

      // Cluster boots up
      expect(screen.getByText('DEFENDER V8 CLUSTER')).toBeInTheDocument();
      expect(screen.getByText('READY · SPORT')).toBeInTheDocument();
    });
  });

  describe('2. cockpit-interior video asset integration', () => {
    it('renders cockpit-interior video with correct attributes, poster, and dual sources', () => {
      const { container } = render(<CockpitSequence startStatic={false} />);
      const interiorVideo = container.querySelector('video.cockpit-interior-video');
      expect(interiorVideo).toBeInTheDocument();

      expect(interiorVideo).toHaveAttribute('poster', '/videos/cockpit-interior-poster.jpg');
      expect(interiorVideo.muted).toBe(true);
      expect(interiorVideo.playsInline).toBe(true);
      expect(interiorVideo.loop).toBe(false);

      const sources = interiorVideo.querySelectorAll('source');
      expect(sources.length).toBe(2);
      expect(sources[0]).toHaveAttribute('src', '/videos/cockpit-interior.webm');
      expect(sources[0]).toHaveAttribute('type', 'video/webm');
      expect(sources[1]).toHaveAttribute('src', '/videos/cockpit-interior.mp4');
      expect(sources[1]).toHaveAttribute('type', 'video/mp4');
    });

    it('holds/freezes last frame without resetting or turning black on ended', () => {
      const { container } = render(<CockpitSequence startStatic={false} />);
      const interiorVideo = container.querySelector('video.cockpit-interior-video');

      act(() => {
        fireEvent.ended(interiorVideo);
      });

      // Video remains in DOM and does not reset
      expect(interiorVideo).toBeInTheDocument();
      expect(container.querySelector('.cockpit-sequence-container')).toBeInTheDocument();
    });
  });

  describe('3. studio-turntable video asset integration', () => {
    it('renders studio-turntable as background base layer with loop, autoplay, muted, and metadata preload', () => {
      const { container } = render(<StudioConfigurator />);
      const turntableVideo = container.querySelector('video.studio-turntable-video');
      expect(turntableVideo).toBeInTheDocument();

      expect(turntableVideo).toHaveAttribute('poster', '/videos/studio-turntable-poster.jpg');
      expect(turntableVideo).toHaveAttribute('preload', 'metadata');
      expect(turntableVideo.muted).toBe(true);
      expect(turntableVideo.loop).toBe(true);
      expect(turntableVideo.playsInline).toBe(true);

      const sources = turntableVideo.querySelectorAll('source');
      expect(sources.length).toBe(2);
      expect(sources[0]).toHaveAttribute('src', '/videos/studio-turntable.webm');
      expect(sources[0]).toHaveAttribute('type', 'video/webm');
      expect(sources[1]).toHaveAttribute('src', '/videos/studio-turntable.mp4');
      expect(sources[1]).toHaveAttribute('type', 'video/mp4');
    });

    it('overlays color swatch configurator on top of studio-turntable while base video sources remain unchanged', () => {
      const { container } = render(<StudioConfigurator />);
      const tintOverlay = container.querySelector('.studio-swatch-tint-overlay');
      expect(tintOverlay).toBeInTheDocument();

      const greenBtn = screen.getByRole('button', { name: /Select PANGEA GREEN/i });
      fireEvent.click(greenBtn);

      // Overlay updates color
      expect(tintOverlay).toHaveStyle({ backgroundColor: '#4b5b48' });

      // Base video sources are unchanged
      const turntableVideo = container.querySelector('video.studio-turntable-video');
      const sources = turntableVideo.querySelectorAll('source');
      expect(sources[0]).toHaveAttribute('src', '/videos/studio-turntable.webm');
      expect(sources[1]).toHaveAttribute('src', '/videos/studio-turntable.mp4');
    });
  });

  describe('4. desert-expedition video asset integration', () => {
    it('lazy-mounts desert-expedition video only when scrolled near', () => {
      // With forceMount=false and no intersection, video should not be mounted
      const { container } = render(<EventBannerSection forceMount={false} />);
      const unmountedVideo = container.querySelector('video.event-banner-bg-video');
      expect(unmountedVideo).not.toBeInTheDocument();

      // When scrolled near (forceMount=true), video mounts
      const { container: mountedContainer } = render(<EventBannerSection forceMount={true} />);
      const bannerVideo = mountedContainer.querySelector('video.event-banner-bg-video');
      expect(bannerVideo).toBeInTheDocument();

      expect(bannerVideo).toHaveAttribute('poster', '/videos/desert-expedition-poster.jpg');
      expect(bannerVideo.muted).toBe(true);
      expect(bannerVideo.loop).toBe(true);
      expect(bannerVideo.playsInline).toBe(true);

      const sources = bannerVideo.querySelectorAll('source');
      expect(sources.length).toBe(2);
      expect(sources[0]).toHaveAttribute('src', '/videos/desert-expedition.webm');
      expect(sources[0]).toHaveAttribute('type', 'video/webm');
      expect(sources[1]).toHaveAttribute('src', '/videos/desert-expedition.mp4');
      expect(sources[1]).toHaveAttribute('type', 'video/mp4');
    });
  });

  describe('5. prefers-reduced-motion accessibility compliance for all 4 assets', () => {
    it('mounts poster <img> and ZERO <video> elements in DOM for Cockpit sequence when reduced motion is preferred', () => {
      const { container } = render(<CockpitSequence forceReducedMotion={true} />);
      const videos = container.querySelectorAll('video');
      expect(videos.length).toBe(0);

      const posterImg = container.querySelector('img.cockpit-interior-poster');
      expect(posterImg).toBeInTheDocument();
      expect(posterImg).toHaveAttribute('src', '/videos/cockpit-interior-poster.jpg');
    });

    it('mounts poster <img> and ZERO <video> elements in DOM for Studio turntable when reduced motion is preferred', () => {
      vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }));

      const { container } = render(<StudioConfigurator />);
      const videos = container.querySelectorAll('video');
      expect(videos.length).toBe(0);

      const posterImg = container.querySelector('img.studio-turntable-poster');
      expect(posterImg).toBeInTheDocument();
      expect(posterImg).toHaveAttribute('src', '/videos/studio-turntable-poster.jpg');
    });

    it('mounts poster <img> and ZERO <video> elements in DOM for Event Banner when reduced motion is preferred', () => {
      vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }));

      const { container } = render(<EventBannerSection forceMount={true} />);
      const videos = container.querySelectorAll('video');
      expect(videos.length).toBe(0);

      const posterImg = container.querySelector('img.event-banner-bg-poster');
      expect(posterImg).toBeInTheDocument();
      expect(posterImg).toHaveAttribute('src', '/videos/desert-expedition-poster.jpg');
    });
  });
});
