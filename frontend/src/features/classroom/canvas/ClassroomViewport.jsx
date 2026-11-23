import React, { Suspense, Component } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { ClassroomCamera } from './ClassroomCamera';
import { ClassroomScene } from '../components/ClassroomScene';

class CanvasErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CanvasErrorBoundary caught 3D rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0b1120',
            color: '#f8fafc',
            zIndex: 50,
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏫</div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', color: '#38bdf8' }}>
            3D Classroom Renderer Recovered
          </h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '420px', margin: '0 0 20px 0' }}>
            The WebGL canvas encountered an orientation singularity or texture timeout. Click below to re-initialize your classroom view.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: '8px 20px',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
            }}
          >
            Re-enter Classroom
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const ClassroomViewport = () => {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <CanvasErrorBoundary>
        <Canvas
          shadows
          camera={{ fov: 64, near: 0.05, far: 120, position: [6.8, 1.8, 5.8] }}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.12,
            powerPreference: 'high-performance',
          }}
          style={{ width: '100%', height: '100%', background: '#0b1120' }}
        >
          <Suspense fallback={null}>
            <ClassroomCamera />
            <ClassroomScene />
          </Suspense>
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
};
