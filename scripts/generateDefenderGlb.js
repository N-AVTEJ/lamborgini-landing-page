import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Node.js FileReader polyfill for GLTFExporter binary chunk packaging
class NodeFileReader {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = buf;
      if (this.onload) this.onload({ target: this });
      if (this.onloadend) this.onloadend({ target: this });
    });
  }
  readAsDataURL(blob) {
    blob.arrayBuffer().then((buf) => {
      const b64 = Buffer.from(buf).toString('base64');
      this.result = `data:${blob.type || 'application/octet-stream'};base64,${b64}`;
      if (this.onload) this.onload({ target: this });
      if (this.onloadend) this.onloadend({ target: this });
    });
  }
}
globalThis.FileReader = NodeFileReader;

export function buildDefenderModel() {
  const root = new THREE.Group();
  root.name = 'LandRoverDefender';

  // Materials
  const bodyMaterial = new THREE.MeshStandardMaterial({
    name: 'Defender_Body',
    color: 0xffc000, // Giallo Vivo initial default
    metalness: 0.35,
    roughness: 0.22,
    envMapIntensity: 1.2
  });

  const roofMaterial = new THREE.MeshStandardMaterial({
    name: 'Defender_Roof',
    color: 0x141414, // Narvik Black contrast roof
    metalness: 0.5,
    roughness: 0.25
  });

  const trimMaterial = new THREE.MeshStandardMaterial({
    name: 'Defender_Trim',
    color: 0x1c1c1c, // Anthracite matte / satin rugged cladding
    metalness: 0.2,
    roughness: 0.65
  });

  const darkMetalMaterial = new THREE.MeshStandardMaterial({
    name: 'Defender_DarkMetal',
    color: 0x333333,
    metalness: 0.8,
    roughness: 0.35
  });

  const silverMetalMaterial = new THREE.MeshStandardMaterial({
    name: 'Defender_SilverMetal',
    color: 0xd8d8d8,
    metalness: 0.9,
    roughness: 0.2
  });

  const glassMaterial = new THREE.MeshStandardMaterial({
    name: 'Defender_Glass',
    color: 0x11161d,
    metalness: 0.95,
    roughness: 0.05,
    transparent: true,
    opacity: 0.72
  });

  const tireMaterial = new THREE.MeshStandardMaterial({
    name: 'Defender_Tire',
    color: 0x151515,
    metalness: 0.05,
    roughness: 0.85
  });

  const wheelRimMaterial = new THREE.MeshStandardMaterial({
    name: 'Defender_Rim',
    color: 0x242424,
    metalness: 0.75,
    roughness: 0.28
  });

  const brakeCaliperMaterial = new THREE.MeshStandardMaterial({
    name: 'Defender_Caliper',
    color: 0xffb700,
    metalness: 0.6,
    roughness: 0.3
  });

  const headlightMaterial = new THREE.MeshStandardMaterial({
    name: 'Defender_Headlight',
    color: 0xffffff,
    emissive: 0xecf6ff,
    emissiveIntensity: 0.85,
    roughness: 0.1
  });

  const taillightMaterial = new THREE.MeshStandardMaterial({
    name: 'Defender_Taillight',
    color: 0xcc0505,
    emissive: 0xff1515,
    emissiveIntensity: 0.9,
    roughness: 0.2
  });

  const interiorMaterial = new THREE.MeshStandardMaterial({
    name: 'Defender_Interior',
    color: 0x1a1a1a,
    metalness: 0.2,
    roughness: 0.7
  });

  // --- 1. LOWER & MAIN BODY TUB ---
  const bodyGroup = new THREE.Group();
  bodyGroup.name = 'BodyStructure';
  root.add(bodyGroup);

  // Main chassis belly / tub
  const tubGeo = new THREE.BoxGeometry(1.84, 0.44, 4.3);
  const tub = new THREE.Mesh(tubGeo, bodyMaterial);
  tub.position.set(0, 0.62, 0);
  tub.castShadow = true;
  tub.receiveShadow = true;
  bodyGroup.add(tub);

  // Mid waistline body (doors & quarter panels)
  const waistGeo = new THREE.BoxGeometry(1.82, 0.42, 4.22);
  const waist = new THREE.Mesh(waistGeo, bodyMaterial);
  waist.position.set(0, 0.98, -0.04);
  waist.castShadow = true;
  bodyGroup.add(waist);

  // Hood (Bonnet) with muscular forward taper and power bulge
  const hoodBaseGeo = new THREE.BoxGeometry(1.76, 0.16, 1.35);
  const hoodBase = new THREE.Mesh(hoodBaseGeo, bodyMaterial);
  hoodBase.position.set(0, 1.15, 1.36);
  bodyGroup.add(hoodBase);

  // Hood Power Bulge (center raised section)
  const bulgeGeo = new THREE.BoxGeometry(1.0, 0.08, 1.25);
  const bulge = new THREE.Mesh(bulgeGeo, bodyMaterial);
  bulge.position.set(0, 1.24, 1.36);
  bodyGroup.add(bulge);

  // Chequer / tread plates on hood shoulders (signature Defender detail)
  const chequerL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.02, 0.8), darkMetalMaterial);
  chequerL.position.set(-0.68, 1.24, 1.4);
  const chequerR = chequerL.clone();
  chequerR.position.x = 0.68;
  bodyGroup.add(chequerL);
  bodyGroup.add(chequerR);

  // DEFENDER Hood Lettering Plaque
  const hoodPlaque = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.02, 0.06), darkMetalMaterial);
  hoodPlaque.position.set(0, 1.24, 2.0);
  bodyGroup.add(hoodPlaque);

  // --- 2. CABIN GREENHOUSE, ROOF & PILLARS ---
  const cabinGroup = new THREE.Group();
  cabinGroup.name = 'Greenhouse';
  root.add(cabinGroup);

  // Cabin interior volume
  const cabinShellGeo = new THREE.BoxGeometry(1.68, 0.72, 2.7);
  const cabinShell = new THREE.Mesh(cabinShellGeo, interiorMaterial);
  cabinShell.position.set(0, 1.48, -0.65);
  cabinGroup.add(cabinShell);

  // Contrast Floating Roof Panel
  const roofGeo = new THREE.BoxGeometry(1.72, 0.1, 2.85);
  const roof = new THREE.Mesh(roofGeo, roofMaterial);
  roof.position.set(0, 1.86, -0.66);
  cabinGroup.add(roof);

  // Rugged Roof Rails (left & right)
  const railGeo = new THREE.BoxGeometry(0.06, 0.06, 2.6);
  const railL = new THREE.Mesh(railGeo, darkMetalMaterial);
  railL.position.set(-0.76, 1.92, -0.66);
  const railR = railL.clone();
  railR.position.x = 0.76;
  cabinGroup.add(railL);
  cabinGroup.add(railR);

  // Signature Alpine / Safari Roof Windows (angled edge lights)
  const alpineGeo = new THREE.BoxGeometry(0.12, 0.06, 0.65);
  const alpineL = new THREE.Mesh(alpineGeo, glassMaterial);
  alpineL.position.set(-0.78, 1.84, -0.9);
  alpineL.rotation.z = Math.PI / 6;
  const alpineR = alpineL.clone();
  alpineR.position.x = 0.78;
  alpineR.rotation.z = -Math.PI / 6;
  cabinGroup.add(alpineL);
  cabinGroup.add(alpineR);

  // Glass: Windshield (angled forward)
  const windshieldGeo = new THREE.BoxGeometry(1.6, 0.62, 0.08);
  const windshield = new THREE.Mesh(windshieldGeo, glassMaterial);
  windshield.position.set(0, 1.48, 0.75);
  windshield.rotation.x = -Math.PI / 7.2;
  cabinGroup.add(windshield);

  // Glass: Side Windows (Flush luxury glass planes)
  const sideWindowGeo = new THREE.BoxGeometry(0.06, 0.52, 2.5);
  const sideWindowL = new THREE.Mesh(sideWindowGeo, glassMaterial);
  sideWindowL.position.set(-0.84, 1.5, -0.65);
  const sideWindowR = sideWindowL.clone();
  sideWindowR.position.x = 0.84;
  cabinGroup.add(sideWindowL);
  cabinGroup.add(sideWindowR);

  // Glass: Rear Tailgate Window
  const rearGlassGeo = new THREE.BoxGeometry(1.5, 0.52, 0.06);
  const rearGlass = new THREE.Mesh(rearGlassGeo, glassMaterial);
  rearGlass.position.set(0, 1.5, -2.01);
  cabinGroup.add(rearGlass);

  // Interior: Dashboard & Steering wheel silhouette visible through glass
  const dashGeo = new THREE.BoxGeometry(1.5, 0.16, 0.4);
  const dash = new THREE.Mesh(dashGeo, interiorMaterial);
  dash.position.set(0, 1.25, 0.5);
  cabinGroup.add(dash);

  const steeringWheel = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.025, 12, 24), darkMetalMaterial);
  steeringWheel.position.set(0.42, 1.34, 0.38);
  steeringWheel.rotation.x = Math.PI / 5;
  cabinGroup.add(steeringWheel);

  // Center console / screen
  const screenMesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.16, 0.04), headlightMaterial);
  screenMesh.position.set(0, 1.28, 0.44);
  cabinGroup.add(screenMesh);

  // --- 3. FRONT FASCIA, GRILLE & LIGHTS ---
  const frontGroup = new THREE.Group();
  frontGroup.name = 'FrontFascia';
  root.add(frontGroup);

  // Main Front Grille Block
  const grilleGeo = new THREE.BoxGeometry(1.76, 0.34, 0.18);
  const grille = new THREE.Mesh(grilleGeo, trimMaterial);
  grille.position.set(0, 0.98, 2.12);
  frontGroup.add(grille);

  // Horizontal Grille Bar (body colored or trim)
  const grilleBarGeo = new THREE.BoxGeometry(1.1, 0.08, 0.06);
  const grilleBar = new THREE.Mesh(grilleBarGeo, bodyMaterial);
  grilleBar.position.set(0, 1.0, 2.22);
  frontGroup.add(grilleBar);

  // Iconic Round LED Headlights with Outer Bezels
  const headlightBezelGeo = new THREE.BoxGeometry(0.28, 0.28, 0.06);
  const headlightLampGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.08, 24);
  headlightLampGeo.rotateX(Math.PI / 2);

  // Left Headlight
  const hBezelL = new THREE.Mesh(headlightBezelGeo, darkMetalMaterial);
  hBezelL.position.set(-0.66, 0.98, 2.2);
  const hLampL = new THREE.Mesh(headlightLampGeo, headlightMaterial);
  hLampL.position.set(-0.66, 0.98, 2.22);
  frontGroup.add(hBezelL);
  frontGroup.add(hLampL);

  // Right Headlight
  const hBezelR = hBezelL.clone();
  hBezelR.position.x = 0.66;
  const hLampR = hLampL.clone();
  hLampR.position.x = 0.66;
  frontGroup.add(hBezelR);
  frontGroup.add(hLampR);

  // Front Heavy-duty Bumper & Skid Plate
  const fdBumperGeo = new THREE.BoxGeometry(1.9, 0.32, 0.24);
  const fdBumper = new THREE.Mesh(fdBumperGeo, trimMaterial);
  fdBumper.position.set(0, 0.58, 2.15);
  frontGroup.add(fdBumper);

  // Satin Aluminum Skid Bash Plate with angled underbody plate
  const skidPlateGeo = new THREE.BoxGeometry(1.0, 0.24, 0.35);
  const skidPlate = new THREE.Mesh(skidPlateGeo, silverMetalMaterial);
  skidPlate.position.set(0, 0.44, 2.1);
  skidPlate.rotation.x = Math.PI / 10;
  frontGroup.add(skidPlate);

  // Dual yellow/gold recovery tow loops
  const towL = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.018, 8, 16), brakeCaliperMaterial);
  towL.position.set(-0.35, 0.44, 2.28);
  const towR = towL.clone();
  towR.position.x = 0.35;
  frontGroup.add(towL);
  frontGroup.add(towR);

  // --- 4. FLARED WHEEL ARCHES (OCTA WIDEBODY) ---
  const archesGroup = new THREE.Group();
  archesGroup.name = 'WidebodyArches';
  root.add(archesGroup);

  const archGeo = new THREE.BoxGeometry(0.2, 0.36, 0.95);

  const archFL = new THREE.Mesh(archGeo, trimMaterial);
  archFL.position.set(-0.95, 0.68, 1.35);
  const archFR = archFL.clone();
  archFR.position.x = 0.95;

  const archRL = archFL.clone();
  archRL.position.set(-0.95, 0.68, -1.35);
  const archRR = archRL.clone();
  archRR.position.x = 0.95;

  archesGroup.add(archFL);
  archesGroup.add(archFR);
  archesGroup.add(archRL);
  archesGroup.add(archRR);

  // Side Rocker Runner Steps
  const stepGeo = new THREE.BoxGeometry(0.12, 0.08, 1.7);
  const stepL = new THREE.Mesh(stepGeo, darkMetalMaterial);
  stepL.position.set(-0.95, 0.45, 0);
  const stepR = stepL.clone();
  stepR.position.x = 0.95;
  archesGroup.add(stepL);
  archesGroup.add(stepR);

  // Side Mirrors
  const mirrorArmGeo = new THREE.BoxGeometry(0.14, 0.04, 0.06);
  const mirrorHeadGeo = new THREE.BoxGeometry(0.1, 0.14, 0.22);

  const mirrorLGroup = new THREE.Group();
  mirrorLGroup.position.set(-0.95, 1.25, 0.7);
  const armL = new THREE.Mesh(mirrorArmGeo, trimMaterial);
  const headL = new THREE.Mesh(mirrorHeadGeo, roofMaterial);
  headL.position.x = -0.09;
  mirrorLGroup.add(armL);
  mirrorLGroup.add(headL);

  const mirrorRGroup = new THREE.Group();
  mirrorRGroup.position.set(0.95, 1.25, 0.7);
  const armR = new THREE.Mesh(mirrorArmGeo, trimMaterial);
  const headR = new THREE.Mesh(mirrorHeadGeo, roofMaterial);
  headR.position.x = 0.09;
  mirrorRGroup.add(armR);
  mirrorRGroup.add(headR);

  root.add(mirrorLGroup);
  root.add(mirrorRGroup);

  // --- 5. REAR FASCIA, VERTICAL TAILLIGHTS, EXHAUST & SPARE TIRE ---
  const rearGroup = new THREE.Group();
  rearGroup.name = 'RearFascia';
  root.add(rearGroup);

  // Rear Flat Tailgate
  const tailgateGeo = new THREE.BoxGeometry(1.8, 0.8, 0.12);
  const tailgate = new THREE.Mesh(tailgateGeo, bodyMaterial);
  tailgate.position.set(0, 0.88, -2.12);
  rearGroup.add(tailgate);

  // Iconic Vertical Stacked Taillights (Dual rounded blocks on each side)
  const lampBlockGeo = new THREE.BoxGeometry(0.1, 0.22, 0.05);

  const tLightL1 = new THREE.Mesh(lampBlockGeo, taillightMaterial);
  tLightL1.position.set(-0.84, 1.15, -2.18);
  const tLightL2 = new THREE.Mesh(lampBlockGeo, taillightMaterial);
  tLightL2.position.set(-0.84, 0.86, -2.18);

  const tLightR1 = tLightL1.clone();
  tLightR1.position.x = 0.84;
  const tLightR2 = tLightL2.clone();
  tLightR2.position.x = 0.84;

  rearGroup.add(tLightL1);
  rearGroup.add(tLightL2);
  rearGroup.add(tLightR1);
  rearGroup.add(tLightR2);

  // Rear Bumper
  const rBumperGeo = new THREE.BoxGeometry(1.9, 0.32, 0.22);
  const rBumper = new THREE.Mesh(rBumperGeo, trimMaterial);
  rBumper.position.set(0, 0.54, -2.15);
  rearGroup.add(rBumper);

  // Quad Exhaust Tips (Defender OCTA 635PS dual twin pipes)
  const pipeGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.14, 16);
  pipeGeo.rotateX(Math.PI / 2);

  const pipeL1 = new THREE.Mesh(pipeGeo, darkMetalMaterial);
  pipeL1.position.set(-0.62, 0.44, -2.26);
  const pipeL2 = new THREE.Mesh(pipeGeo, darkMetalMaterial);
  pipeL2.position.set(-0.5, 0.44, -2.26);

  const pipeR1 = new THREE.Mesh(pipeGeo, darkMetalMaterial);
  pipeR1.position.set(0.5, 0.44, -2.26);
  const pipeR2 = new THREE.Mesh(pipeGeo, darkMetalMaterial);
  pipeR2.position.set(0.62, 0.44, -2.26);

  rearGroup.add(pipeL1);
  rearGroup.add(pipeL2);
  rearGroup.add(pipeR1);
  rearGroup.add(pipeR2);

  // Full-size Rear Tailgate Mounted Spare Wheel
  const spareGroup = new THREE.Group();
  spareGroup.name = 'TailgateSpareWheel';
  spareGroup.position.set(0.18, 1.1, -2.32);

  const spareTireGeo = new THREE.TorusGeometry(0.36, 0.14, 16, 32);
  const spareTire = new THREE.Mesh(spareTireGeo, tireMaterial);
  spareGroup.add(spareTire);

  const spareRimGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.12, 24);
  spareRimGeo.rotateX(Math.PI / 2);
  const spareRim = new THREE.Mesh(spareRimGeo, wheelRimMaterial);
  spareGroup.add(spareRim);

  const spareCoverGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.14, 24);
  spareCoverGeo.rotateX(Math.PI / 2);
  const spareCover = new THREE.Mesh(spareCoverGeo, bodyMaterial);
  spareCover.position.z = -0.02;
  spareGroup.add(spareCover);

  rearGroup.add(spareGroup);

  // --- 6. 4 ALL-TERRAIN RUNNING WHEELS & BRAKES ---
  const wheelsGroup = new THREE.Group();
  wheelsGroup.name = 'RoadWheels';
  root.add(wheelsGroup);

  function createWheelAssembly(isLeft) {
    const wGroup = new THREE.Group();

    // Tire with rugged chunky profile
    const tire = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.16, 18, 36), tireMaterial);
    tire.rotation.y = Math.PI / 2;
    tire.castShadow = true;
    wGroup.add(tire);

    // Rim Outer Wheel
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.26, 24), wheelRimMaterial);
    rim.rotation.z = Math.PI / 2;
    wGroup.add(rim);

    // 5-Spoke Star Face
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.24, 0.05), silverMetalMaterial);
      spoke.position.set(isLeft ? -0.12 : 0.12, Math.sin(angle) * 0.14, Math.cos(angle) * 0.14);
      spoke.rotation.x = -angle;
      wGroup.add(spoke);
    }

    // Center Cap with Land Rover green accent badge
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.28, 16), darkMetalMaterial);
    cap.rotation.z = Math.PI / 2;
    wGroup.add(cap);

    // Brake Rotor & Golden Caliper
    const rotor = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.04, 24), silverMetalMaterial);
    rotor.rotation.z = Math.PI / 2;
    rotor.position.x = isLeft ? 0.06 : -0.06;
    wGroup.add(rotor);

    const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.08), brakeCaliperMaterial);
    caliper.position.set(isLeft ? 0.06 : -0.06, 0.12, 0.08);
    wGroup.add(caliper);

    return wGroup;
  }

  // Wheel positions (OCTA track width 1.9m, wheelbase 2.8m, tire radius ~0.42m)
  const wheelY = 0.42;
  const wheelX = 0.94;
  const wheelZ = 1.35;

  const wFL = createWheelAssembly(true);
  wFL.position.set(-wheelX, wheelY, wheelZ);

  const wFR = createWheelAssembly(false);
  wFR.position.set(wheelX, wheelY, wheelZ);

  const wRL = createWheelAssembly(true);
  wRL.position.set(-wheelX, wheelY, -wheelZ);

  const wRR = createWheelAssembly(false);
  wRR.position.set(wheelX, wheelY, -wheelZ);

  wheelsGroup.add(wFL);
  wheelsGroup.add(wFR);
  wheelsGroup.add(wRL);
  wheelsGroup.add(wRR);

  return root;
}

export async function exportDefenderGlb(outputPath) {
  const model = buildDefenderModel();
  const scene = new THREE.Scene();
  scene.add(model);

  const exporter = new GLTFExporter();
  const glbBuffer = await exporter.parseAsync(scene, {
    binary: true,
    embedImages: true
  });

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, Buffer.from(glbBuffer));
  console.log(`Defender 3D GLB successfully generated at: ${outputPath} (${(glbBuffer.byteLength / 1024).toFixed(1)} KB)`);
  return outputPath;
}

// When executed directly via node
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const targetPath = path.resolve(__dirname, '../public/models/defender.glb');
  exportDefenderGlb(targetPath)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
