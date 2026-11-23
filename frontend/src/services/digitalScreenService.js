import * as THREE from 'three';
import { HEART_ANATOMY_QUIZ } from './lectureService';
import { useClassroomStore } from '../store/classroomStore';

// Polyfill CanvasRenderingContext2D.prototype.roundRect for maximum browser compatibility
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, radii = 0) {
    let r = Array.isArray(radii) ? radii : [radii, radii, radii, radii];
    if (r.length === 1) r = [r[0], r[0], r[0], r[0]];
    if (r.length === 2) r = [r[0], r[1], r[0], r[1]];
    const [tl, tr, br, bl] = r;
    this.beginPath();
    this.moveTo(x + tl, y);
    this.lineTo(x + w - tr, y);
    this.quadraticCurveTo(x + w, y, x + w, y + tr);
    this.lineTo(x + w, y + h - br);
    this.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
    this.lineTo(x + bl, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - bl);
    this.lineTo(x, y + tl);
    this.quadraticCurveTo(x, y, x + tl, y);
    this.closePath();
    return this;
  };
}

/**
 * Real-Time Digital Smart Screen Service (5-Minute Cardiology Curriculum)
 * Powers the 4K digital screen with dynamic visual content corresponding to each of the 3 points:
 * Point 1 (0-100s): What is the Circulatory System? (Vascular network, 3 components, capillary exchange)
 * Point 2 (100-200s): Parts of the Heart (4 chambers, 4 valves, myocardium wall thickness, great vessels)
 * Point 3 (200-300s): The Journey of Blood in the Circulatory System (Dual circulation Figure-8 loop, 8-step journey)
 */
class DigitalScreenService {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 1920;
    this.canvas.height = 800;
    this.ctx = this.canvas.getContext('2d');

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.generateMipmaps = false; // High-Performance: Mipmaps are unnecessary with LinearFilter and cause massive GPU stalls
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;

    this.listeners = new Set();

    // Telemetry State
    this.heartRate = 72; // BPM
    this.bloodPressure = '120/80';
    this.cardiacOutput = 5.04; // L/min (72 * 70mL)
    this.strokeVolume = 70; // mL
    this.pacemakerStatus = 'SA Node (Normal)';

    // Digital stylus annotations layer
    this.annotations = [];
    this.lastTime = 0;
    this.lastRenderTime = 0;
    this.cachedBgGrad = null;
  }

  getTexture() {
    return this.texture;
  }

  getCanvas() {
    return this.canvas;
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

  setHeartRate(bpm) {
    this.heartRate = Math.max(30, Math.min(180, bpm));
    this.cardiacOutput = Number(((this.heartRate * this.strokeVolume) / 1000).toFixed(2));
    if (this.heartRate > 100) {
      this.pacemakerStatus = 'Sinus Tachycardia';
      this.bloodPressure = '135/88';
    } else if (this.heartRate < 55) {
      this.pacemakerStatus = 'Sinus Bradycardia';
      this.bloodPressure = '105/68';
    } else {
      this.pacemakerStatus = 'SA Node (Normal)';
      this.bloodPressure = '120/80';
    }
    this.notify();
  }

  addAnnotationStroke(stroke) {
    this.annotations.push(stroke);
    this.notify();
  }

  clearAnnotations() {
    this.annotations = [];
    this.notify();
  }

  /**
   * Main Render Cycle: Renders Point 1, Point 2, Point 3, or Live Assessment based on state & timer
   */
  render(t = null, lectureTimer = 0, lectureTranscript = '', lectureState = 'lecturing', currentQuizQuestionIndex = 0, quizFeedback = null) {
    const nowSec = performance.now() * 0.001;
    // High-performance throttling: limit canvas rendering & GPU texture uploads to max 25 FPS (0.038s interval)
    // 25 FPS is silky smooth for heartbeat, ECG sweep, and particles, while cutting 60% of CPU canvas draws and GPU bus transfers!
    if (this.lastRenderTime && (nowSec - this.lastRenderTime < 0.038)) {
      return;
    }
    this.lastRenderTime = nowSec;
    const animT = nowSec;
    this.lastTime = animT;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    const isAssessment = lectureState === 'qa' || lectureTimer >= 300;

    // 1. Digital Display Background (Cached Gradient)
    if (!this.cachedBgGrad) {
      this.cachedBgGrad = ctx.createLinearGradient(0, 0, w, h);
      this.cachedBgGrad.addColorStop(0, '#040814');
      this.cachedBgGrad.addColorStop(0.5, '#091326');
      this.cachedBgGrad.addColorStop(1, '#030610');
    }
    ctx.fillStyle = this.cachedBgGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle Digital Matrix Grid (Batched single path & stroke)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < w; x += 40) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = 0; y < h; y += 40) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    // 2. Top Header Navigation Bar
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.fillRect(0, 0, w, 75);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 75);
    ctx.lineTo(w, 75);
    ctx.stroke();

    // Institution Branding
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.fillText('ST. JUDE MEDICAL ACADEMY · 4K SMARTBOARD', 40, 46);

    // Active Topic Header
    let pointTag = 'POINT 1 OF 3: WHAT IS THE CIRCULATORY SYSTEM?';
    if (lectureState === 'idle') {
      pointTag = 'POWERPOINT PRESENTATION · CARDIOVASCULAR ANATOMY MASTERCLASS';
    } else if (isAssessment) {
      pointTag = `LIVE POP QUIZ · QUESTION ${currentQuizQuestionIndex + 1} OF 5 (SYNCED TO STUDENT DEVICES)`;
    } else if (lectureTimer >= 200) {
      pointTag = 'POINT 3 OF 3: THE JOURNEY OF BLOOD IN THE CIRCULATORY SYSTEM';
    } else if (lectureTimer >= 100) {
      pointTag = 'POINT 2 OF 3: ANATOMICAL PARTS OF THE HUMAN HEART';
    }

    ctx.fillStyle = lectureState === 'idle' ? '#38bdf8' : isAssessment ? '#fde047' : '#f8fafc';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText(pointTag, 560, 46);

    // Live Clock & Time Elapsed / Device Status Badge
    if (lectureState === 'idle') {
      const pulse = 0.7 + 0.3 * Math.sin(animT * 4);
      ctx.fillStyle = `rgba(52, 211, 153, ${pulse})`;
      ctx.font = 'bold 17px monospace';
      ctx.fillText('● READY TO PRESENT · CLICK SCREEN TO START', w - 480, 46);
    } else if (isAssessment) {
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('● 20/20 DEVICES SYNCED', w - 260, 46);
    } else {
      const m = Math.floor(lectureTimer / 60);
      const s = lectureTimer % 60;
      const timeStr = `${m}:${s < 10 ? '0' : ''}${s} / 5:00`;
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(`● LECTURE: ${timeStr}`, w - 260, 46);
    }

    // 3. Render Corresponding Visual Content for Active Lecture or Live Assessment
    if (lectureState === 'idle') {
      this.renderPowerPointTitleSlide(ctx, w, h, animT);
    } else if (isAssessment) {
      this.renderAssessmentScreen(ctx, w, h, animT, currentQuizQuestionIndex, quizFeedback);
    } else if (lectureTimer < 100) {
      this.renderPoint1CirculatorySystem(ctx, w, h, animT, lectureTimer);
    } else if (lectureTimer < 200) {
      this.renderPoint2PartsOfHeart(ctx, w, h, animT, lectureTimer);
    } else {
      this.renderPoint3JourneyOfBlood(ctx, w, h, animT, lectureTimer);
    }

    // 4. Render User Digital Stylus Annotations Layer on Top
    if (this.annotations.length > 0) {
      for (const stroke of this.annotations) {
        if (!stroke.points || stroke.points.length < 2) continue;
        ctx.strokeStyle = stroke.color || '#38bdf8';
        ctx.lineWidth = stroke.width || 6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
      }
    }

    this.notify();
  }

  // =========================================================================
  // POWERPOINT TITLE / LAUNCH SLIDE (IDLE STATE)
  // =========================================================================
  renderPowerPointTitleSlide(ctx, w, h, t) {
    const leftW = 1140;

    // Left Hero Presentation Card
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.roundRect(40, 95, leftW, h - 125, 20);
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Subtle Radial Glow behind Hero Title
    const radGrad = ctx.createRadialGradient(380, 260, 20, 380, 260, 420);
    radGrad.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
    radGrad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
    ctx.fillStyle = radGrad;
    ctx.fillRect(45, 100, leftW - 10, h - 135);

    // Faculty Badge
    ctx.fillStyle = 'rgba(14, 165, 233, 0.18)';
    ctx.roundRect(80, 135, 480, 34, 8);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.fillText('ST. JUDE MEDICAL ACADEMY · DIVISION OF CARDIOLOGY', 96, 157);

    // Main Presentation Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px system-ui, sans-serif';
    ctx.fillText('HUMAN CIRCULATORY SYSTEM', 80, 230);
    ctx.fillText('& CARDIAC ANATOMY', 80, 285);

    // Subtitle
    ctx.fillStyle = '#94a3b8';
    ctx.font = '20px system-ui, sans-serif';
    ctx.fillText('5-Minute Interactive Clinical Masterclass · Hemodynamics & Chamber Dynamics', 80, 335);

    // Faculty Lecturer Profile Card
    ctx.fillStyle = 'rgba(30, 41, 59, 0.75)';
    ctx.roundRect(80, 375, leftW - 160, 110, 14);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Doctor Avatar Circle Badge
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(135, 430, 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.fillText('MD', 117, 438);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText('Prof. John H. Watson, MD, FACC', 190, 418);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '16px system-ui, sans-serif';
    ctx.fillText('Attending Cardiologist · Chair of Clinical Physiology & Simulation', 190, 444);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px monospace';
    ctx.fillText('Lecture Topic: 3 Core Pillars · 4 Valves & 3× LV Myocardium · Figure-8 Circuit', 190, 466);

    // Interactive PowerPoint Launch Button (Pulsing Glow)
    const btnPulse = 0.85 + 0.15 * Math.sin(t * 3.5);
    const btnW = 540;
    const btnH = 72;
    const btnX = 80;
    const btnY = 530;

    ctx.save();
    ctx.shadowColor = 'rgba(16, 185, 129, 0.7)';
    ctx.shadowBlur = 24 * btnPulse;

    const btnGrad = ctx.createLinearGradient(btnX, btnY, btnX + btnW, btnY);
    btnGrad.addColorStop(0, '#059669');
    btnGrad.addColorStop(1, '#10b981');
    ctx.fillStyle = btnGrad;
    ctx.roundRect(btnX, btnY, btnW, btnH, 16);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = '#6ee7b7';
    ctx.lineWidth = 2.5;
    ctx.roundRect(btnX, btnY, btnW, btnH, 16);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.fillText('▶  START LECTURE PRESENTATION', btnX + 55, btnY + 45);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '15px system-ui, sans-serif';
    ctx.fillText('Click anywhere on this screen or press Start in teacher toolbar', btnX + 15, btnY + 105);

    // Right Column: 3 Core Lecture Milestones Agenda
    const rightX = leftW + 65;
    const rightW = w - rightX - 40;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.roundRect(rightX, 95, rightW, h - 125, 20);
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText('SYLLABUS · 3 CORE POINTS', rightX + 30, 140);

    // Milestone Cards
    const milestones = [
      {
        num: 'POINT 1',
        time: '0:00 – 1:40',
        title: 'What is the Circulatory System?',
        desc: '60,000-mile vascular network: Heart (Pump), Vessels (Highway) & Blood (Fluid) + Capillary Diffusion',
        color: '#38bdf8',
      },
      {
        num: 'POINT 2',
        time: '1:40 – 3:20',
        title: 'Anatomical Parts of the Heart',
        desc: '4 Chambers, 4 Valves, 3× Myocardium Wall Thickness in Left Ventricle (120 mmHg) & Great Vessels',
        color: '#f43f5e',
      },
      {
        num: 'POINT 3',
        time: '3:20 – 5:00',
        title: 'The Journey of Blood',
        desc: 'Figure-8 Dual Circulation: Pulmonary loop (lungs O₂ pickup) & Systemic loop (body delivery)',
        color: '#a855f7',
      },
    ];

    let cardY = 170;
    milestones.forEach((m, idx) => {
      ctx.fillStyle = 'rgba(30, 41, 59, 0.65)';
      ctx.roundRect(rightX + 25, cardY, rightW - 50, 115, 12);
      ctx.fill();
      ctx.strokeStyle = m.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Top line: Point tag & Time
      ctx.fillStyle = m.color;
      ctx.font = 'bold 15px monospace';
      ctx.fillText(`${m.num} · ${m.time}`, rightX + 42, cardY + 30);

      // Title
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 18px system-ui, sans-serif';
      ctx.fillText(m.title, rightX + 42, cardY + 58);

      // Description
      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px system-ui, sans-serif';
      ctx.fillText(m.desc.slice(0, 72), rightX + 42, cardY + 84);
      if (m.desc.length > 72) {
        ctx.fillText(m.desc.slice(72), rightX + 42, cardY + 102);
      }

      cardY += 135;
    });

    // Student Devices Status Banner at bottom of right column
    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.roundRect(rightX + 25, cardY + 15, rightW - 50, 60, 10);
    ctx.fill();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.fillText('● 20/20 STUDENT TABLETS SYNCED', rightX + 45, cardY + 45);
    ctx.fillStyle = '#a7f3d0';
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText('Interactive CardioPad devices ready for synchronized live slides', rightX + 45, cardY + 65);
  }

  // =========================================================================
  // POINT 1 (0-100s): WHAT IS THE CIRCULATORY SYSTEM?
  // =========================================================================
  renderPoint1CirculatorySystem(ctx, w, h, t, lectureTimer) {
    const leftW = 920;

    // Left Panel: Human Vascular Tree & Systemic Network Silhouette
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.roundRect(40, 95, leftW - 60, h - 125, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText('HUMAN CARDIOVASCULAR VASCULAR HIGHWAY (60,000 MILES)', 65, 135);

    // Schematic Human Torso & Vascular Tree
    const cx = 450;
    const cy = 450;

    // Central Heart Pump
    const pulse = 1.0 + Math.sin(t * 6.0) * 0.05;
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(cx, cy - 80, 42 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText('HEART PUMP', cx - 48, cy - 75);

    // Red Arterial Tree (Distributing oxygenated blood away)
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 6;
    // Ascending Carotid Arteries (To Brain)
    ctx.beginPath();
    ctx.moveTo(cx - 15, cy - 120);
    ctx.lineTo(cx - 15, cy - 240);
    ctx.lineTo(cx - 65, cy - 290);
    ctx.moveTo(cx - 15, cy - 240);
    ctx.lineTo(cx + 35, cy - 290);
    ctx.stroke();

    // Descending Aorta & Femoral Arteries (To Viscera & Limbs)
    ctx.beginPath();
    ctx.moveTo(cx + 15, cy - 50);
    ctx.lineTo(cx + 15, cy + 120);
    ctx.lineTo(cx - 80, cy + 260);
    ctx.moveTo(cx + 15, cy + 120);
    ctx.lineTo(cx + 110, cy + 260);
    ctx.stroke();

    // Blue Venous Return Tree (Deoxygenated blood returning to heart)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 6;
    // Superior Vena Cava (From Head & Arms)
    ctx.beginPath();
    ctx.moveTo(cx - 45, cy - 120);
    ctx.lineTo(cx - 45, cy - 220);
    ctx.lineTo(cx - 110, cy - 270);
    ctx.moveTo(cx - 45, cy - 220);
    ctx.lineTo(cx + 5, cy - 270);
    ctx.stroke();

    // Inferior Vena Cava (From Lower Limbs & Organs)
    ctx.beginPath();
    ctx.moveTo(cx - 25, cy - 40);
    ctx.lineTo(cx - 25, cy + 130);
    ctx.lineTo(cx - 120, cy + 270);
    ctx.moveTo(cx - 25, cy + 130);
    ctx.lineTo(cx + 70, cy + 270);
    ctx.stroke();

    // Capillary Exchange Micro-Mesh (Where Arteries meet Veins)
    const renderCapillaryBed = (bx, by, label) => {
      ctx.fillStyle = 'rgba(236, 72, 153, 0.2)';
      ctx.roundRect(bx - 55, by - 25, 110, 50, 8);
      ctx.fill();
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.fillText(label, bx - 45, by + 4);
    };

    renderCapillaryBed(cx - 15, cy - 305, 'Cephalic (Brain) Bed');
    renderCapillaryBed(cx - 250, cy - 80, 'Pulmonary (Lungs) Bed');
    renderCapillaryBed(cx + 230, cy - 80, 'Hepatic & Renal Bed');
    renderCapillaryBed(cx - 5, cy + 275, 'Systemic Extremity Bed');

    // Dynamic Circulating Blood Particles along Arteries & Veins
    const flowT = (t * 2.2) % 1.0;
    for (let i = 0; i < 5; i++) {
      const frac = (flowT + i / 5) % 1.0;
      // Carotid Arterial Pulse (Ascending to Brain)
      const cay = (cy - 120) - frac * 140;
      ctx.fillStyle = '#fca5a5';
      ctx.beginPath();
      ctx.arc(cx - 15, cay, 4, 0, Math.PI * 2);
      ctx.fill();

      // Systemic Aorta Pulse (Descending to Limbs)
      const day = (cy - 50) + frac * 250;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(cx + 15, day, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Venous Inflow (Returning to Heart)
      const vry = (cy + 240) - frac * 250;
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(cx - 25, vry, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Right Panel: 3 Essential Components & Capillary Exchange Matrix
    const rightX = leftW + 10;
    const rightW = w - rightX - 40;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.roundRect(rightX, 95, rightW, h - 125, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText('THE THREE PILLARS OF CIRCULATION', rightX + 25, 135);

    // Component Card 1: The Pump
    const cardY1 = 160;
    ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
    ctx.roundRect(rightX + 20, cardY1, rightW - 40, 95, 10);
    ctx.fill();
    ctx.fillStyle = '#f87171';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText('1. THE PUMP: The Muscular Heart', rightX + 35, cardY1 + 30);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText('• Four-chambered muscular organ beating ~100,000 times/day', rightX + 35, cardY1 + 55);
    ctx.fillText('• Propels over 2,000 gallons (7,500 L) of blood daily through body', rightX + 35, cardY1 + 78);

    // Component Card 2: The Highway
    const cardY2 = 270;
    ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
    ctx.roundRect(rightX + 20, cardY2, rightW - 40, 95, 10);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText('2. THE HIGHWAY: Vascular Network', rightX + 35, cardY2 + 30);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText('• Arteries (elastic high-pressure) ➔ Arterioles ➔ Capillaries', rightX + 35, cardY2 + 55);
    ctx.fillText('• Capillaries ➔ Venules ➔ Veins (one-way valves preventing pooling)', rightX + 35, cardY2 + 78);

    // Component Card 3: The Transport Fluid
    const cardY3 = 380;
    ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
    ctx.roundRect(rightX + 20, cardY3, rightW - 40, 95, 10);
    ctx.fill();
    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText('3. THE TRANSPORT FLUID: Blood', rightX + 35, cardY3 + 30);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText('• Erythrocytes (RBCs carry O₂ via Hemoglobin)', rightX + 35, cardY3 + 55);
    ctx.fillText('• Leukocytes (Immune defense) + Platelets (Clotting) + Plasma fluid', rightX + 35, cardY3 + 78);

    // Capillary Micro-Exchange Summary Box
    const boxY = 495;
    ctx.fillStyle = 'rgba(6, 78, 59, 0.6)';
    ctx.roundRect(rightX + 20, boxY, rightW - 40, 115, 10);
    ctx.fill();
    ctx.strokeStyle = '#10b981';
    ctx.stroke();

    ctx.fillStyle = '#6ee7b7';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.fillText('CAPILLARY EXCHANGE PRINCIPLE:', rightX + 35, boxY + 28);
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText('Thin single-cell endothelia permit rapid diffusion:', rightX + 35, boxY + 54);
    ctx.fillStyle = '#a7f3d0';
    ctx.fillText('• IN: Oxygen (O₂) & Glucose delivered to cellular mitochondria', rightX + 35, boxY + 78);
    ctx.fillText('• OUT: Carbon Dioxide (CO₂) & Metabolic waste picked up for excretion', rightX + 35, boxY + 100);

    // Milestone Progress Footer
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText('TOPIC STATUS: Point 1 Overview Complete · Progressing to Point 2: Parts of the Heart', rightX + 25, h - 50);
  }

  // =========================================================================
  // POINT 2 (100-200s): ANATOMICAL PARTS OF THE HUMAN HEART (DIAGRAM WITH LABELS)
  // =========================================================================
  renderPoint2PartsOfHeart(ctx, w, h, t, lectureTimer) {
    const leftW = 1040; // Expand width to give ample room for labeled callout badges

    // Left Panel: Labeled Anatomical Cross-Section Diagram
    ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
    ctx.roundRect(40, 95, leftW - 60, h - 125, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.stroke();

    // Determine current sub-topic focus based on lecture timer
    let subTopic = 'chambers'; // 100-125s
    let subTopicTitle = 'THE 4 HOLLOW CHAMBERS & SEGREGATED CIRCULATION';
    if (lectureTimer >= 175) {
      subTopic = 'vessels'; // 175-200s
      subTopicTitle = 'THE 4 GREAT VESSELS & "LUB-DUB" VALVE ACOUSTICS';
    } else if (lectureTimer >= 150) {
      subTopic = 'valves'; // 150-175s
      subTopicTitle = 'THE 4 ONE-WAY CARDIAC VALVES & CHORDAE TENDINEAE';
    } else if (lectureTimer >= 125) {
      subTopic = 'myocardium'; // 125-150s
      subTopicTitle = 'LEFT VENTRICLE 3× MYOCARDIUM WALL THICKNESS';
    }

    // Top Banner inside Left Panel
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText('ANATOMICAL HEART CROSS-SECTION · LABELED ARCHITECTURE', 65, 130);
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText(`● ACTIVE FOCUS: ${subTopicTitle}`, 65, 155);

    // Coordinate Center for Heart Diagram
    const cx = 510;
    const cy = 460;

    // Heartbeat Rhythm & Valve Cycle
    const bpm = this.heartRate || 72;
    const beatPeriod = 60 / bpm;
    const cycleT = (t % beatPeriod) / beatPeriod; // 0 to 1
    const isSystole = cycleT < 0.35; // Ventricular contraction phase
    const pulseScale = 1.0 + Math.sin(t * (bpm / 60) * Math.PI * 2) * 0.035;
    const lvScale = isSystole ? 0.94 : 1.05;
    const atriaScale = isSystole ? 1.06 : 0.95;

    // Helper: Draw Callout with Leader Line & Rounded Label Badge
    const drawCallout = (ax, ay, lx, ly, label, sublabel, color, isActive = false) => {
      // Connecting Leader Line
      ctx.strokeStyle = isActive ? '#fde047' : 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = isActive ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      const midX = (ax + lx) / 2;
      ctx.lineTo(midX, ly);
      ctx.lineTo(lx, ly);
      ctx.stroke();

      // Anchor Point Dot on Organ Structure
      ctx.fillStyle = isActive ? '#fde047' : color;
      ctx.beginPath();
      ctx.arc(ax, ay, isActive ? 5.5 : 4, 0, Math.PI * 2);
      ctx.fill();
      if (isActive) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Label Badge
      ctx.font = isActive ? 'bold 13px system-ui, sans-serif' : 'bold 12px system-ui, sans-serif';
      const labelW = Math.max(ctx.measureText(label).width, ctx.measureText(sublabel || '').width) + 20;
      const badgeH = sublabel ? 36 : 24;
      const badgeX = lx > ax ? lx : lx - labelW;
      const badgeY = ly - badgeH / 2;

      ctx.fillStyle = isActive ? 'rgba(30, 41, 59, 0.95)' : 'rgba(15, 23, 42, 0.88)';
      ctx.roundRect(badgeX, badgeY, labelW, badgeH, 6);
      ctx.fill();
      ctx.strokeStyle = isActive ? '#fde047' : color;
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.stroke();

      ctx.fillStyle = isActive ? '#fef08a' : '#ffffff';
      ctx.fillText(label, badgeX + 10, badgeY + (sublabel ? 15 : 17));
      if (sublabel) {
        ctx.fillStyle = isActive ? '#ffffff' : color;
        ctx.font = '10px system-ui, sans-serif';
        ctx.fillText(sublabel, badgeX + 10, badgeY + 29);
      }
    };

    // 1. Render Great Vessels in the background
    // Superior Vena Cava (Deoxygenated inflow into RA)
    ctx.fillStyle = '#0284c7';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cx - 165, cy - 250, 42, 140, 10);
    ctx.fill();
    ctx.stroke();

    // Inferior Vena Cava (Deoxygenated inflow from lower body)
    ctx.beginPath();
    ctx.roundRect(cx - 175, cy + 80, 42, 130, 10);
    ctx.fill();
    ctx.stroke();

    // Aortic Root & Arch (Curving up and over to the systemic body)
    ctx.fillStyle = '#dc2626';
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy - 80);
    ctx.bezierCurveTo(cx - 15, cy - 220, cx + 110, cy - 270, cx + 120, cy - 140);
    ctx.lineTo(cx + 80, cy - 140);
    ctx.bezierCurveTo(cx + 70, cy - 220, cx + 25, cy - 170, cx + 25, cy - 80);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 3 Aortic Arch Arterial Branches (Brachiocephalic, Carotid, Subclavian)
    const branchCoords = [cx + 25, cx + 55, cx + 85];
    for (const bx of branchCoords) {
      ctx.beginPath();
      ctx.roundRect(bx - 7, cy - 265, 14, 45, 4);
      ctx.fill();
      ctx.stroke();
    }

    // Pulmonary Trunk & Arteries (Crossing in front of Aorta toward Lungs)
    ctx.fillStyle = '#0369a1';
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 45, cy - 65);
    ctx.lineTo(cx - 35, cy - 175);
    ctx.lineTo(cx - 120, cy - 200); // Left pulmonary artery
    ctx.lineTo(cx - 120, cy - 175);
    ctx.lineTo(cx - 15, cy - 155);
    ctx.lineTo(cx + 45, cy - 175); // Right pulmonary artery
    ctx.lineTo(cx + 45, cy - 195);
    ctx.lineTo(cx - 15, cy - 175);
    ctx.lineTo(cx - 20, cy - 65);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Pulmonary Veins (Four inlets into Left Atrium)
    ctx.fillStyle = '#e11d48';
    ctx.strokeStyle = '#fda4af';
    ctx.lineWidth = 2;
    // Right Pulmonary Veins
    ctx.fillRect(cx + 150, cy - 140, 48, 16);
    ctx.strokeRect(cx + 150, cy - 140, 48, 16);
    ctx.fillRect(cx + 150, cy - 115, 48, 16);
    ctx.strokeRect(cx + 150, cy - 115, 48, 16);

    // 2. Render Heart Myocardium Silhouette & Chambers
    // Thick Left Ventricular Myocardium Outer Wall (12-15mm)
    const isMyoActive = subTopic === 'myocardium';
    ctx.fillStyle = isMyoActive ? 'rgba(225, 29, 72, 0.45)' : 'rgba(159, 18, 57, 0.35)';
    ctx.strokeStyle = isMyoActive ? '#fde047' : '#e11d48';
    ctx.lineWidth = isMyoActive ? 12 : 8; // Highlight the 3x thicker muscular wall!
    ctx.beginPath();
    ctx.ellipse(cx + 65, cy + 85, 125 * lvScale, 115 * lvScale, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Right Ventricle Outer Wall (Thin 3-5mm)
    ctx.fillStyle = 'rgba(2, 132, 199, 0.25)';
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(cx - 85, cy + 85, 105 * lvScale, 100 * lvScale, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Right Atrium Chamber (Thin wall, Deox blue)
    const isChamberActive = subTopic === 'chambers';
    ctx.fillStyle = '#0f3a69';
    ctx.strokeStyle = isChamberActive ? '#38bdf8' : '#0284c7';
    ctx.lineWidth = isChamberActive ? 4 : 2;
    ctx.beginPath();
    ctx.ellipse(cx - 105, cy - 75, 75 * atriaScale, 65 * atriaScale, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Left Atrium Chamber (Receiving Oxygenated red)
    ctx.fillStyle = '#6b1111';
    ctx.strokeStyle = isChamberActive ? '#f43f5e' : '#b91c1c';
    ctx.lineWidth = isChamberActive ? 4 : 2;
    ctx.beginPath();
    ctx.ellipse(cx + 105, cy - 75, 75 * atriaScale, 65 * atriaScale, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Right Ventricle Cavity (Pumping to lungs)
    ctx.fillStyle = '#082f49';
    ctx.beginPath();
    ctx.ellipse(cx - 75, cy + 75, 70 * lvScale, 70 * lvScale, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Left Ventricle Cavity (Thick muscular core)
    ctx.fillStyle = '#4c0519';
    ctx.beginPath();
    ctx.ellipse(cx + 60, cy + 75, 65 * lvScale, 68 * lvScale, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Interventricular Septum (Solid dividing muscular wall)
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cx - 16, cy - 40, 32, 230, 8);
    ctx.fill();
    ctx.stroke();

    // 3. Render The 4 Valves with Dynamic Action & Chordae Tendineae
    const isValvesActive = subTopic === 'valves';
    const valveColor = isValvesActive ? '#fde047' : '#ffffff';

    // A. Tricuspid Valve (Between RA & RV)
    const triY = cy - 10;
    ctx.strokeStyle = valveColor;
    ctx.lineWidth = isValvesActive ? 4 : 3;
    ctx.beginPath();
    if (isSystole) {
      // Flaps closed during systole (Prevent backflow)
      ctx.moveTo(cx - 125, triY);
      ctx.lineTo(cx - 75, triY);
    } else {
      // Flaps open downward during diastole
      ctx.moveTo(cx - 125, triY);
      ctx.lineTo(cx - 105, triY + 18);
      ctx.moveTo(cx - 75, triY);
      ctx.lineTo(cx - 95, triY + 18);
    }
    ctx.stroke();

    // Chordae Tendineae Strings for Tricuspid
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.65)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 105, triY + 10);
    ctx.lineTo(cx - 100, triY + 65);
    ctx.moveTo(cx - 95, triY + 10);
    ctx.lineTo(cx - 75, triY + 65);
    ctx.stroke();
    // Papillary Muscle on RV wall
    ctx.fillStyle = '#0369a1';
    ctx.beginPath();
    ctx.arc(cx - 88, triY + 70, 8, 0, Math.PI * 2);
    ctx.fill();

    // B. Bicuspid / Mitral Valve (Between LA & LV)
    const mitY = cy - 10;
    ctx.strokeStyle = valveColor;
    ctx.lineWidth = isValvesActive ? 4 : 3;
    ctx.beginPath();
    if (isSystole) {
      // Flaps closed tightly during systole
      ctx.moveTo(cx + 70, mitY);
      ctx.lineTo(cx + 120, mitY);
    } else {
      // Flaps open downward into LV
      ctx.moveTo(cx + 70, mitY);
      ctx.lineTo(cx + 88, mitY + 18);
      ctx.moveTo(cx + 120, mitY);
      ctx.lineTo(cx + 102, mitY + 18);
    }
    ctx.stroke();

    // Chordae Tendineae Strings for Mitral Valve
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.65)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx + 88, mitY + 10);
    ctx.lineTo(cx + 78, mitY + 65);
    ctx.moveTo(cx + 102, mitY + 10);
    ctx.lineTo(cx + 98, mitY + 65);
    ctx.stroke();
    // Papillary Muscle on LV wall
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.arc(cx + 88, mitY + 70, 9, 0, Math.PI * 2);
    ctx.fill();

    // C. Pulmonary Semilunar Valve (Root of Pulmonary Trunk)
    ctx.strokeStyle = isValvesActive ? '#38bdf8' : '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx - 30, cy - 70, 12, Math.PI * 0.2, Math.PI * 0.8, isSystole);
    ctx.stroke();

    // D. Aortic Semilunar Valve (Root of Aorta)
    ctx.strokeStyle = isValvesActive ? '#f43f5e' : '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx + 12, cy - 80, 12, Math.PI * 0.2, Math.PI * 0.8, isSystole);
    ctx.stroke();

    // 4. Draw Comprehensive Callout Labels with Connecting Leader Lines
    // Left-Side Callouts (Deoxygenated Structures)
    drawCallout(cx - 145, cy - 210, 80, cy - 210, 'SUPERIOR VENA CAVA (SVC)', 'Returns deox blood from upper body', '#38bdf8', subTopic === 'vessels');
    drawCallout(cx - 105, cy - 75, 80, cy - 90, 'RIGHT ATRIUM (RA)', 'Thin receiving chamber (2-3mm wall)', '#60a5fa', subTopic === 'chambers');
    drawCallout(cx - 95, cy - 10, 80, cy - 20, 'TRICUSPID VALVE (AV)', '3 Cusps; stops backflow into RA', '#fbbf24', subTopic === 'valves');
    drawCallout(cx - 90, cy + 45, 80, cy + 50, 'CHORDAE TENDINEAE', 'Fibrous cords tethered to papillary muscles', '#fde047', subTopic === 'valves');
    drawCallout(cx - 75, cy + 95, 80, cy + 120, 'RIGHT VENTRICLE (RV)', 'Pumps to lungs (Wall: 3-5mm, 25 mmHg)', '#38bdf8', subTopic === 'chambers');
    drawCallout(cx - 155, cy + 150, 80, cy + 185, 'INFERIOR VENA CAVA (IVC)', 'Returns deox blood from viscera & limbs', '#38bdf8', subTopic === 'vessels');

    // Center Callouts
    drawCallout(cx + 55, cy - 235, cx - 10, cy - 280, 'AORTIC ARCH (3 Branches)', 'Systemic arterial output at ~120 mmHg', '#ef4444', subTopic === 'vessels');
    drawCallout(cx - 30, cy - 180, cx - 30, cy - 240, 'PULMONARY TRUNK / ARTERY', 'Carries deoxygenated blood to both lungs', '#38bdf8', subTopic === 'vessels');
    drawCallout(cx, cy + 160, cx - 10, cy + 265, 'INTERVENTRICULAR SEPTUM', 'Thick solid muscle dividing right & left hearts', '#94a3b8', subTopic === 'chambers');
    drawCallout(cx + 25, cy + 205, cx + 180, cy + 265, 'CARDIAC APEX', 'Directed anteriorly, inferiorly, and to left', '#e2e8f0', false);

    // Right-Side Callouts (Oxygenated Structures & Thick LV Wall)
    drawCallout(cx + 170, cy - 130, leftW - 85, cy - 145, 'PULMONARY VEINS (4 Inlets)', 'Oxygenated blood return from lungs', '#f43f5e', subTopic === 'vessels');
    drawCallout(cx + 105, cy - 75, leftW - 85, cy - 80, 'LEFT ATRIUM (LA)', 'Receives oxygen-rich blood (Wall: 3mm)', '#f87171', subTopic === 'chambers');
    drawCallout(cx + 95, cy - 10, leftW - 85, cy - 15, 'MITRAL / BICUSPID VALVE', '2 Cusps; stops backflow during systole', '#fbbf24', subTopic === 'valves');
    drawCallout(cx + 12, cy - 75, leftW - 85, cy + 45, 'AORTIC SEMILUNAR VALVE', 'Pocket cusps snap shut in diastole', '#f43f5e', subTopic === 'valves');
    drawCallout(cx + 85, cy + 95, leftW - 85, cy + 115, 'LEFT VENTRICLE (LV)', '★ Wall: 12-15mm (3× THICKER THAN RV!)', '#ef4444', subTopic === 'myocardium');
    drawCallout(cx + 155, cy + 115, leftW - 85, cy + 175, 'MYOCARDIUM (MUSCLE)', 'Generates 120 mmHg systemic systolic force', '#fde047', subTopic === 'myocardium');

    // =========================================================================
    // Right Panel: Dynamic Pedagogical Breakdown & Live Acoustics / Telemetry
    // =========================================================================
    const rightX = leftW + 10;
    const rightW = w - rightX - 40;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
    ctx.roundRect(rightX, 95, rightW, h - 125, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.stroke();

    // Right Panel Header
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText('ANATOMICAL ANALYSIS & HEMODYNAMICS', rightX + 25, 130);

    // Dynamic Focus Card 1
    const cardY1 = 150;
    ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
    ctx.roundRect(rightX + 20, cardY1, rightW - 40, 140, 12);
    ctx.fill();
    ctx.strokeStyle = subTopic === 'myocardium' ? '#fde047' : 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = subTopic === 'myocardium' ? '#fde047' : '#38bdf8';
    ctx.font = 'bold 17px system-ui, sans-serif';
    ctx.fillText('1. Why Is the Left Ventricle 3× Thicker?', rightX + 35, cardY1 + 30);

    ctx.fillStyle = '#ffffff';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText('• RV pumps to LUNGS: Low resistance circuit (~25 mmHg pressure).', rightX + 35, cardY1 + 58);
    ctx.fillText('• LV pumps to ENTIRE BODY: High systemic resistance (~120 mmHg).', rightX + 35, cardY1 + 82);
    ctx.fillStyle = '#fda4af';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillText('★ Requires 12-15mm of dense cardiac muscle to prevent heart failure!', rightX + 35, cardY1 + 110);

    // Wall Thickness Comparison Bar Gauge
    const barY = cardY1 + 160;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.roundRect(rightX + 20, barY, rightW - 40, 125, 10);
    ctx.fill();
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.fillText('MYOCARDIAL WALL THICKNESS COMPARISON:', rightX + 35, barY + 26);

    // LV Bar
    ctx.fillStyle = '#f87171';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('Left Ventricle (LV) : 14.0 mm', rightX + 35, barY + 52);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(rightX + 265, barY + 40, 240, 14);

    // RV Bar
    ctx.fillStyle = '#60a5fa';
    ctx.fillText('Right Ventricle (RV):  4.5 mm (3× Thinner)', rightX + 35, barY + 76);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(rightX + 265, barY + 64, 80, 14);

    // Atria Bar
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Left/Right Atria    :  2.8 mm (Receiving)', rightX + 35, barY + 100);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(rightX + 265, barY + 88, 50, 14);

    // Valve Mechanics & Heart Sounds Box
    const soundY = barY + 145;
    ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
    ctx.roundRect(rightX + 20, soundY, rightW - 40, 115, 12);
    ctx.fill();
    ctx.strokeStyle = subTopic === 'valves' || subTopic === 'vessels' ? '#fde047' : 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.fillText('2. The "Lub-Dub" Acoustic Valve Closures:', rightX + 35, soundY + 28);

    // "LUB" Indicator Pill
    const isLub = isSystole;
    ctx.fillStyle = isLub ? '#fde047' : 'rgba(254, 240, 138, 0.2)';
    ctx.roundRect(rightX + 35, soundY + 45, 140, 42, 8);
    ctx.fill();
    ctx.fillStyle = isLub ? '#0f172a' : '#fef08a';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText('S₁: "LUB"', rightX + 68, soundY + 72);

    // "DUB" Indicator Pill
    const isDub = !isSystole;
    ctx.fillStyle = isDub ? '#38bdf8' : 'rgba(56, 189, 248, 0.2)';
    ctx.roundRect(rightX + 190, soundY + 45, 140, 42, 8);
    ctx.fill();
    ctx.fillStyle = isDub ? '#0f172a' : '#7dd3fc';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText('S₂: "DUB"', rightX + 225, soundY + 72);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText('• LUB = Tricuspid & Mitral AV valves snap closed at start of systole', rightX + 35, soundY + 102);

    // Live Telemetry Bar across bottom of right panel
    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(`● TELEMETRY: HR ${bpm} BPM | BP ${this.bloodPressure} | SV ${this.strokeVolume}mL | CO ${this.cardiacOutput} L/min`, rightX + 25, h - 50);
  }

  // =========================================================================
  // POINT 3 (200-300s): THE JOURNEY OF BLOOD IN THE CIRCULATORY SYSTEM
  // =========================================================================
  renderPoint3JourneyOfBlood(ctx, w, h, t, lectureTimer) {
    const leftW = 920;

    // Left Panel: Dual Circulation Figure-8 Circuit
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.roundRect(40, 95, leftW - 60, h - 125, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText('DUAL CIRCULATION: PULMONARY & SYSTEMIC FIGURE-8 CIRCUITS', 65, 135);

    const cx = 450;
    const cy = 440;

    // Top Loop: Pulmonary Circuit (To Lungs)
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 130, 160, 110, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Bottom Loop: Systemic Circuit (To Body Organs)
    ctx.beginPath();
    ctx.ellipse(cx, cy + 130, 170, 120, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Central Heart Junction
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(cx - 75, cy - 50, 150, 100);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.strokeRect(cx - 75, cy - 50, 150, 100);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.fillText('CENTRAL HEART', cx - 60, cy + 5);

    // Lungs Node (Top)
    ctx.fillStyle = '#0284c7';
    ctx.roundRect(cx - 100, cy - 275, 200, 60, 12);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.fillText('LUNGS (GAS EXCHANGE)', cx - 85, cy - 245);
    ctx.fillStyle = '#bbf7d0';
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText('Drop CO₂ ➔ Absorb O₂', cx - 60, cy - 225);

    // Systemic Organs Node (Bottom)
    ctx.fillStyle = '#991b1b';
    ctx.roundRect(cx - 110, cy + 225, 220, 60, 12);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.fillText('SYSTEMIC TISSUES & ORGANS', cx - 95, cy + 252);
    ctx.fillStyle = '#fecaca';
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText('Deliver O₂ & Nutrients ➔ Absorb CO₂', cx - 85, cy + 272);

    // Dynamic Flow Particles traversing the Figure-8 circuit
    const speed = 1.6;
    for (let i = 0; i < 16; i++) {
      const angle = (t * speed + (i * Math.PI) / 8) % (Math.PI * 2);

      // Pulmonary Loop Particles
      const px = cx + Math.cos(angle) * 160;
      const py = cy - 130 + Math.sin(angle) * 110;
      // Blue on right (going to lungs), Red on left (returning from lungs)
      ctx.fillStyle = Math.cos(angle) > 0 ? '#38bdf8' : '#ef4444';
      ctx.beginPath();
      ctx.arc(px, py, 7, 0, Math.PI * 2);
      ctx.fill();

      // Systemic Loop Particles
      const sx = cx + Math.cos(-angle) * 170;
      const sy = cy + 130 + Math.sin(-angle) * 120;
      // Red on left (going to body), Blue on right (returning via vena cava)
      ctx.fillStyle = Math.cos(-angle) < 0 ? '#ef4444' : '#38bdf8';
      ctx.beginPath();
      ctx.arc(sx, sy, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Right Panel: 8-Step Complete Journey of Blood Tracker
    const rightX = leftW + 10;
    const rightW = w - rightX - 40;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.roundRect(rightX, 95, rightW, h - 125, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText('THE 8-STEP CHRONOLOGICAL BLOOD PATHWAY', rightX + 25, 135);

    const steps = [
      { num: '1', title: 'Body ➔ Vena Cava ➔ Right Atrium', deox: true },
      { num: '2', title: 'Right Atrium ➔ Tricuspid Valve ➔ Right Ventricle', deox: true },
      { num: '3', title: 'Right Ventricle ➔ Pulmonary SL Valve ➔ Pulmonary Trunk', deox: true },
      { num: '4', title: 'Pulmonary Capillaries (Lungs): CO₂ released, O₂ loaded', highlight: true },
      { num: '5', title: 'Lungs ➔ Four Pulmonary Veins ➔ Left Atrium', ox: true },
      { num: '6', title: 'Left Atrium ➔ Bicuspid (Mitral) Valve ➔ Left Ventricle', ox: true },
      { num: '7', title: 'Left Ventricle ➔ Aortic SL Valve ➔ Systemic Aorta', ox: true },
      { num: '8', title: 'Systemic Arterial Tree ➔ Capillaries to all cells ➔ Loop restarts', highlight: true },
    ];

    const currentStepIndex = Math.floor((t * 0.8) % steps.length);

    steps.forEach((st, idx) => {
      const sy = 165 + idx * 56;
      const isActive = idx === currentStepIndex;

      ctx.fillStyle = isActive ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.75)';
      ctx.roundRect(rightX + 20, sy, rightW - 40, 48, 8);
      ctx.fill();
      if (isActive) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Step Number Badge
      ctx.fillStyle = st.deox ? '#38bdf8' : st.ox ? '#f87171' : '#4ade80';
      ctx.beginPath();
      ctx.arc(rightX + 45, sy + 24, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 15px system-ui, sans-serif';
      ctx.fillText(st.num, rightX + 40, sy + 29);

      // Step Description
      ctx.fillStyle = isActive ? '#ffffff' : '#cbd5e1';
      ctx.font = isActive ? 'bold 15px system-ui, sans-serif' : '14px system-ui, sans-serif';
      ctx.fillText(st.title, rightX + 75, sy + 30);
    });

    // Milestone Completion Ready Banner
    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText('★ 5-MINUTE CURRICULUM FINISHED · PREPARING FOR WORK SHEET ASSESSMENT', rightX + 25, h - 35);
  }

  // =========================================================================
  // LIVE ASSESSMENT SCREEN (SYNCED TO ALL STUDENT LAPTOPS & TABLETS)
  // =========================================================================
  renderAssessmentScreen(ctx, w, h, t, questionIndex = 0, feedback = null) {
    const q = HEART_ANATOMY_QUIZ[questionIndex] || HEART_ANATOMY_QUIZ[0];
    const totalQ = HEART_ANATOMY_QUIZ.length;
    const storeState = useClassroomStore.getState();
    const activeStudent = storeState.activeStudentAnswer;
    const leftW = 1180;

    // Left Panel: Active Question & Interactive Answer Cards
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.roundRect(40, 95, leftW - 60, h - 125, 16);
    ctx.fill();
    ctx.strokeStyle = q.type === 'graph_builder' ? '#38bdf8' : q.type === 'open_ended' ? '#4ade80' : '#f59e0b';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Question Number & Type Badge
    ctx.fillStyle = q.type === 'graph_builder' ? '#0284c7' : q.type === 'open_ended' ? '#059669' : '#f59e0b';
    ctx.roundRect(65, 115, 240, 32, 6);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.fillText(`QUESTION ${questionIndex + 1} OF ${totalQ}`, 78, 137);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 14px system-ui, sans-serif';
    const typeLabel =
      q.type === 'open_ended'
        ? 'CLINICAL INQUIRY · OPEN-ENDED PHYSIOLOGY'
        : q.type === 'graph_builder'
        ? 'HEMODYNAMICS PLOTTER · DYNAMIC GRAPH BUILDER'
        : 'CARDIOLOGY PRACTICUM · LIVE DEVICE DISPATCH';
    ctx.fillText(typeLabel, 325, 137);

    // Active Student Respondent Banner (When a student answers, show their name prominently!)
    const respondentName = activeStudent?.studentName || q.studentName;
    const respondentSeat = activeStudent?.seatId || q.studentSeat;
    if (respondentName) {
      ctx.fillStyle = 'rgba(30, 41, 59, 0.95)';
      ctx.roundRect(65, 160, leftW - 110, 52, 8);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(95, 186, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.fillText('👤', 88, 191);

      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 15px system-ui, sans-serif';
      ctx.fillText(`STUDENT RESPONDENT: ${respondentName} (${respondentSeat})`, 125, 182);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px system-ui, sans-serif';
      const studentStatusMsg =
        q.type === 'open_ended'
          ? 'Submitted clinical reasoning via desk terminal'
          : q.type === 'graph_builder'
          ? 'Plotted dynamic pressure curve on interactive screen'
          : 'Answered via classroom interactive terminal';
      ctx.fillText(studentStatusMsg, 125, 201);
    }

    // Question Text (Wrapped across multiple lines)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px system-ui, sans-serif';
    const words = q.question.split(' ');
    let line = '';
    let lineY = respondentName ? 245 : 195;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > (leftW - 140) && n > 0) {
        ctx.fillText(line, 65, lineY);
        line = words[n] + ' ';
        lineY += 32;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 65, lineY);

    // =========================================================================
    // BRANCH BY QUESTION TYPE:
    // 1. Multiple Choice (Q1, Q2, Q3)
    // 2. Open-Ended Clinical Inquiry (Q4)
    // 3. Dynamic Hemodynamics Graph Builder (Q5)
    // =========================================================================
    if (q.type === 'open_ended') {
      // -----------------------------------------------------------------------
      // QUESTION 4: OPEN-ENDED CLINICAL REASONING PRESENTATION
      // -----------------------------------------------------------------------
      const boxY = lineY + 25;
      ctx.fillStyle = 'rgba(6, 78, 59, 0.4)';
      ctx.roundRect(65, boxY, leftW - 110, 150, 10);
      ctx.fill();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.fillText(`CLINICAL REASONING SUBMISSION · ${respondentName} (${respondentSeat})`, 85, boxY + 32);

      ctx.fillStyle = '#ffffff';
      ctx.font = '15px system-ui, sans-serif';
      const studentAns = activeStudent?.answerText || q.studentAnswerText || q.sampleAnswer;
      // Wrap student answer text
      const ansWords = studentAns.split(' ');
      let aLine = '';
      let aY = boxY + 62;
      for (let m = 0; m < ansWords.length; m++) {
        const testAns = aLine + ansWords[m] + ' ';
        if (ctx.measureText(testAns).width > (leftW - 160) && m > 0) {
          ctx.fillText(aLine, 85, aY);
          aLine = ansWords[m] + ' ';
          aY += 26;
        } else {
          aLine = testAns;
        }
      }
      ctx.fillText(aLine, 85, aY);

      // Laplace's Law & Hemodynamics Analysis Cards
      const mechY = boxY + 165;
      const cardW = (leftW - 130) / 2;

      // Card 1: Laplace's Law
      ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
      ctx.roundRect(65, mechY, cardW, 140, 8);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.fillText("LAPLACE'S LAW OF WALL STRESS:", 80, mechY + 28);
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('Wall Stress (σ) = (P · r) / (2 · h)', 80, mechY + 56);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '12px system-ui, sans-serif';
      ctx.fillText('• P = Systolic Pressure (~160 mmHg)', 80, mechY + 82);
      ctx.fillText('• h = Left Ventricle Wall Thickness (12➔18mm)', 80, mechY + 104);
      ctx.fillText('• Myocytes hypertrophy to restore normal σ', 80, mechY + 124);

      // Card 2: Afterload Asymmetry
      ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
      ctx.roundRect(75 + cardW, mechY, cardW, 140, 8);
      ctx.fill();
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.fillText('HEMODYNAMIC AFTERLOAD ASYMMETRY:', 90 + cardW, mechY + 28);
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px system-ui, sans-serif';
      ctx.fillText('• Left Ventricle: Systemic afterload (140-180 mmHg)', 90 + cardW, mechY + 56);
      ctx.fillText('• Right Ventricle: Pulmonary circuit remains low (~25 mmHg)', 90 + cardW, mechY + 80);
      ctx.fillStyle = '#4ade80';
      ctx.fillText('• Result: Concentric LV Hypertrophy, RV completely spared!', 90 + cardW, mechY + 106);
      ctx.fillStyle = '#fef08a';
      ctx.fillText('✓ CLINICALLY VERIFIED PHYSIOLOGY RATIONALE', 90 + cardW, mechY + 128);

    } else if (q.type === 'graph_builder') {
      // -----------------------------------------------------------------------
      // QUESTION 5: DYNAMIC CARDIOVASCULAR HEMODYNAMICS GRAPH BUILDER
      // -----------------------------------------------------------------------
      const gx = 80;
      const gy = lineY + 25;
      const gw = leftW - 140;
      const gh = 320;

      // Graph Container Canvas
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.roundRect(gx, gy, gw, gh, 10);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Graph Title
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 15px system-ui, sans-serif';
      ctx.fillText('BLOOD PRESSURE GRADIENT ACROSS VASCULAR HIGHWAY (mmHg)', gx + 20, gy + 28);

      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`PLOTTED BY: ${respondentName} (${respondentSeat})`, gx + gw - 330, gy + 28);

      // Y-Axis labels & Grid lines (0 to 140 mmHg)
      const plotX = gx + 60;
      const plotY = gy + 50;
      const plotW = gw - 80;
      const plotH = gh - 95;

      const yTicks = [
        { val: 140, p: 0 },
        { val: 120, p: 0.143 },
        { val: 100, p: 0.286 },
        { val: 80, p: 0.429 },
        { val: 60, p: 0.571 },
        { val: 40, p: 0.714 },
        { val: 20, p: 0.857 },
        { val: 0, p: 1.0 },
      ];

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px monospace';
      ctx.textAlign = 'right';

      yTicks.forEach((yt) => {
        const curY = plotY + yt.p * plotH;
        ctx.beginPath();
        ctx.moveTo(plotX, curY);
        ctx.lineTo(plotX + plotW, curY);
        ctx.stroke();
        ctx.fillText(`${yt.val}`, plotX - 8, curY + 4);
      });
      ctx.textAlign = 'left';

      // X-Axis Segments (6 Vascular highway stations)
      const stations = [
        { name: 'Aorta', xP: 0.08, pSys: 120, pDia: 80, mean: 93 },
        { name: 'Arteries', xP: 0.25, pSys: 115, pDia: 75, mean: 90 },
        { name: 'Arterioles', xP: 0.46, pSys: 85, pDia: 35, mean: 50, isSteepest: true },
        { name: 'Capillaries', xP: 0.66, pSys: 35, pDia: 15, mean: 20 },
        { name: 'Venules', xP: 0.82, pSys: 15, pDia: 8, mean: 10 },
        { name: 'Vena Cava', xP: 0.95, pSys: 8, pDia: 4, mean: 5 },
      ];

      // Draw Arteriolar Resistance Glow Zone
      const artX1 = plotX + 0.35 * plotW;
      const artX2 = plotX + 0.55 * plotW;
      ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
      ctx.fillRect(artX1, plotY, artX2 - artX1, plotH);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.strokeRect(artX1, plotY, artX2 - artX1, plotH);

      // Station Labels on X-axis
      stations.forEach((st) => {
        const sx = plotX + st.xP * plotW;
        ctx.fillStyle = st.isSteepest ? '#f87171' : '#cbd5e1';
        ctx.font = st.isSteepest ? 'bold 12px system-ui, sans-serif' : '11px system-ui, sans-serif';
        ctx.fillText(st.name, sx - 22, plotY + plotH + 20);

        // Tick mark
        ctx.strokeStyle = '#475569';
        ctx.beginPath();
        ctx.moveTo(sx, plotY + plotH);
        ctx.lineTo(sx, plotY + plotH + 6);
        ctx.stroke();
      });

      // Animated Pulsatile Pressure Waveform (Systolic & Diastolic)
      const pulseT = t * 6;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.beginPath();

      // Plot point-by-point curve
      const totalSteps = 120;
      for (let i = 0; i <= totalSteps; i++) {
        const prog = i / totalSteps;
        const cxPoint = plotX + prog * plotW;
        let pVal = 0;

        if (prog < 0.3) {
          // Aorta to Arteries: Oscillating between ~120 and 80 mmHg
          const osc = Math.sin(pulseT + prog * 25) * 20;
          pVal = 95 + osc;
        } else if (prog < 0.58) {
          // Arterioles: Steep precipitously plunging drop from 85 down to 35
          const dropRatio = (prog - 0.3) / 0.28;
          const osc = Math.sin(pulseT + prog * 20) * (15 * (1 - dropRatio));
          pVal = 85 - dropRatio * 50 + osc;
        } else if (prog < 0.75) {
          // Capillaries: Smooth non-pulsatile diffusion zone 35 down to 15
          const capRatio = (prog - 0.58) / 0.17;
          pVal = 35 - capRatio * 20;
        } else {
          // Venules to Vena Cava: Low-pressure return 15 down to 4
          const venRatio = (prog - 0.75) / 0.25;
          pVal = 15 - venRatio * 11;
        }

        const cyPoint = plotY + ((140 - pVal) / 140) * plotH;
        if (i === 0) {
          ctx.moveTo(cxPoint, cyPoint);
        } else {
          ctx.lineTo(cxPoint, cyPoint);
        }
      }
      ctx.stroke();

      // Highlight the Steepest Arteriolar Resistance Drop with Callout Badge
      const calloutX = plotX + 0.46 * plotW;
      const calloutY = plotY + ((140 - 60) / 140) * plotH;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(calloutX, calloutY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Callout Banner
      ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
      ctx.roundRect(calloutX - 110, calloutY - 55, 230, 42, 6);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.fillText('★ STEEPEST PRESSURE DROP', calloutX - 98, calloutY - 37);
      ctx.fillStyle = '#fef08a';
      ctx.font = '11px monospace';
      ctx.fillText('85 ➔ 35 mmHg (~60% Total TPR)', calloutX - 98, calloutY - 20);

      // Traveling pulse particle along curve
      const particleProg = (t * 0.4) % 1.0;
      const px = plotX + particleProg * plotW;
      let particleP = 95;
      if (particleProg < 0.3) {
        particleP = 95 + Math.sin(pulseT + particleProg * 25) * 20;
      } else if (particleProg < 0.58) {
        const r = (particleProg - 0.3) / 0.28;
        particleP = 85 - r * 50;
      } else if (particleProg < 0.75) {
        particleP = 35 - ((particleProg - 0.58) / 0.17) * 20;
      } else {
        particleP = 15 - ((particleProg - 0.75) / 0.25) * 11;
      }
      const py = plotY + ((140 - particleP) / 140) * plotH;
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Graph Footer Explanation
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.fillText(
        '✓ CONCLUSION: Arteriolar smooth muscle constriction generates ~60% of TPR to dampen high pressure before capillary entry.',
        gx + 20,
        gy + gh - 12
      );

    } else {
      // -----------------------------------------------------------------------
      // QUESTIONS 1, 2, 3: MULTIPLE CHOICE OPTIONS
      // -----------------------------------------------------------------------
      const optStartY = lineY + 25;
      q.options.forEach((opt, idx) => {
        const oy = optStartY + idx * 70;
        const isCorrect = idx === q.correctIndex;

        // Card Background
        if (feedback) {
          if (isCorrect) {
            ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 2.5;
          } else {
            ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
          }
        } else {
          ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
          ctx.lineWidth = 1.5;
        }

        ctx.roundRect(65, oy, leftW - 110, 56, 10);
        ctx.fill();
        ctx.stroke();

        // Option Letter Badge
        const letter = String.fromCharCode(65 + idx);
        ctx.fillStyle = isCorrect && feedback ? '#10b981' : '#38bdf8';
        ctx.beginPath();
        ctx.arc(105, oy + 28, 17, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 17px system-ui, sans-serif';
        ctx.fillText(letter, 100, oy + 34);

        // Option Text
        ctx.fillStyle = isCorrect && feedback ? '#6ee7b7' : '#ffffff';
        ctx.font = '15px system-ui, sans-serif';
        const cleanOpt = opt.replace(/^[A-D]\.\s*/, '');
        ctx.fillText(cleanOpt, 138, oy + 34);

        if (isCorrect && feedback) {
          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 15px system-ui, sans-serif';
          ctx.fillText('✓ CORRECT', leftW - 160, oy + 34);
        }
      });

      // Classroom Status / Explanation Footer
      const footY = optStartY + 4 * 70 + 8;
      if (feedback) {
        ctx.fillStyle = 'rgba(6, 78, 59, 0.65)';
        ctx.roundRect(65, footY, leftW - 110, 65, 8);
        ctx.fill();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 14px system-ui, sans-serif';
        ctx.fillText('EXPLANATION:', 85, footY + 26);
        ctx.fillStyle = '#ffffff';
        ctx.font = '13px system-ui, sans-serif';
        ctx.fillText(q.explanation, 85, footY + 48);
      } else {
        ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
        ctx.roundRect(65, footY, leftW - 110, 65, 8);
        ctx.fill();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        let promptMsg = '🗣️ Sophia Garcia (Row 2, Seat 2) is raising hand to answer Option A!';
        if (questionIndex === 1) {
          promptMsg = '🤫 Dead Silence in Classroom... Ethan Vance mutters: "...bicuspid mitral valve...?"';
        } else if (questionIndex === 2) {
          promptMsg = '📢 Total Classroom Commotion! Students shouting enthusiastically: "SA Node! Option A!"';
        }

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 15px system-ui, sans-serif';
        ctx.fillText('CLASSROOM INTERACTION PROTOCOL:', 85, footY + 26);
        ctx.fillStyle = '#fde047';
        ctx.font = '14px system-ui, sans-serif';
        ctx.fillText(promptMsg, 85, footY + 48);
      }
    }

    // Right Panel: Connected Student Devices & Live Telemetry
    const rightX = leftW + 10;
    const rightW = w - rightX - 40;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.roundRect(rightX, 95, rightW, h - 125, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText('CONNECTED STUDENT DEVICES', rightX + 25, 135);

    // Device Network Card
    const dCardY = 160;
    ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
    ctx.roundRect(rightX + 20, dCardY, rightW - 40, 150, 10);
    ctx.fill();
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.fillText('● 20/20 STUDENT DEVICES ONLINE', rightX + 35, dCardY + 30);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText('• Hardware: 10 Laptops & 10 Tablets active', rightX + 35, dCardY + 60);
    ctx.fillText('• Stream Mode: Real-Time Screen Mirroring', rightX + 35, dCardY + 84);
    ctx.fillText(`• Active Question: Q${questionIndex + 1} (${q.type})`, rightX + 35, dCardY + 108);
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('LATENCY: 0.8ms · PACKET LOSS: 0.0%', rightX + 35, dCardY + 132);

    // Live Respondent Card
    const aCardY = dCardY + 170;
    ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
    ctx.roundRect(rightX + 20, aCardY, rightW - 40, 240, 10);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.fillText('PRACTICUM PARTICIPATION TRACKER:', rightX + 35, aCardY + 30);

    ctx.fillStyle = '#ffffff';
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText('1. Sophia Garcia (Row 2, Seat 2):', rightX + 35, aCardY + 60);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('   Left Ventricle thick myocardium answer', rightX + 35, aCardY + 80);

    ctx.fillStyle = '#ffffff';
    ctx.fillText('2. Ethan Vance (Row 3, Seat 5):', rightX + 35, aCardY + 105);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('   Mitral (Bicuspid) valve identification', rightX + 35, aCardY + 125);

    ctx.fillStyle = '#ffffff';
    ctx.fillText('3. Liam Patel (Row 1, Seat 3):', rightX + 35, aCardY + 150);
    ctx.fillStyle = '#4ade80';
    ctx.fillText('   Laplace Law & LV Afterload clinical inquiry', rightX + 35, aCardY + 170);

    ctx.fillStyle = '#ffffff';
    ctx.fillText('4. Ethan Vance (Row 3, Seat 1):', rightX + 35, aCardY + 195);
    ctx.fillStyle = '#fef08a';
    ctx.fillText('   Hemodynamics vascular pressure curve plotter', rightX + 35, aCardY + 215);

    // Footer
    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('SUBMIT ANSWERS VIA DESK TERMINAL OR HUD SCREEN', rightX + 25, h - 35);
  }
}

export const digitalScreenService = new DigitalScreenService();
