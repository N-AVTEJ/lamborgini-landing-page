import * as THREE from 'three';

export const DEFENDER_PALETTE = [
  { id: 'giallo-vivo', name: 'GIALLO VIVO', hex: '#ffc000', badge: 'HERO OCTA LAUNCH SPEC', metalness: 0.65, roughness: 0.20 },
  { id: 'pangea-green', name: 'PANGEA GREEN', hex: '#4b5b48', badge: 'SOLIHULL HERITAGE SPEC', metalness: 0.50, roughness: 0.28 },
  { id: 'tasman-blue', name: 'TASMAN BLUE', hex: '#2e434f', badge: 'EXPEDITION OCEANIC METALLIC', metalness: 0.65, roughness: 0.22 },
  { id: 'carpathian-grey', name: 'CARPATHIAN GREY', hex: '#35393c', badge: 'PREMIUM SATIN GRAPHITE', metalness: 0.35, roughness: 0.40 },
  { id: 'fuji-white', name: 'FUJI WHITE', hex: '#f0f2f3', badge: 'HIGH-CONTRAST ARCTIC SPEC', metalness: 0.20, roughness: 0.18 }
];

export function applyDefender3DPaint(materials, hex, presetId) {
  if (!materials || !materials.length) return;
  const spec = DEFENDER_PALETTE.find((s) => s.id === presetId) || {};
  const targetColor = new THREE.Color(hex);
  const targetMetalness = spec.metalness ?? 0.55;
  const targetRoughness = spec.roughness ?? 0.22;

  materials.forEach((mat) => {
    mat.color.copy(targetColor);
    mat.metalness = targetMetalness;
    mat.roughness = targetRoughness;
    mat.needsUpdate = true;
  });
}
