import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from '../../theme';

export const AppThemeProvider = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};
