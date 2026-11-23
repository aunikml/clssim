import React, { useEffect } from 'react';
import { Html } from '@react-three/drei';
import { useClassroomStore } from '../../../../store/classroomStore';
import { teacherInteractionService } from '../../../../services/teacherInteractionService';
import { studentInteractionService } from '../../../../services/studentInteractionService';

export const StudentActionWheel = ({
  seatId,
  studentName = 'Student',
  posture = 'idle',
  onClose,
}) => {
  const userRole = useClassroomStore((state) => state.userRole);
  const openDeviceInspection = useClassroomStore((state) => state.openDeviceInspection);
  const openNotebook = useClassroomStore((state) => state.openNotebook);

  // Keyboard shortcut handler when action wheel is active
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.code === 'Escape') {
        onClose?.();
        return;
      }

      if (userRole === 'teacher') {
        if (e.code === 'KeyC') {
          e.preventDefault();
          teacherInteractionService.callOnStudent(studentName, seatId);
          onClose?.();
        } else if (e.code === 'KeyP') {
          e.preventDefault();
          teacherInteractionService.awardPraise(studentName);
          onClose?.();
        } else if (e.code === 'KeyD') {
          e.preventDefault();
          teacherInteractionService.tapDeskToRefocus(studentName, seatId);
          onClose?.();
        } else if (e.code === 'KeyF') {
          e.preventDefault();
          openDeviceInspection();
          onClose?.();
        }
      } else {
        // Student Mode
        if (e.code === 'KeyW') {
          e.preventDefault();
          studentInteractionService.startSideTalk(seatId);
          onClose?.();
        } else if (e.code === 'KeyN') {
          e.preventDefault();
          openNotebook();
          onClose?.();
        } else if (e.code === 'KeyF') {
          e.preventDefault();
          openDeviceInspection();
          onClose?.();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [userRole, studentName, seatId, onClose, openDeviceInspection, openNotebook]);

  // Clean status label
  const statusLabel =
    posture === 'taking_notes'
      ? 'Taking Notes'
      : posture === 'confused'
      ? 'Puzzled / Looking at Board'
      : posture === 'hand_raising'
      ? 'Hand Raised'
      : posture === 'dozing_off'
      ? 'Drowsy / Inattentive'
      : 'Listening to Lecture';

  return (
    <Html position={[0, 1.85, 0.55]} center distanceFactor={11} zIndexRange={[100, 0]}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          userSelect: 'none',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          animation: 'popIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Student Name & Status Badge */}
        <div
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.94)',
            color: '#f8fafc',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            padding: '5px 12px',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            fontWeight: 700,
          }}
        >
          <span style={{ color: '#38bdf8' }}>●</span>
          <span>{studentName}</span>
          <span
            style={{
              fontSize: '10px',
              color: posture === 'dozing_off' ? '#f87171' : '#94a3b8',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              padding: '2px 6px',
              borderRadius: '6px',
              fontWeight: 500,
            }}
          >
            {statusLabel}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose?.();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              marginLeft: '4px',
              padding: '0 2px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Action Buttons Wheel / Palette */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(11, 17, 32, 0.92)',
            padding: '6px 8px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 12px 28px rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {userRole === 'teacher' ? (
            <>
              {/* Call On Student */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  teacherInteractionService.callOnStudent(studentName, seatId);
                  onClose?.();
                }}
                style={actionBtnStyle('#38bdf8', 'rgba(56, 189, 248, 0.15)')}
                title="Call on student to answer lecture question [C]"
              >
                <span style={keyBadgeStyle}>C</span>
                <span>Call On</span>
              </button>

              {/* Praise Student */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  teacherInteractionService.awardPraise(studentName);
                  onClose?.();
                }}
                style={actionBtnStyle('#fde047', 'rgba(253, 224, 71, 0.15)')}
                title="Award Praise (+5 pts) [P]"
              >
                <span style={keyBadgeStyle}>P</span>
                <span>Praise</span>
              </button>

              {/* Discipline / Refocus */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  teacherInteractionService.tapDeskToRefocus(studentName, seatId);
                  onClose?.();
                }}
                style={actionBtnStyle('#f87171', 'rgba(248, 113, 113, 0.15)')}
                title="Tap desk to refocus attention [D]"
              >
                <span style={keyBadgeStyle}>D</span>
                <span>Refocus</span>
              </button>

              {/* Inspect Device Screen */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openDeviceInspection();
                  onClose?.();
                }}
                style={actionBtnStyle('#a855f7', 'rgba(168, 85, 247, 0.15)')}
                title="Mirror device screen [F]"
              >
                <span style={keyBadgeStyle}>F</span>
                <span>Device</span>
              </button>
            </>
          ) : (
            <>
              {/* Whisper / Side Talk */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  studentInteractionService.startSideTalk(seatId);
                  onClose?.();
                }}
                style={actionBtnStyle('#38bdf8', 'rgba(56, 189, 248, 0.15)')}
                title="Whisper / Side-Talk with this peer [W]"
              >
                <span style={keyBadgeStyle}>W</span>
                <span>Whisper</span>
              </button>

              {/* Peek at Notes */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openNotebook();
                  onClose?.();
                }}
                style={actionBtnStyle('#34d399', 'rgba(52, 211, 153, 0.15)')}
                title="Open your desk notebook [N]"
              >
                <span style={keyBadgeStyle}>N</span>
                <span>Notebook</span>
              </button>

              {/* Inspect Shared Tablet */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openDeviceInspection();
                  onClose?.();
                }}
                style={actionBtnStyle('#a855f7', 'rgba(168, 85, 247, 0.15)')}
                title="Inspect shared desk terminal [F]"
              >
                <span style={keyBadgeStyle}>F</span>
                <span>Terminal</span>
              </button>
            </>
          )}
        </div>
      </div>
    </Html>
  );
};

const actionBtnStyle = (color, bg) => ({
  backgroundColor: bg,
  color: color,
  border: `1px solid ${color}40`,
  borderRadius: '8px',
  padding: '5px 9px',
  fontSize: '11px',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  transition: 'transform 0.1s ease, background-color 0.1s ease',
});

const keyBadgeStyle = {
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  color: '#ffffff',
  fontSize: '9px',
  padding: '1px 5px',
  borderRadius: '4px',
  fontWeight: 800,
  border: '1px solid rgba(255, 255, 255, 0.2)',
};
