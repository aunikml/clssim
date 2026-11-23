import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { motion } from 'framer-motion';

export const SceneLoadingScreen = () => {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0b1120',
        zIndex: 50,
      }}
    >
      <CircularProgress size={56} sx={{ color: '#3b82f6', mb: 3 }} />
      <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 600 }}>
        Building 3D Traditional Classroom...
      </Typography>
      <Typography variant="body2" sx={{ color: '#94a3b8', mt: 1 }}>
        Initializing stylized geometry, lighting and seating arrangement
      </Typography>
    </Box>
  );
};
