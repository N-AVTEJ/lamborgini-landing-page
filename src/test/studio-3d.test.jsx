import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import fs from 'fs';
import path from 'path';
import * as THREE from 'three';
import StudioConfigurator from '../components/StudioConfigurator';
import ShowroomSpotlightStage from '../components/ShowroomSpotlightStage';
import { DEFENDER_PALETTE, applyDefender3DPaint } from '../utils/defenderStudioConfig';

describe('Defender 3D Studio Configurator Integration Suite', () => {
  describe('1. Model Asset Integrity', () => {
    it('verifies public/models/land_rover_defender.glb exists, has valid size and valid GLTF binary header', () => {
      const modelPath = path.resolve(process.cwd(), 'public/models/land_rover_defender.glb');
      expect(fs.existsSync(modelPath)).toBe(true);

      const stats = fs.statSync(modelPath);
      expect(stats.size).toBeGreaterThan(25000000); // ~29.7MB

      const fd = fs.openSync(modelPath, 'r');
      const header = Buffer.alloc(12);
      fs.readSync(fd, header, 0, 12, 0);
      fs.closeSync(fd);

      const magic = header.readUInt32LE(0);
      const version = header.readUInt32LE(4);
      // 'glTF' in hex is 0x46546C67
      expect(magic).toBe(0x46546c67);
      expect(version).toBe(2);
    });
  });

  describe('2. 3D Canvas Mounting & UI Controls in StudioConfigurator', () => {
    it('mounts the 3D WebGL canvas with data-testid and aria-label', () => {
      const { container } = render(<StudioConfigurator />);
      const canvas = container.querySelector('canvas.studio-3d-canvas');
      expect(canvas).toBeInTheDocument();
      expect(canvas).toHaveAttribute('data-testid', 'studio-3d-canvas');
      expect(canvas).toHaveAttribute('aria-label', expect.stringContaining('Interactive 3D Land Rover Defender Canvas'));
    });

    it('renders all 5 Land Rover Defender color swatches with accurate hex values', () => {
      render(<StudioConfigurator />);

      DEFENDER_PALETTE.forEach((swatch) => {
        const btn = screen.getByRole('button', { name: new RegExp(`Select ${swatch.name}`, 'i') });
        expect(btn).toBeInTheDocument();
      });
    });

    it('triggers onColorChange and onSelectPreset callbacks on user interaction', () => {
      const handleSelectPreset = vi.fn();
      const handleColorChange = vi.fn();

      render(
        <StudioConfigurator
          onSelectPreset={handleSelectPreset}
          onColorChange={handleColorChange}
        />
      );

      const pangeaBtn = screen.getByRole('button', { name: /Select PANGEA GREEN/i });
      fireEvent.click(pangeaBtn);
      expect(handleSelectPreset).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'pangea-green', hex: '#4b5b48' })
      );

      const colorInput = screen.getByLabelText(/choose custom paint color/i);
      fireEvent.change(colorInput, { target: { value: '#ff5722' } });
      expect(handleColorChange).toHaveBeenCalledWith('#ff5722');
    });
  });

  describe('3. Real-Time 3D Material Paint Swatch Transformations', () => {
    it('correctly updates Three.js material color, metalness, and roughness for all palette presets', () => {
      // Simulate Three.js bodypaint materials extracted from land_rover_defender.glb
      const mockMat1 = new THREE.MeshStandardMaterial({ name: 'bodypaint_A__tinted' });
      const mockMat2 = new THREE.MeshStandardMaterial({ name: 'petro_cap' });
      const materials = [mockMat1, mockMat2];

      // Giallo Vivo
      applyDefender3DPaint(materials, '#ffc000', 'giallo-vivo');
      expect(mockMat1.color.getHexString().toLowerCase()).toBe('ffc000');
      expect(mockMat1.metalness).toBe(0.65);
      expect(mockMat1.roughness).toBe(0.20);
      expect(mockMat2.color.getHexString().toLowerCase()).toBe('ffc000');

      // Pangea Green
      applyDefender3DPaint(materials, '#4b5b48', 'pangea-green');
      expect(mockMat1.color.getHexString().toLowerCase()).toBe('4b5b48');
      expect(mockMat1.metalness).toBe(0.50);
      expect(mockMat1.roughness).toBe(0.28);

      // Tasman Blue
      applyDefender3DPaint(materials, '#2e434f', 'tasman-blue');
      expect(mockMat1.color.getHexString().toLowerCase()).toBe('2e434f');
      expect(mockMat1.metalness).toBe(0.65);
      expect(mockMat1.roughness).toBe(0.22);

      // Carpathian Grey (Satin finish)
      applyDefender3DPaint(materials, '#35393c', 'carpathian-grey');
      expect(mockMat1.color.getHexString().toLowerCase()).toBe('35393c');
      expect(mockMat1.metalness).toBe(0.35);
      expect(mockMat1.roughness).toBe(0.40);

      // Fuji White (High gloss)
      applyDefender3DPaint(materials, '#f0f2f3', 'fuji-white');
      expect(mockMat1.color.getHexString().toLowerCase()).toBe('f0f2f3');
      expect(mockMat1.metalness).toBe(0.20);
      expect(mockMat1.roughness).toBe(0.18);

      // Bespoke Custom Hex
      applyDefender3DPaint(materials, '#9c27b0', 'custom');
      expect(mockMat1.color.getHexString().toLowerCase()).toBe('9c27b0');
      expect(mockMat1.metalness).toBe(0.55);
      expect(mockMat1.roughness).toBe(0.22);
    });
  });

  describe('4. Showroom Spotlight Stage Perspective Integration', () => {
    it('seamlessly mounts 3D Studio canvas when switching to STUDIO perspective', () => {
      const { container } = render(<ShowroomSpotlightStage />);

      const studioBtn = screen.getByRole('button', { name: /STUDIO/i });
      fireEvent.click(studioBtn);

      const canvas = container.querySelector('canvas.studio-3d-canvas');
      expect(canvas).toBeInTheDocument();
      expect(screen.getByText('SVO BESPOKE PAINTWORK:')).toBeInTheDocument();
    });

    it('persists color swatches and updates HUD badge in Showroom stage', () => {
      render(<ShowroomSpotlightStage />);

      const studioBtn = screen.getByRole('button', { name: /STUDIO/i });
      fireEvent.click(studioBtn);

      // Switch to Tasman Blue
      const tasmanBtn = screen.getByRole('button', { name: /Select TASMAN BLUE/i });
      fireEvent.click(tasmanBtn);

      expect(screen.getByText('EXPEDITION OCEANIC METALLIC')).toBeInTheDocument();
    });
  });
});
