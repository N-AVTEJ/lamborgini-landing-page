import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Palette, Check, Sliders, Sparkles, RotateCw, Compass } from 'lucide-react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useReducedMotion } from '../utils/useReducedMotion';
import { DEFENDER_PALETTE, parseSafeColor } from '../utils/defenderStudioConfig';

function safePlay(video, name = 'turntableVideo') {
  if (!video || typeof video.play !== 'function') return;
  try {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    const p = video.play();
    if (p && typeof p.catch === 'function') {
      p.catch((err) => {
        console.error(`[safePlay] ${name}.play() blocked or rejected:`, err.name, err.message);
      });
    }
  } catch (err) {
    console.error(`[safePlay] ${name}.play() threw synchronously:`, err);
  }
}

function isWebGLAvailable() {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

function createContactShadowTexture() {
  if (typeof document === 'undefined') return null;
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 512;
  shadowCanvas.height = 512;
  const ctx = shadowCanvas.getContext('2d');
  if (!ctx) return null;

  const grad = ctx.createRadialGradient(256, 256, 20, 256, 256, 250);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
  grad.addColorStop(0.35, 'rgba(0, 0, 0, 0.55)');
  grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.18)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  return new THREE.CanvasTexture(shadowCanvas);
}

const CAMERA_VIEWPOINTS = [
  { pos: [4.8, 1.9, 5.0], target: [0, 0.75, 0], label: '3/4 FRONT ANGLE' },
  { pos: [0, 1.5, 6.2], target: [0, 0.75, 0], label: 'FRONT HEADLINE' },
  { pos: [-6.4, 1.4, 0], target: [0, 0.75, 0], label: 'SIDE PROFILE' },
  { pos: [-4.8, 1.9, -5.0], target: [0, 0.75, 0], label: 'REAR EXPEDITION' },
  { pos: [0.01, 7.5, 0.01], target: [0, 0.75, 0], label: 'OVERHEAD AERIAL' }
];

export default function StudioConfigurator({
  initialColor = '#ffc000',
  currentColor: propCurrentColor,
  onColorChange,
  selectedPresetId: propSelectedPresetId,
  onSelectPreset,
  forceReducedMotion,
  isActive = true,
  modelUrl = '/models/land_rover_defender.glb'
}) {
  const [internalColor, setInternalColor] = useState(initialColor);
  const [internalPresetId, setInternalPresetId] = useState('giallo-vivo');
  const [is3DReady, setIs3DReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const [cameraAngleIndex, setCameraAngleIndex] = useState(0);

  const colorInputRef = useRef(null);
  const turntableVideoRef = useRef(null);
  const containerRef = useRef(null);
  const stageContainerRef = useRef(null);
  const canvasRef = useRef(null);

  const currentColor = propCurrentColor !== undefined ? propCurrentColor : internalColor;
  const selectedPresetId = propSelectedPresetId !== undefined ? propSelectedPresetId : internalPresetId;

  const systemReducedMotion = useReducedMotion();
  const prefersReducedMotion = forceReducedMotion !== undefined ? forceReducedMotion : systemReducedMotion;

  // Sync state into refs for async 3D loader callbacks
  const currentColorRef = useRef(currentColor);
  const selectedPresetIdRef = useRef(selectedPresetId);
  const prefersReducedMotionRef = useRef(prefersReducedMotion);
  const isActiveRef = useRef(isActive);

  useEffect(() => {
    currentColorRef.current = currentColor;
    selectedPresetIdRef.current = selectedPresetId;
    prefersReducedMotionRef.current = prefersReducedMotion;
    isActiveRef.current = isActive;
  }, [currentColor, selectedPresetId, prefersReducedMotion, isActive]);

  // Three.js internal references
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);
  const paintMaterialsRef = useRef([]);
  const animFrameIdRef = useRef(null);
  const colorAnimIdRef = useRef(null);
  const cameraTransitionAnimIdRef = useRef(null);
  const current3DColorRef = useRef(parseSafeColor(initialColor));

  // Pause background turntable video when tab is inactive to preserve CPU, GPU & battery
  useEffect(() => {
    if (!turntableVideoRef.current) return;
    if (isActive) {
      safePlay(turntableVideoRef.current, 'turntableVideo');
    } else {
      try {
        turntableVideoRef.current.pause();
      } catch {
        // ignore pause errors
      }
    }
  }, [isActive]);

  // Keep auto-rotate in sync with reduced motion and tab active state
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = !prefersReducedMotion && isActive;
    }
  }, [prefersReducedMotion, isActive]);

  // Handle color change with smooth 400ms transition
  useEffect(() => {
    const materials = paintMaterialsRef.current;
    if (!materials || !materials.length) return;

    const targetColor = parseSafeColor(currentColor);
    const spec = DEFENDER_PALETTE.find((s) => s.id === selectedPresetId) || {};
    const targetMetalness = spec.metalness ?? 0.55;
    const targetRoughness = spec.roughness ?? 0.22;

    if (colorAnimIdRef.current) {
      cancelAnimationFrame(colorAnimIdRef.current);
      colorAnimIdRef.current = null;
    }

    if (prefersReducedMotion) {
      materials.forEach((mat) => {
        mat.color.copy(targetColor);
        mat.metalness = targetMetalness;
        mat.roughness = targetRoughness;
        mat.needsUpdate = true;
      });
      current3DColorRef.current.copy(targetColor);
      return;
    }

    const startColor = current3DColorRef.current.clone();
    const startMetalness = materials[0].metalness ?? 0.55;
    const startRoughness = materials[0].roughness ?? 0.22;
    const duration = 400; // 400ms transition
    const startTime = performance.now();

    const animateColor = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Cubic ease out
      const ease = 1 - Math.pow(1 - progress, 3);

      const lerped = new THREE.Color().copy(startColor).lerp(targetColor, ease);
      const lerpedMetalness = startMetalness + (targetMetalness - startMetalness) * ease;
      const lerpedRoughness = startRoughness + (targetRoughness - startRoughness) * ease;

      materials.forEach((mat) => {
        mat.color.copy(lerped);
        mat.metalness = lerpedMetalness;
        mat.roughness = lerpedRoughness;
        mat.needsUpdate = true;
      });

      if (progress < 1) {
        colorAnimIdRef.current = requestAnimationFrame(animateColor);
      } else {
        current3DColorRef.current.copy(targetColor);
        colorAnimIdRef.current = null;
      }
    };

    colorAnimIdRef.current = requestAnimationFrame(animateColor);

    return () => {
      if (colorAnimIdRef.current) {
        cancelAnimationFrame(colorAnimIdRef.current);
        colorAnimIdRef.current = null;
      }
    };
  }, [currentColor, selectedPresetId, prefersReducedMotion]);

  // Initialize Three.js Studio Scene, Lights, Controls, and Model
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isWebGLAvailable()) return;

    const stage = stageContainerRef.current || canvas.parentElement;
    const width = stage ? stage.clientWidth || 800 : 800;
    const height = stage ? stage.clientHeight || 500 : 500;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera: heroic automotive 3/4 front framing
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(4.8, 1.9, 5.0);
    camera.lookAt(0, 0.75, 0);
    cameraRef.current = camera;

    // 3. Renderer with high performance & alpha transparency over turntable video
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
    } catch (err) {
      console.warn('[StudioConfigurator] WebGLRenderer creation fallback:', err);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    // 4. Studio 3-Point Lighting & Overhead Rig
    // Key Light (warm-white main studio key light)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(5, 7, 5);
    scene.add(keyLight);

    // Fill Light (cool-toned fill light for Defender profile definition)
    const fillLight = new THREE.DirectionalLight(0x9fc5e8, 1.4);
    fillLight.position.set(-5, 4, -3);
    scene.add(fillLight);

    // Rim / Kick Light (warm accent light for sharp roofline and rear spare tire)
    const rimLight = new THREE.DirectionalLight(0xfff3db, 2.6);
    rimLight.position.set(0, 6, -6);
    scene.add(rimLight);

    // Top Overhead Light (soft roof specular highlight)
    const topLight = new THREE.DirectionalLight(0xffffff, 1.0);
    topLight.position.set(0, 9, 0);
    scene.add(topLight);

    // Ambient & Hemisphere Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x181824, 0.6);
    scene.add(hemiLight);

    // 5. Studio Turntable Stage Disc & Contact Shadow on Turntable Floor
    const turntableGroup = new THREE.Group();

    // Stage floor disc with dark satin graphite finish
    const stageDiscGeo = new THREE.CylinderGeometry(3.5, 3.6, 0.08, 64);
    const stageDiscMat = new THREE.MeshStandardMaterial({
      color: 0x141618,
      roughness: 0.38,
      metalness: 0.65
    });
    const stageDisc = new THREE.Mesh(stageDiscGeo, stageDiscMat);
    stageDisc.position.y = -0.04;
    stageDisc.receiveShadow = true;
    turntableGroup.add(stageDisc);

    // Outer stage beveled rim ring
    const rimGeo = new THREE.TorusGeometry(3.55, 0.035, 16, 64);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x383e46,
      roughness: 0.25,
      metalness: 0.85
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = 0.002;
    turntableGroup.add(rimMesh);

    // Dark floor perimeter ring
    const floorGeo = new THREE.RingGeometry(3.55, 14, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x070709,
      roughness: 0.85,
      metalness: 0.2
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.041;
    floorMesh.receiveShadow = true;
    turntableGroup.add(floorMesh);

    scene.add(turntableGroup);

    // Contact shadow texture on floor under Defender tires
    const shadowTex = createContactShadowTexture();
    if (shadowTex) {
      const shadowPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(6.6, 4.0),
        new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.88, depthWrite: false })
      );
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.position.y = 0.005;
      scene.add(shadowPlane);
    }

    // 6. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.set(0, 0.75, 0);
    controls.minDistance = 3.0;
    controls.maxDistance = 9.0;
    controls.maxPolarAngle = Math.PI / 2 - 0.04; // Keep camera above turntable floor
    controls.minPolarAngle = 0.1;
    controls.autoRotate = !prefersReducedMotionRef.current && isActiveRef.current;
    controls.autoRotateSpeed = 0.8;
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN
    };

    const handleStart = () => {
      if (cameraTransitionAnimIdRef.current) {
        cancelAnimationFrame(cameraTransitionAnimIdRef.current);
        cameraTransitionAnimIdRef.current = null;
      }
      setIsInteracting(true);
    };
    const handleEnd = () => setIsInteracting(false);
    controls.addEventListener('start', handleStart);
    controls.addEventListener('end', handleEnd);
    controlsRef.current = controls;

    // WebGL Context Loss Recovery
    const handleContextLost = (e) => {
      e.preventDefault();
      console.warn('[StudioConfigurator] WebGL context lost.');
    };
    const handleContextRestored = () => {
      console.log('[StudioConfigurator] WebGL context restored.');
    };
    canvas.addEventListener('webglcontextlost', handleContextLost, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

    // 7. Load 3D Defender GLB Model
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene;

        // Auto-scale and center model so tires sit precisely at Y = 0 on turntable disc
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetScale = 4.4 / maxDim;

        model.scale.setScalar(targetScale);
        model.position.x = -center.x * targetScale;
        model.position.y = -box.min.y * targetScale;
        model.position.z = -center.z * targetScale;

        // Extract and configure car body paint materials
        const paintMats = [];
        const currentSpec = DEFENDER_PALETTE.find((s) => s.id === selectedPresetIdRef.current) || {};
        const initialThreeColor = parseSafeColor(currentColorRef.current);

        model.traverse((child) => {
          if (child.isMesh && child.material) {
            const matName = (child.material.name || '').toLowerCase();
            // bodypaint_A__tinted and fuel cap
            if (matName.includes('bodypaint') || matName.includes('petro_cap')) {
              const m = child.material.clone();
              // Remove baked cyan diffuse texture map so custom hex swatches are pure and vibrant
              m.map = null;
              m.color.copy(initialThreeColor);
              m.metalness = currentSpec.metalness ?? 0.65;
              m.roughness = currentSpec.roughness ?? 0.20;
              m.needsUpdate = true;
              child.material = m;
              paintMats.push(m);
            }
          }
        });

        paintMaterialsRef.current = paintMats;
        current3DColorRef.current.copy(initialThreeColor);
        scene.add(model);
        modelRef.current = model;
        setIs3DReady(true);
        setLoadingProgress(100);
      },
      (xhr) => {
        if (xhr.total && xhr.total > 0) {
          setLoadingProgress(Math.min(99, Math.round((xhr.loaded / xhr.total) * 100)));
        }
      },
      (err) => {
        console.error('[StudioConfigurator] Error loading 3D Defender model:', err);
      }
    );

    // 8. Render & Turntable Loop
    const renderLoop = () => {
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    // 9. Resize Observer
    const handleResize = () => {
      const stage = stageContainerRef.current || canvas.parentElement;
      if (!stage || !cameraRef.current || !rendererRef.current) return;
      const w = stage.clientWidth || 800;
      const h = stage.clientHeight || 500;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined' && stage) {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(stage);
    }
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      if (colorAnimIdRef.current) {
        cancelAnimationFrame(colorAnimIdRef.current);
        colorAnimIdRef.current = null;
      }
      if (cameraTransitionAnimIdRef.current) {
        cancelAnimationFrame(cameraTransitionAnimIdRef.current);
        cameraTransitionAnimIdRef.current = null;
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);

      if (controlsRef.current) {
        controlsRef.current.removeEventListener('start', handleStart);
        controlsRef.current.removeEventListener('end', handleEnd);
        controlsRef.current.dispose();
        controlsRef.current = null;
      }

      if (modelRef.current) {
        scene.remove(modelRef.current);
        modelRef.current.traverse((child) => {
          if (child.isMesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((m) => m.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
        modelRef.current = null;
      }

      paintMaterialsRef.current = [];

      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
    };
  }, [modelUrl]);

  // Pause render loop when inactive to conserve resources
  useEffect(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    if (isActive) {
      if (!animFrameIdRef.current) {
        const renderLoop = () => {
          if (controlsRef.current) controlsRef.current.update();
          if (rendererRef.current && sceneRef.current && cameraRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
          }
          animFrameIdRef.current = requestAnimationFrame(renderLoop);
        };
        animFrameIdRef.current = requestAnimationFrame(renderLoop);
      }
    } else {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    }
  }, [isActive]);

  const handleSelectPreset = (swatch) => {
    if (onSelectPreset) {
      onSelectPreset(swatch);
    } else {
      setInternalPresetId(swatch.id);
      setInternalColor(swatch.hex);
    }
  };

  const handleCustomHexChange = (e) => {
    const hex = e.target.value;
    if (onColorChange) {
      onColorChange(hex);
    } else {
      setInternalColor(hex);
      setInternalPresetId('custom');
    }
  };

  const transitionCameraTo = useCallback((destPos, destTarget) => {
    if (!cameraRef.current || !controlsRef.current) return;

    if (cameraTransitionAnimIdRef.current) {
      cancelAnimationFrame(cameraTransitionAnimIdRef.current);
      cameraTransitionAnimIdRef.current = null;
    }

    if (prefersReducedMotionRef.current) {
      cameraRef.current.position.set(destPos[0], destPos[1], destPos[2]);
      controlsRef.current.target.set(destTarget[0], destTarget[1], destTarget[2]);
      controlsRef.current.update();
      return;
    }

    const startPos = cameraRef.current.position.clone();
    const endPos = new THREE.Vector3(destPos[0], destPos[1], destPos[2]);
    const startTarget = controlsRef.current.target.clone();
    const endTarget = new THREE.Vector3(destTarget[0], destTarget[1], destTarget[2]);

    const duration = 500;
    const startTime = performance.now();

    const animateCamera = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Cubic ease out
      const ease = 1 - Math.pow(1 - progress, 3);

      cameraRef.current.position.lerpVectors(startPos, endPos, ease);
      controlsRef.current.target.lerpVectors(startTarget, endTarget, ease);
      controlsRef.current.update();

      if (progress < 1) {
        cameraTransitionAnimIdRef.current = requestAnimationFrame(animateCamera);
      } else {
        cameraRef.current.position.copy(endPos);
        controlsRef.current.target.copy(endTarget);
        controlsRef.current.update();
        cameraTransitionAnimIdRef.current = null;
      }
    };

    cameraTransitionAnimIdRef.current = requestAnimationFrame(animateCamera);
  }, []);

  const handleCycleCameraView = useCallback(() => {
    const nextIndex = (cameraAngleIndex + 1) % CAMERA_VIEWPOINTS.length;
    setCameraAngleIndex(nextIndex);
    const v = CAMERA_VIEWPOINTS[nextIndex];
    transitionCameraTo(v.pos, v.target);
  }, [cameraAngleIndex, transitionCameraTo]);

  const handleResetCamera = useCallback(() => {
    setCameraAngleIndex(0);
    const v = CAMERA_VIEWPOINTS[0];
    transitionCameraTo(v.pos, v.target);
  }, [transitionCameraTo]);

  const currentSwatchInfo = DEFENDER_PALETTE.find((s) => s.id === selectedPresetId) || {
    id: 'custom',
    name: 'BESPOKE SVO COLOR',
    hex: currentColor,
    badge: 'SPECIAL VEHICLE OPERATIONS BESPOKE SPEC'
  };

  return (
    <div
      ref={containerRef}
      className="studio-configurator-wrap"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#0c0c0c',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        touchAction: 'none'
      }}
    >
      {/* Studio Turntable Stage Visual Canvas */}
      <div
        ref={stageContainerRef}
        className="studio-turntable-stage"
        style={{
          position: 'relative',
          width: '100%',
          flex: 1,
          minHeight: '380px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Layer 1: studio-turntable background loop video / poster (Active before 3D loads & as JSDOM fallback) */}
        <div
          className="studio-turntable-base-layer"
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            zIndex: 1,
            opacity: is3DReady ? 0 : 1,
            transition: 'opacity 0.6s ease'
          }}
        >
          {prefersReducedMotion ? (
            <img
              src="/videos/studio-turntable-poster.jpg"
              alt="Defender Solihull Studio Turntable"
              className="studio-turntable-poster"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <video
              ref={(el) => {
                turntableVideoRef.current = el;
                if (el) {
                  el.muted = true;
                  el.defaultMuted = true;
                  el.playsInline = true;
                }
              }}
              className="studio-turntable-video"
              autoPlay={isActive}
              muted
              loop
              playsInline
              preload="metadata"
              poster="/videos/studio-turntable-poster.jpg"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            >
              <source src="/videos/studio-turntable.webm" type="video/webm" />
              <source src="/videos/studio-turntable.mp4" type="video/mp4" />
            </video>
          )}

          {/* Color-swatch tint overlay on turntable background for ambient lighting reflection */}
          <div
            className="studio-swatch-tint-overlay"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: currentColor,
              mixBlendMode: 'color',
              opacity: 0.06,
              pointerEvents: 'none',
              transition: 'background-color 400ms cubic-bezier(0.16, 1, 0.3, 1), opacity 400ms ease'
            }}
          />
        </div>

        {/* Layer 2: ORIGINAL 2D Studio Photography Asset Centered on Turntable (Preserved Fallback & Visual Reference) */}
        <div
          className="studio-vehicle-stage"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            opacity: is3DReady ? 0 : 1,
            pointerEvents: 'none',
            transition: 'opacity 0.5s ease'
          }}
        >
          <div
            className="studio-2d-vehicle-wrapper"
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            {/* High-res 2D Studio Defender Photograph */}
            <img
              src="/images/defender-90-studio.jpg"
              alt="Defender Solihull Studio 2D Spec"
              className="studio-vehicle-photo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                pointerEvents: 'none',
                userSelect: 'none',
                filter: 'contrast(1.05) brightness(1.02)'
              }}
            />

            {/* Body Panel Color Overlay with smooth ~400ms transition */}
            <div
              className="studio-vehicle-body-tint"
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: currentColor,
                mixBlendMode: 'color',
                opacity: selectedPresetId === 'carpathian-grey' ? 0.35 : selectedPresetId === 'fuji-white' ? 0.40 : 0.88,
                pointerEvents: 'none',
                transition: 'background-color 400ms cubic-bezier(0.16, 1, 0.3, 1), opacity 400ms ease',
                maskImage: 'url(/images/defender-body-mask.png)',
                WebkitMaskImage: 'url(/images/defender-body-mask.png)',
                maskSize: 'cover',
                WebkitMaskSize: 'cover',
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat'
              }}
            />

            {/* Specular highlights & reflections layer for metallic/satin paint depth */}
            <div
              className="studio-vehicle-specular-accent"
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: currentColor,
                mixBlendMode: 'soft-light',
                opacity: selectedPresetId === 'fuji-white' ? 0.65 : 0.45,
                pointerEvents: 'none',
                transition: 'background-color 400ms cubic-bezier(0.16, 1, 0.3, 1), opacity 400ms ease',
                maskImage: 'url(/images/defender-body-mask.png)',
                WebkitMaskImage: 'url(/images/defender-body-mask.png)',
                maskSize: 'cover',
                WebkitMaskSize: 'cover',
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat'
              }}
            />
          </div>
        </div>

        {/* Layer 3: Interactive Three.js 3D WebGL Canvas */}
        <canvas
          ref={canvasRef}
          className="studio-3d-canvas"
          data-testid="studio-3d-canvas"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            zIndex: 4,
            cursor: isInteracting ? 'grabbing' : 'grab',
            touchAction: 'none'
          }}
          aria-label="Interactive 3D Land Rover Defender Canvas with OrbitControls"
        />

        {/* 3D Model Loading HUD Badge */}
        {!is3DReady && loadingProgress > 0 && loadingProgress < 100 && (
          <div
            className="studio-3d-loading-hud"
            style={{
              position: 'absolute',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 15,
              backgroundColor: 'rgba(12, 12, 12, 0.92)',
              border: '1px solid var(--color-graphite-border)',
              padding: '10px 18px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              pointerEvents: 'none'
            }}
          >
            <div style={{ fontSize: '10px', color: 'var(--color-pearl-white)', letterSpacing: '0.04em' }}>
              INITIALIZING 3D DEFENDER · {loadingProgress}%
            </div>
            <div style={{ width: '140px', height: '2px', backgroundColor: '#222222', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${loadingProgress}%`,
                  height: '100%',
                  backgroundColor: 'var(--color-giallo-vivo)',
                  transition: 'width 200ms ease'
                }}
              />
            </div>
          </div>
        )}

        {/* Studio Top Paintwork Telemetry HUD Badge */}
        <div
          style={{
            position: 'absolute',
            top: '24px',
            left: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            zIndex: 15,
            pointerEvents: 'none'
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(20, 20, 20, 0.88)',
              border: '1px solid var(--color-graphite-border)',
              padding: '8px 14px',
              fontSize: '11px',
              color: 'var(--color-pearl-white)',
              letterSpacing: '0.0230em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span
              style={{
                width: '10px',
                height: '10px',
                backgroundColor: currentColor,
                border: '1px solid rgba(255, 255, 255, 0.4)',
                transition: 'background-color 400ms ease'
              }}
            />
            <span>{currentSwatchInfo.name}</span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-steel-mid)', letterSpacing: '0.04em' }}>
            {currentSwatchInfo.badge}
          </div>
        </div>

        {/* 2D Studio Photography & 3D Interactive Badge */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 15
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              border: '1px solid var(--color-graphite-border)',
              padding: '6px 12px',
              fontSize: '10px',
              color: 'var(--color-steel-mid)',
              letterSpacing: '0.03em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={11} color="var(--color-giallo-vivo)" />
            <span>
              {is3DReady
                ? 'SOLIHULL STUDIO SPECIFICATION · 3D REAL-TIME CONFIGURATOR'
                : 'SOLIHULL STUDIO SPECIFICATION · 2D BESPOKE COLOR CONFIGURATOR'}
            </span>
          </div>

          {/* 3D Orbit & Camera Switcher Controls */}
          {is3DReady && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={handleCycleCameraView}
                className="btn-outlined spec-chip-tactile"
                title="Cycle Camera Viewpoints"
                aria-label="Cycle 3D camera angles"
                style={{
                  padding: '6px 10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '10px',
                  color: 'var(--color-pearl-white)',
                  backgroundColor: 'rgba(20, 20, 20, 0.85)',
                  cursor: 'pointer'
                }}
              >
                <Compass size={11} color="var(--color-giallo-vivo)" />
                <span>VIEW ANGLE</span>
              </button>

              <button
                onClick={handleResetCamera}
                className="btn-outlined spec-chip-tactile"
                title="Reset Camera to Front 3/4 Stance"
                aria-label="Reset 3D camera to default angle"
                style={{
                  padding: '6px 10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '10px',
                  color: 'var(--color-steel-mid)',
                  backgroundColor: 'rgba(20, 20, 20, 0.85)',
                  cursor: 'pointer'
                }}
              >
                <RotateCw size={11} />
                <span>RESET</span>
              </button>
            </div>
          )}
        </div>

        {/* 3D Orbit Interaction Guide Pill */}
        {is3DReady && (
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              right: '20px',
              backgroundColor: 'rgba(0, 0, 0, 0.70)',
              border: '1px solid var(--color-graphite-border)',
              padding: '5px 10px',
              fontSize: '10px',
              color: 'var(--color-steel-mid)',
              letterSpacing: '0.03em',
              zIndex: 15,
              pointerEvents: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>DRAG TO ORBIT · SCROLL TO ZOOM</span>
          </div>
        )}
      </div>

      {/* Bottom Color Swatch Rail & Custom Hex Selector */}
      <div
        className="studio-configurator-toolbar"
        style={{
          padding: '16px 24px',
          backgroundColor: 'var(--color-carbon-deep)',
          borderTop: '1px solid var(--color-graphite-border)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          zIndex: 10
        }}
      >
        {/* Left: Swatch Rail Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Palette size={15} color="var(--color-giallo-vivo)" />
          <span style={{ fontSize: '11px', color: 'var(--color-steel-mid)', letterSpacing: '0.04em' }}>
            SVO BESPOKE PAINTWORK:
          </span>
        </div>

        {/* Center: Swatch Color Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {DEFENDER_PALETTE.map((swatch) => {
            const isSelected = selectedPresetId === swatch.id;
            return (
              <button
                key={swatch.id}
                onClick={() => handleSelectPreset(swatch)}
                className="btn-outlined spec-chip-tactile"
                aria-label={`Select ${swatch.name}`}
                style={{
                  padding: '6px 12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                  borderColor: isSelected ? 'var(--color-pearl-white)' : 'var(--color-graphite-border)',
                  color: isSelected ? 'var(--color-pearl-white)' : 'var(--color-steel-mid)',
                  cursor: 'pointer'
                }}
              >
                <span
                  style={{
                    width: '14px',
                    height: '14px',
                    backgroundColor: swatch.hex,
                    display: 'inline-block',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: isSelected ? `0 0 10px ${swatch.hex}` : 'none'
                  }}
                />
                <span style={{ fontSize: '11px' }}>{swatch.name}</span>
                {isSelected && <Check size={11} color="var(--color-giallo-vivo)" />}
              </button>
            );
          })}
        </div>

        {/* Right: Custom Hex Color Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => colorInputRef.current?.click()}
            className="btn-outlined spec-chip-tactile"
            style={{
              padding: '6px 12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              borderColor: selectedPresetId === 'custom' ? 'var(--color-pearl-white)' : 'var(--color-graphite-border)',
              backgroundColor: selectedPresetId === 'custom' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              color: 'var(--color-pearl-white)',
              cursor: 'pointer'
            }}
          >
            <Sliders size={12} color="var(--color-giallo-vivo)" />
            <span style={{ fontSize: '11px' }}>CUSTOM HEX: {currentColor.toUpperCase()}</span>
          </button>

          <input
            ref={colorInputRef}
            type="color"
            value={currentColor}
            onChange={handleCustomHexChange}
            style={{
              width: '28px',
              height: '28px',
              padding: 0,
              border: '1px solid var(--color-graphite-border)',
              backgroundColor: 'transparent',
              cursor: 'pointer'
            }}
            title="Choose custom hex color"
            aria-label="Choose custom paint color"
          />
        </div>
      </div>
    </div>
  );
}