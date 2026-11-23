import * as THREE from 'three';
import { websocketService } from './websocketService';
import { useClassroomStore } from '../store/classroomStore';

class BlackboardService {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 2048;
    this.canvas.height = 1024;
    this.ctx = this.canvas.getContext('2d');

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.generateMipmaps = true;
    this.texture.minFilter = THREE.LinearMipmapLinearFilter;

    this.listeners = new Set();
    this.history = [];

    // Initialize with default heart anatomy chalkboard content
    this.loadHeartAnatomyStage(1);

    // Subscribe to incoming websocket drawing events
    websocketService.on('blackboard.draw', (event) => {
      if (event.payload?.stroke) {
        this.renderStrokeLocally(event.payload.stroke);
      }
    });

    websocketService.on('blackboard.clear', () => {
      this.clearBoardLocally();
    });
  }

  getTexture() {
    return this.texture;
  }

  onChange(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    this.texture.needsUpdate = true;
    for (const cb of this.listeners) {
      cb();
    }
  }

  clearBoardLocally() {
    // Dark green chalkboard base
    this.ctx.fillStyle = '#183a26';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Subtle natural chalk dust
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let i = 0; i < 300; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      const r = Math.random() * 60 + 10;
      this.ctx.beginPath();
      this.ctx.arc(x, y, r, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.history = [];
    this.notify();
  }

  // Backward compatibility alias
  loadPhotosynthesisStage(stage = 1) {
    this.loadHeartAnatomyStage(stage);
  }

  // 2-Minute Anatomy of the Human Heart Lecture Stages on Blackboard
  loadHeartAnatomyStage(stage = 1) {
    this.clearBoardLocally();
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Chalk Header
    ctx.fillStyle = '#f43f5e'; // Crimson chalk header
    ctx.font = 'bold 48px "Fredoka", "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🫀 HUMAN CARDIOLOGY & CIRCULATORY SYSTEM (5-MIN LECTURE)', w / 2, 85);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(80, 115);
    ctx.lineTo(w - 80, 115);
    ctx.stroke();

    if (stage === 1) {
      // Stage 1 / Point 1: What is the Circulatory System?
      ctx.textAlign = 'left';
      ctx.fillStyle = '#38bdf8'; // Sky blue chalk
      ctx.font = 'bold 36px "Inter", sans-serif';
      ctx.fillText('POINT 1: WHAT IS THE CIRCULATORY SYSTEM?', 120, 175);

      ctx.fillStyle = '#ffffff';
      ctx.font = '27px "Inter", sans-serif';
      ctx.fillText('• The Body\'s Vascular Superhighway: ~60,000 miles of blood vessels', 140, 230);
      ctx.fillText('• Transports O₂, glucose, hormones & leukocytes to all 40 trillion cells', 140, 280);
      ctx.fillText('• Removes cellular waste: carbon dioxide (CO₂), urea & lactic acid', 140, 330);

      ctx.fillStyle = '#fde047'; // Yellow chalk
      ctx.font = 'bold 29px "Inter", sans-serif';
      ctx.fillText('THE THREE CORE PILLARS:', 140, 395);

      ctx.fillStyle = '#ffffff';
      ctx.font = '26px "Inter", sans-serif';
      ctx.fillText('1. The Pump: Muscular heart beating ~100k times/day, pumping ~7,500 L daily', 160, 440);
      ctx.fillText('2. The Highway: Arteries (away, high P) | Veins (valves return) | Capillaries (exchange)', 160, 490);
      ctx.fillText('3. The Fluid: Blood (Erythrocytes O₂, Leukocytes immune, Platelets, Plasma)', 160, 540);

      ctx.fillStyle = '#4ade80'; // Green chalk
      ctx.font = 'bold 26px "Inter", sans-serif';
      ctx.fillText('⚡ Capillary Diffusion: 1-cell thick endothelium (5-8 µm) enables instant gas exchange.', 140, 610);
      ctx.fillText('⚡ Speed slows to < 1 mm/s so red blood cells unload O₂ single-file!', 140, 655);

      // Vascular Tree Schematic Box on Right
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.strokeRect(1200, 150, 740, 540);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#7dd3fc';
      ctx.font = 'bold 32px "Inter", sans-serif';
      ctx.fillText('Microvascular Highway Architecture', 1570, 205);

      // Chalk boxes representing Artery -> Capillary Bed -> Vein
      // Artery Box (High pressure red)
      ctx.strokeStyle = '#f43f5e';
      ctx.fillStyle = 'rgba(244, 63, 94, 0.18)';
      ctx.lineWidth = 3;
      ctx.fillRect(1230, 240, 210, 150);
      ctx.strokeRect(1230, 240, 210, 150);
      ctx.fillStyle = '#fda4af';
      ctx.font = 'bold 24px "Inter", sans-serif';
      ctx.fillText('ARTERIES', 1335, 290);
      ctx.font = '19px "Inter", sans-serif';
      ctx.fillText('High Pressure (~120)', 1335, 330);
      ctx.fillText('Thick Elastic Walls', 1335, 360);

      // Arrow -> Capillary Bed
      ctx.strokeStyle = '#fef08a';
      ctx.fillStyle = '#fef08a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(1445, 315);
      ctx.lineTo(1495, 315);
      ctx.stroke();

      // Capillary Bed Center Box
      ctx.strokeStyle = '#a855f7';
      ctx.fillStyle = 'rgba(168, 85, 247, 0.18)';
      ctx.fillRect(1500, 240, 200, 280);
      ctx.strokeRect(1500, 240, 200, 280);
      ctx.fillStyle = '#d8b4fe';
      ctx.font = 'bold 24px "Inter", sans-serif';
      ctx.fillText('CAPILLARY BED', 1600, 290);
      ctx.font = '18px "Inter", sans-serif';
      ctx.fillText('1-Cell Thick Wall', 1600, 335);
      ctx.fillText('O₂ & Nutrients Out', 1600, 385);
      ctx.fillText('CO₂ & Wastes In', 1600, 425);
      ctx.fillText('Flow < 1 mm/sec', 1600, 475);

      // Arrow -> Veins
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(1705, 315);
      ctx.lineTo(1755, 315);
      ctx.stroke();

      // Vein Box (Low pressure blue)
      ctx.strokeStyle = '#0284c7';
      ctx.fillStyle = 'rgba(2, 132, 199, 0.18)';
      ctx.fillRect(1760, 240, 160, 150);
      ctx.strokeRect(1760, 240, 160, 150);
      ctx.fillStyle = '#7dd3fc';
      ctx.font = 'bold 24px "Inter", sans-serif';
      ctx.fillText('VEINS', 1840, 290);
      ctx.font = '19px "Inter", sans-serif';
      ctx.fillText('Low Pressure', 1840, 330);
      ctx.fillText('One-Way Valves', 1840, 360);

      // Heart Pump Summary Box below
      ctx.strokeStyle = '#f43f5e';
      ctx.fillStyle = 'rgba(244, 63, 94, 0.12)';
      ctx.fillRect(1230, 545, 690, 120);
      ctx.strokeRect(1230, 545, 690, 120);
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 22px "Inter", sans-serif';
      ctx.fillText('🫀 The Muscular Engine: Continuous Unidirectional Pumping', 1575, 585);
      ctx.fillStyle = '#ffffff';
      ctx.font = '19px "Inter", sans-serif';
      ctx.fillText('Maintains pressure gradients driving systemic and pulmonary loops non-stop.', 1575, 625);

    } else if (stage === 2) {
      // Stage 2 / Point 2: Parts of the Heart
      ctx.textAlign = 'left';
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 36px "Inter", sans-serif';
      ctx.fillText('POINT 2: ANATOMICAL PARTS OF THE HUMAN HEART', 120, 175);

      ctx.fillStyle = '#ffffff';
      ctx.font = '27px "Inter", sans-serif';
      ctx.fillText('• Four Hollow Chambers: Double pump operating in synchronized rhythm', 140, 230);
      ctx.fillText('• Right Atrium (RA): Thin-walled receiving chamber from Vena Cavae (Deox)', 140, 280);
      ctx.fillText('• Right Ventricle (RV): Pumps to lungs via Pulmonary Trunk (Wall: 3-5mm)', 140, 330);
      ctx.fillText('• Left Atrium (LA): Receives oxygenated blood from 4 Pulmonary Veins', 140, 380);
      ctx.fillText('• Left Ventricle (LV): Thickest myocardium (12-15mm) to supply systemic body!', 140, 430);

      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 29px "Inter", sans-serif';
      ctx.fillText('FOUR ONE-WAY VALVES (Prevent Systolic Regurgitation):', 140, 495);

      ctx.fillStyle = '#ffffff';
      ctx.font = '25px "Inter", sans-serif';
      ctx.fillText('1. Tricuspid Valve: Right Atrium ➔ Right Ventricle (3 cusps)', 160, 540);
      ctx.fillText('2. Bicuspid (Mitral) Valve: Left Atrium ➔ Left Ventricle (2 cusps)', 160, 580);
      ctx.fillText('3. Pulmonary Semilunar Valve: RV exit to Pulmonary Trunk', 160, 620);
      ctx.fillText('4. Aortic Semilunar Valve: LV exit to Ascending Aorta', 160, 660);

      // Anatomical Chambers Schematic Box on Right (Labeled Diagram of Heart Parts)
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 4;
      ctx.strokeRect(1180, 150, 760, 540);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#fecdd3';
      ctx.font = 'bold 30px "Inter", sans-serif';
      ctx.fillText('ANATOMICAL HEART DIAGRAM & LABELED PARTS', 1560, 195);

      const bcx = 1560;
      const bcy = 440;

      // Great Vessels (Top)
      // Superior Vena Cava
      ctx.fillStyle = 'rgba(2, 132, 199, 0.35)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.fillRect(bcx - 140, bcy - 190, 36, 90);
      ctx.strokeRect(bcx - 140, bcy - 190, 36, 90);

      // Aorta Arch (Curving over top)
      ctx.fillStyle = 'rgba(225, 29, 72, 0.4)';
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bcx - 10, bcy - 70);
      ctx.bezierCurveTo(bcx - 15, bcy - 190, bcx + 90, bcy - 220, bcx + 100, bcy - 120);
      ctx.lineTo(bcx + 65, bcy - 120);
      ctx.bezierCurveTo(bcx + 60, bcy - 180, bcx + 20, bcy - 150, bcx + 20, bcy - 70);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 3 Aortic Branches
      for (const bx of [bcx + 20, bx_carotid => bcx + 45, bx_sub => bcx + 70]) {
        const xCoord = typeof bx === 'number' ? bx : bx(0);
        ctx.fillRect(xCoord - 5, bcy - 220, 10, 30);
        ctx.strokeRect(xCoord - 5, bcy - 220, 10, 30);
      }

      // Pulmonary Trunk
      ctx.fillStyle = 'rgba(14, 165, 233, 0.35)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(bcx - 35, bcy - 50);
      ctx.lineTo(bcx - 25, bcy - 140);
      ctx.lineTo(bcx - 85, bcy - 160);
      ctx.lineTo(bcx - 85, bcy - 140);
      ctx.lineTo(bcx - 10, bcy - 125);
      ctx.lineTo(bcx + 40, bcy - 140);
      ctx.lineTo(bcx + 40, bcy - 160);
      ctx.lineTo(bcx - 10, bcy - 140);
      ctx.lineTo(bcx - 15, bcy - 50);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Right Side (Deox - Blue)
      ctx.strokeStyle = '#0284c7';
      ctx.fillStyle = 'rgba(2, 132, 199, 0.22)';
      ctx.lineWidth = 3;
      // Right Atrium
      ctx.fillRect(bcx - 170, bcy - 80, 140, 110);
      ctx.strokeRect(bcx - 170, bcy - 80, 140, 110);
      ctx.fillStyle = '#7dd3fc';
      ctx.font = 'bold 20px "Inter", sans-serif';
      ctx.fillText('RIGHT ATRIUM', bcx - 100, bcy - 35);
      ctx.font = '14px "Inter", sans-serif';
      ctx.fillText('(Wall: 2-3mm)', bcx - 100, bcy - 10);

      // Right Ventricle
      ctx.fillRect(bcx - 170, bcy + 45, 140, 140);
      ctx.strokeRect(bcx - 170, bcy + 45, 140, 140);
      ctx.fillStyle = '#7dd3fc';
      ctx.font = 'bold 20px "Inter", sans-serif';
      ctx.fillText('RIGHT VENTRICLE', bcx - 100, bcy + 105);
      ctx.font = '14px "Inter", sans-serif';
      ctx.fillText('Wall: 3-5mm (25 mmHg)', bcx - 100, bcy + 130);

      // Left Side (Ox - Red)
      ctx.strokeStyle = '#e11d48';
      ctx.fillStyle = 'rgba(225, 29, 72, 0.22)';
      ctx.lineWidth = 3;
      // Left Atrium
      ctx.fillRect(bcx + 30, bcy - 80, 140, 110);
      ctx.strokeRect(bcx + 30, bcy - 80, 140, 110);
      ctx.fillStyle = '#fda4af';
      ctx.font = 'bold 20px "Inter", sans-serif';
      ctx.fillText('LEFT ATRIUM', bcx + 100, bcy - 35);
      ctx.font = '14px "Inter", sans-serif';
      ctx.fillText('(Wall: 3mm)', bcx + 100, bcy - 10);

      // Left Ventricle with Thick Myocardium Border (8px)
      ctx.lineWidth = 8;
      ctx.strokeStyle = '#f43f5e';
      ctx.fillRect(bcx + 30, bcy + 45, 150, 140);
      ctx.strokeRect(bcx + 30, bcy + 45, 150, 140);
      ctx.fillStyle = '#fda4af';
      ctx.font = 'bold 20px "Inter", sans-serif';
      ctx.fillText('LEFT VENTRICLE', bcx + 105, bcy + 95);
      ctx.font = 'bold 15px "Inter", sans-serif';
      ctx.fillStyle = '#fef08a';
      ctx.fillText('★ Wall: 12-15mm (120 mmHg)', bcx + 105, bcy + 125);
      ctx.fillText('(3× Thicker Myocardium!)', bcx + 105, bcy + 150);

      // Septum Divider Line
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(bcx, bcy - 85);
      ctx.lineTo(bcx, bcy + 190);
      ctx.stroke();
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('SEPTUM', bcx, bcy + 205);

      // Chalk Valves
      // Tricuspid Valve
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bcx - 160, bcy + 38);
      ctx.lineTo(bcx - 40, bcy + 38);
      ctx.stroke();
      // Mitral Valve
      ctx.beginPath();
      ctx.moveTo(bcx + 40, bcy + 38);
      ctx.lineTo(bcx + 160, bcy + 38);
      ctx.stroke();

      // Chalk Leader Lines & Labels
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.5;

      // Label: Aortic Arch
      ctx.beginPath();
      ctx.moveTo(bcx + 45, bcy - 190);
      ctx.lineTo(bcx + 45, bcy - 215);
      ctx.lineTo(bcx + 180, bcy - 215);
      ctx.stroke();
      ctx.textAlign = 'left';
      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 16px "Inter", sans-serif';
      ctx.fillText('AORTIC ARCH (120 mmHg)', bcx + 190, bcy - 210);

      // Label: Superior Vena Cava
      ctx.beginPath();
      ctx.moveTo(bcx - 120, bcy - 150);
      ctx.lineTo(bcx - 220, bcy - 150);
      ctx.stroke();
      ctx.textAlign = 'right';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('SUPERIOR VENA CAVA (Deox)', bcx - 230, bcy - 145);

      // Label: Tricuspid Valve
      ctx.beginPath();
      ctx.moveTo(bcx - 165, bcy + 38);
      ctx.lineTo(bcx - 220, bcy + 38);
      ctx.stroke();
      ctx.fillStyle = '#fde047';
      ctx.fillText('TRICUSPID VALVE (AV)', bcx - 230, bcy + 42);

      // Label: Mitral Valve
      ctx.beginPath();
      ctx.moveTo(bcx + 165, bcy + 38);
      ctx.lineTo(bcx + 220, bcy + 38);
      ctx.stroke();
      ctx.textAlign = 'left';
      ctx.fillStyle = '#fde047';
      ctx.fillText('MITRAL / BICUSPID VALVE', bcx + 230, bcy + 42);

      // Bottom Legend: "LUB" / "DUB"
      ctx.textAlign = 'center';
      ctx.fillStyle = '#86efac';
      ctx.font = 'bold 22px "Inter", monospace';
      ctx.fillText('Heart Sounds: "LUB" (AV shut) — "DUB" (Semilunar shut)', 1560, bcy + 235);

    } else if (stage === 3) {
      // Stage 3 / Point 3: The Journey of Blood in the Circulatory System
      ctx.textAlign = 'left';
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 36px "Inter", sans-serif';
      ctx.fillText('POINT 3: THE JOURNEY OF BLOOD IN THE CIRCULATORY SYSTEM', 120, 175);

      ctx.fillStyle = '#ffffff';
      ctx.font = '25px "Inter", sans-serif';
      ctx.fillText('• Dual Circulation Figure-8 Circuit: Pulmonary Loop (top) + Systemic Loop (bottom)', 140, 225);

      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 26px "Inter", sans-serif';
      ctx.fillText('THE COMPLETE 8-STEP CHRONOLOGICAL PATHWAY:', 140, 275);

      ctx.fillStyle = '#7dd3fc';
      ctx.font = '23px "Inter", sans-serif';
      ctx.fillText('1. Vena Cavae: Deox blood from upper & lower body returns to heart', 160, 318);
      ctx.fillText('2. Right Atrium ➔ Tricuspid Valve opens into Right Ventricle', 160, 358);
      ctx.fillText('3. Right Ventricle contracts ➔ Pulmonary Valve ➔ Pulmonary Arteries', 160, 398);
      ctx.fillText('4. LUNGS: Alveolar gas exchange — releases CO₂, absorbs fresh O₂', 160, 438);

      ctx.fillStyle = '#fda4af';
      ctx.fillText('5. 4 Pulmonary Veins carry oxygen-saturated blood into Left Atrium', 160, 485);
      ctx.fillText('6. Left Atrium ➔ Bicuspid / Mitral Valve opens into Left Ventricle', 160, 525);
      ctx.fillText('7. Left Ventricle contracts at 120 mmHg ➔ Aortic Valve ➔ Aorta Arch', 160, 565);
      ctx.fillText('8. Systemic Arteries ➔ Capillaries nourish organs ➔ Veins return to Step 1!', 160, 605);

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 24px "Inter", sans-serif';
      ctx.fillText('⚡ A single red blood cell completes this entire cycle in ~60 seconds!', 140, 660);

      // Figure-8 Dual Loop Schematic Box on Right
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 4;
      ctx.strokeRect(1200, 150, 740, 540);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#86efac';
      ctx.font = 'bold 30px "Inter", sans-serif';
      ctx.fillText('Dual Circulation Figure-8 Circuit', 1570, 205);

      // Top Box: Lungs (Pulmonary)
      ctx.strokeStyle = '#38bdf8';
      ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
      ctx.lineWidth = 3;
      ctx.fillRect(1350, 235, 440, 95);
      ctx.strokeRect(1350, 235, 440, 95);
      ctx.fillStyle = '#bae6fd';
      ctx.font = 'bold 23px "Inter", sans-serif';
      ctx.fillText('PULMONARY CIRCUIT: LUNGS', 1570, 275);
      ctx.font = '18px "Inter", sans-serif';
      ctx.fillText('CO₂ Out ⇄ O₂ In (Gas Exchange)', 1570, 305);

      // Center Box: The Heart
      ctx.strokeStyle = '#f43f5e';
      ctx.fillStyle = 'rgba(244, 63, 94, 0.18)';
      ctx.fillRect(1350, 365, 440, 120);
      ctx.strokeRect(1350, 365, 440, 120);
      ctx.fillStyle = '#fecdd3';
      ctx.font = 'bold 24px "Inter", sans-serif';
      ctx.fillText('🫀 DUAL PUMP HEART', 1570, 405);
      ctx.font = '19px "Inter", sans-serif';
      ctx.fillStyle = '#7dd3fc';
      ctx.fillText('Right Heart (Deox Blue) | Left Heart (Ox Red)', 1570, 445);

      // Bottom Box: Systemic Organs
      ctx.strokeStyle = '#a855f7';
      ctx.fillStyle = 'rgba(168, 85, 247, 0.18)';
      ctx.fillRect(1350, 520, 440, 95);
      ctx.strokeRect(1350, 520, 440, 95);
      ctx.fillStyle = '#e9d5ff';
      ctx.font = 'bold 23px "Inter", sans-serif';
      ctx.fillText('SYSTEMIC CIRCUIT: BODY ORGANS', 1570, 560);
      ctx.font = '18px "Inter", sans-serif';
      ctx.fillText('Brain, Liver, Kidneys, Muscles (O₂ Delivered)', 1570, 590);

      // Directional Flow Arrows
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 20px "Inter", monospace';
      ctx.fillText('▲ RV to Lungs (Step 3)', 1280, 320);
      ctx.fillText('▼ Pulm. Veins to LA (Step 5)', 1855, 320);
      ctx.fillText('▼ LV to Body (Step 7)', 1280, 510);
      ctx.fillText('▲ Vena Cava to RA (Step 1)', 1855, 510);

    } else {
      // Stage 4: Summary & Interactive Quiz Prep
      ctx.textAlign = 'left';
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 38px "Inter", sans-serif';
      ctx.fillText('4. The Cardiac Cycle: Hemodynamics & Assessment Prep', 120, 185);

      ctx.fillStyle = '#ffffff';
      ctx.font = '28px "Inter", sans-serif';
      ctx.fillText('• Ventricular Systole: Myocardial contraction; high-pressure ejection (~120 mmHg)', 140, 250);
      ctx.fillText('• Ventricular Diastole: Myocardial relaxation; ventricular filling (~80 mmHg)', 140, 315);
      ctx.fillText('• Stroke Volume (SV): ~70 mL of blood ejected per heartbeat at rest', 140, 380);
      ctx.fillText('• Cardiac Output (CO): Heart Rate × Stroke Volume ≈ 5.0 Liters/min', 140, 445);
      ctx.fillText('• Coronary Arteries: Branch off base of Aorta to supply oxygen to heart muscle', 140, 510);

      ctx.fillStyle = '#86efac';
      ctx.font = 'bold 32px "Inter", sans-serif';
      ctx.fillText('🔔 Lecture Complete! Prepare for Interactive Cardiology Pop Quiz.', 140, 615);

      // Quiz Info Box
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 4;
      ctx.strokeRect(1200, 170, 740, 530);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#fecdd3';
      ctx.font = 'bold 34px "Inter", sans-serif';
      ctx.fillText('Cardiology Pop Quiz', 1570, 240);

      ctx.fillStyle = '#ffffff';
      ctx.font = '26px "Inter", sans-serif';
      ctx.fillText('3 Multiple Choice Questions:', 1570, 315);

      ctx.textAlign = 'left';
      ctx.font = '23px "Inter", sans-serif';
      ctx.fillStyle = '#fef08a';
      ctx.fillText('1. Chamber with thickest muscular wall (LV)', 1250, 375);
      ctx.fillText('2. Valve preventing backflow into left atrium (Mitral)', 1250, 425);
      ctx.fillText('3. Natural primary pacemaker cluster (SA Node)', 1250, 475);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 24px "Inter", sans-serif';
      ctx.fillText('Mark answers on your desk worksheet or HUD screen.', 1570, 560);
      ctx.fillStyle = '#86efac';
      ctx.fillText('Teacher John will evaluate answers live!', 1570, 610);
    }

    this.notify();
  }

  // Draw Assessment Question and Options directly in chalk on the blackboard
  loadAssessmentQuestion(questionIndex, questionObj, selectedOption = null, feedback = null) {
    this.clearBoardLocally();
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const totalQ = 5;

    const storeState = useClassroomStore.getState();
    const activeStudent = storeState.activeStudentAnswer;
    const studentName = activeStudent?.studentName || questionObj?.studentName;
    const studentSeat = activeStudent?.seatId || questionObj?.studentSeat;

    // Chalk Header
    ctx.fillStyle = '#fef08a'; // Chalk yellow
    ctx.font = 'bold 44px "Fredoka", "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`📝 CARDIOLOGY ASSESSMENT: QUESTION ${questionIndex + 1} OF ${totalQ}`, w / 2, 75);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(80, 105);
    ctx.lineTo(w - 80, 105);
    ctx.stroke();

    if (!questionObj) {
      this.notify();
      return;
    }

    // Prominent Student Respondent Banner on Chalkboard
    if (studentName) {
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.fillRect(120, 120, w - 240, 50);
      ctx.strokeRect(120, 120, w - 240, 50);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 24px "Inter", sans-serif';
      ctx.fillText(`👤 STUDENT RESPONDENT: ${studentName} (${studentSeat})`, 140, 153);
    }

    // Question Box on Blackboard
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px "Inter", sans-serif';

    const questionText = questionObj.question;
    const maxTextWidth = w - 240;
    const words = questionText.split(' ');
    let line = '';
    let startY = studentName ? 210 : 165;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxTextWidth && n > 0) {
        ctx.fillText(line, 120, startY);
        line = words[n] + ' ';
        startY += 40;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 120, startY);

    if (questionObj.type === 'open_ended') {
      // -----------------------------------------------------------------------
      // QUESTION 4 (OPEN-ENDED) ON BLACKBOARD
      // -----------------------------------------------------------------------
      const boxY = startY + 25;
      ctx.strokeStyle = '#86efac';
      ctx.fillStyle = 'rgba(134, 239, 172, 0.12)';
      ctx.lineWidth = 3;
      ctx.fillRect(120, boxY, w - 240, 180);
      ctx.strokeRect(120, boxY, w - 240, 180);

      ctx.fillStyle = '#86efac';
      ctx.font = 'bold 26px "Inter", sans-serif';
      ctx.fillText(`✍️ STUDENT CLINICAL REASONING (${studentName}):`, 150, boxY + 45);

      ctx.fillStyle = '#ffffff';
      ctx.font = '24px "Inter", sans-serif';
      const studentAns = activeStudent?.answerText || questionObj.studentAnswerText || questionObj.sampleAnswer;
      const ansWords = studentAns.split(' ');
      let aLine = '';
      let aY = boxY + 90;
      for (let m = 0; m < ansWords.length; m++) {
        const testAns = aLine + ansWords[m] + ' ';
        if (ctx.measureText(testAns).width > (w - 300) && m > 0) {
          ctx.fillText(aLine, 150, aY);
          aLine = ansWords[m] + ' ';
          aY += 36;
        } else {
          aLine = testAns;
        }
      }
      ctx.fillText(aLine, 150, aY);

      // Formula Card
      const formulaY = boxY + 205;
      ctx.strokeStyle = '#fde047';
      ctx.fillStyle = 'rgba(253, 224, 71, 0.12)';
      ctx.fillRect(120, formulaY, w - 240, 120);
      ctx.strokeRect(120, formulaY, w - 240, 120);

      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 28px "Inter", monospace';
      ctx.fillText("LAPLACE'S LAW: Wall Stress (σ) = (P × r) / (2 × h)", 150, formulaY + 45);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '22px "Inter", sans-serif';
      ctx.fillText('• Systemic HTN elevates LV Afterload (140-180 mmHg) ➔ LV wall thickness (h) increases', 150, formulaY + 80);
      ctx.fillText('• Pulmonary resistance is low (~25 mmHg) ➔ RV is spared unless secondary failure occurs', 150, formulaY + 110);

    } else if (questionObj.type === 'graph_builder') {
      // -----------------------------------------------------------------------
      // QUESTION 5 (GRAPH BUILDER) ON BLACKBOARD
      // -----------------------------------------------------------------------
      const gx = 140;
      const gy = startY + 25;
      const gw = w - 280;
      const gh = 380;

      // Chalk Axes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(gx + 60, gy + 30);
      ctx.lineTo(gx + 60, gy + gh - 40);
      ctx.lineTo(gx + gw - 20, gy + gh - 40);
      ctx.stroke();

      // Axis Titles
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 22px "Inter", sans-serif';
      ctx.fillText('Pressure (mmHg)', gx + 20, gy + 20);

      // Y-axis ticks (0, 40, 80, 120 mmHg)
      const yTicks = [
        { label: '120', y: gy + 60 },
        { label: '80', y: gy + 140 },
        { label: '40', y: gy + 220 },
        { label: '0', y: gy + gh - 40 },
      ];
      ctx.fillStyle = '#94a3b8';
      ctx.font = '20px monospace';
      yTicks.forEach((yt) => {
        ctx.fillText(yt.label, gx + 15, yt.y + 6);
        ctx.beginPath();
        ctx.moveTo(gx + 55, yt.y);
        ctx.lineTo(gx + 65, yt.y);
        ctx.stroke();
      });

      // X-axis stations
      const stations = [
        { name: 'Aorta', x: gx + 140 },
        { name: 'Arteries', x: gx + 360 },
        { name: 'Arterioles', x: gx + 640, isDrop: true },
        { name: 'Capillaries', x: gx + 940 },
        { name: 'Venules', x: gx + 1200 },
        { name: 'Vena Cava', x: gx + 1450 },
      ];
      stations.forEach((st) => {
        ctx.fillStyle = st.isDrop ? '#f87171' : '#cbd5e1';
        ctx.font = st.isDrop ? 'bold 22px "Inter", sans-serif' : '20px "Inter", sans-serif';
        ctx.fillText(st.name, st.x - 30, gy + gh - 10);
      });

      // Chalk Dynamic Pressure Curve
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(gx + 60, gy + 75); // Aorta 120/80 wave
      ctx.bezierCurveTo(gx + 220, gy + 60, gx + 280, gy + 90, gx + 360, gy + 78); // Arteries
      ctx.bezierCurveTo(gx + 480, gy + 90, gx + 540, gy + 110, gx + 600, gy + 130); // Pre-arteriole
      ctx.lineTo(gx + 720, gy + 230); // STEEP ARTERIOLAR DROP (85 -> 35 mmHg)
      ctx.bezierCurveTo(gx + 840, gy + 250, gx + 900, gy + 270, gx + 980, gy + 280); // Capillaries
      ctx.bezierCurveTo(gx + 1100, gy + 290, gx + 1300, gy + gh - 55, gx + 1480, gy + gh - 50); // Venous return
      ctx.stroke();

      // Steepest Drop Chalk Callout
      ctx.strokeStyle = '#f87171';
      ctx.fillStyle = 'rgba(248, 113, 113, 0.2)';
      ctx.lineWidth = 2.5;
      ctx.fillRect(gx + 540, gy + 145, 340, 75);
      ctx.strokeRect(gx + 540, gy + 145, 340, 75);

      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 22px "Inter", sans-serif';
      ctx.fillText('★ STEEPEST DROP (ARTERIOLES)', gx + 555, gy + 175);
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('85 ➔ 35 mmHg (~60% Total TPR)', gx + 555, gy + 203);

      ctx.fillStyle = '#86efac';
      ctx.font = 'italic 22px "Inter", sans-serif';
      ctx.fillText(`Graph plotted by ${studentName} (${studentSeat}) · Arteriolar resistance protects fragile capillaries.`, gx + 60, gy + gh + 35);

    } else {
      // -----------------------------------------------------------------------
      // QUESTIONS 1, 2, 3: MULTIPLE CHOICE OPTIONS
      // -----------------------------------------------------------------------
      let optY = Math.max(startY + 35, 275);
      const optLetters = ['A', 'B', 'C', 'D'];

      questionObj.options.forEach((opt, idx) => {
        const isCorrect = idx === questionObj.correctIndex;
        const isChosen = selectedOption === idx;

        if (feedback && isCorrect) {
          ctx.strokeStyle = '#86efac';
          ctx.fillStyle = 'rgba(134, 239, 172, 0.15)';
        } else if (feedback && isChosen && !isCorrect) {
          ctx.strokeStyle = '#f87171';
          ctx.fillStyle = 'rgba(248, 113, 113, 0.15)';
        } else if (isChosen) {
          ctx.strokeStyle = '#38bdf8';
          ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
        } else {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        }

        ctx.lineWidth = 2.5;
        ctx.fillRect(120, optY, w - 240, 75);
        ctx.strokeRect(120, optY, w - 240, 75);

        // Letter badge
        ctx.fillStyle = isChosen ? '#38bdf8' : (feedback && isCorrect ? '#86efac' : '#fde047');
        ctx.font = 'bold 28px "Inter", sans-serif';
        ctx.fillText(`[${optLetters[idx]}]`, 150, optY + 48);

        // Option text
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px "Inter", sans-serif';
        const cleanOpt = opt.replace(/^[A-D]\.\s*/, '');
        ctx.fillText(cleanOpt, 230, optY + 48);

        optY += 88;
      });

      // Feedback or instructions footer
      if (feedback) {
        ctx.textAlign = 'center';
        if (feedback.isCorrect) {
          ctx.fillStyle = '#86efac';
          ctx.font = 'bold 30px "Inter", sans-serif';
          ctx.fillText('✓ CORRECT! ' + feedback.explanation, w / 2, optY + 40);
        } else {
          ctx.fillStyle = '#fca5a5';
          ctx.font = 'bold 28px "Inter", sans-serif';
          ctx.fillText('✗ ' + feedback.explanation, w / 2, optY + 40);
        }
      } else {
        ctx.textAlign = 'center';
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'italic 23px "Inter", sans-serif';
        ctx.fillText('✍️ Complete your answer on your desk Worksheet or select option on your student screen.', w / 2, h - 30);
      }
    }

    this.notify();
  }

  loadTemplate(templateId = 'agenda') {
    this.clearBoardLocally();
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.fillStyle = '#f43f5e';
    ctx.font = 'bold 50px "Fredoka", "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🫀 HUMAN CARDIOLOGY: ANATOMY OF THE HEART', w / 2, 90);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(80, 120);
    ctx.lineTo(w - 80, 120);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = '32px "Inter", sans-serif';
    ctx.fillText('Today\'s Topic: Structure, Chambers & Conduction of the Human Heart', 140, 200);
    ctx.fillText('• Gross Anatomy: 4 Chambers (RA, RV, LA, LV)', 160, 280);
    ctx.fillText('• Blood Flow Pathways: Systemic & Pulmonary Circulatory Trees', 160, 360);
    ctx.fillText('• Heart Valves: Atrioventricular & Semilunar Mechanics', 160, 440);
    ctx.fillText('• The Intrinsic Pacemaker: Sinoatrial (SA) Node & Conduction', 160, 520);

    ctx.fillStyle = '#86efac';
    ctx.font = 'bold 34px "Inter", sans-serif';
    ctx.fillText('Ready for class! Click [Start Heart Anatomy Class] to begin.', 140, 680);

    this.notify();
  }

  clearBoard() {
    this.clearBoardLocally();
    websocketService.send({
      action: 'blackboard.clear',
      payload: {},
    });
  }

  renderStrokeLocally(stroke) {
    const { points, color, width, isEraser } = stroke;
    if (!points || points.length < 2) return;

    this.ctx.save();
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    if (isEraser) {
      this.ctx.strokeStyle = '#183a26';
      this.ctx.lineWidth = width || 48;
    } else {
      this.ctx.strokeStyle = color || '#ffffff';
      this.ctx.lineWidth = width || 8;
      this.ctx.shadowColor = color || '#ffffff';
      this.ctx.shadowBlur = 2;
    }

    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }
    this.ctx.stroke();
    this.ctx.restore();

    this.history.push(stroke);
    this.notify();
  }
}

export const blackboardService = new BlackboardService();
