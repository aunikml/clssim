import React from 'react';
import {
  EffectComposer,
  Bloom,
  Vignette,
  ToneMapping,
} from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';

export const ClassroomPostProcessing = () => {
  return (
    <EffectComposer multisampling={4} disableNormalPass>
      {/* Bloom on sunlit windows and glowing ceiling lamps */}
      <Bloom
        luminanceThreshold={0.88}
        luminanceSmoothing={0.15}
        intensity={0.45}
        radius={0.65}
      />

      {/* Cinematic Vignette for focal immersion */}
      <Vignette
        offset={0.2}
        darkness={0.52}
        eskil={false}
      />

      {/* ACES Filmic Tone Mapping */}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
};
