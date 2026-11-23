import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Alert,
  Grid,
} from '@mui/material';
import {
  School as AcademyIcon,
  Person as StudentIcon,
  RecordVoiceOver as TeacherIcon,
  Visibility as ObserverIcon,
  PlayArrow as PlayIcon,
  VolumeUp as AudioIcon,
  MenuBook as NotesIcon,
  CenterFocusStrong as VisualIcon,
  Bolt as QuickIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../../store/authStore';
import { useClassroomStore } from '../../../store/classroomStore';

export const ClassroomHomePage = () => {
  const [activeTab, setActiveTab] = useState(0); // 0: Quick Play, 1: Sign In, 2: Register
  const [selectedRole, setSelectedRole] = useState('student'); // 'student' | 'teacher' | 'observer'
  const [customName, setCustomName] = useState('');
  const [username, setUsername] = useState('student_alice');
  const [password, setPassword] = useState('password123');
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const guestLogin = useAuthStore((state) => state.guestLogin);
  const isLoading = useAuthStore((state) => state.isLoading);
  const setUserRole = useClassroomStore((state) => state.setUserRole);
  const openAgenda = useClassroomStore((state) => state.openAgenda);
  const classSize = useClassroomStore((state) => state.classSize) || 20;

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setUserRole(role);
    if (role === 'teacher') {
      setUsername('teacher_john');
    } else if (role === 'observer') {
      setUsername('observer_harrison');
    } else {
      setUsername('student_alice');
    }
  };

  const handleStartGame = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    try {
      if (activeTab === 0) {
        // Instant Quick Launch
        const name = customName.trim() || (selectedRole === 'teacher' ? 'Teacher John' : selectedRole === 'observer' ? 'Dr. Harrison' : 'Alice Patel');
        guestLogin(selectedRole, name);
        setUserRole(selectedRole);
        openAgenda();
      } else if (activeTab === 1) {
        // Standard Sign In
        await login(username, password);
        setUserRole(selectedRole);
        openAgenda();
      } else {
        // Registration
        await register({
          username,
          password,
          email: email || `${username}@classsim.edu`,
          display_name: customName || username,
        });
        setUserRole(selectedRole);
        openAgenda();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication error. Please retry.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#070b14',
        color: '#f8fafc',
        backgroundImage: `
          radial-gradient(ellipse at 15% 20%, rgba(56, 189, 248, 0.12) 0%, transparent 50%),
          radial-gradient(ellipse at 85% 80%, rgba(99, 102, 241, 0.14) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, rgba(15, 23, 42, 0.8) 0%, transparent 100%)
        `,
        position: 'relative',
        overflowX: 'hidden',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        py: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="lg">
        {/* Top Brand Banner */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 4, md: 6 } }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #0284c7 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 8px 24px rgba(2, 132, 199, 0.45)',
              }}
            >
              <AcademyIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: -0.5, lineHeight: 1 }}>
                ClassSim 3D
              </Typography>
              <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                Next-Gen Virtual Academy
              </Typography>
            </Box>
          </Box>

          <Chip
            icon={<span style={{ color: '#10b981', fontSize: '10px', marginLeft: 4 }}>●</span>}
            label={`Classroom Node Active (${classSize} Desks)`}
            size="small"
            sx={{
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              fontWeight: 700,
            }}
          />
        </Box>

        {/* Main Content Grid */}
        <Grid container spacing={5} alignItems="center">
          {/* Left Column: Bold Minimal Headline */}
          <Grid item xs={12} md={6}>
            <Box
              component={motion.div}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              sx={{ pr: { md: 4 } }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '2.8rem', md: '4rem' },
                  lineHeight: 1.15,
                  letterSpacing: -1.5,
                  background: 'linear-gradient(180deg, #ffffff 40%, #94a3b8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Experience Real Pedagogical Presence in 3D.
              </Typography>
            </Box>
          </Grid>

          {/* Right Column: Portal Terminal & Login Card */}
          <Grid item xs={12} md={6}>
            <Card
              component={motion.div}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              sx={{
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(16px)',
                borderRadius: '20px',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                boxShadow: '0 32px 80px rgba(0, 0, 0, 0.8)',
                color: '#f8fafc',
                overflow: 'hidden',
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Typography variant="overline" sx={{ color: '#38bdf8', fontWeight: 800, letterSpacing: 1.2 }}>
                  Simulation Portal
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
                  Enter Classroom Session
                </Typography>

                {errorMsg && (
                  <Alert severity="error" sx={{ mb: 2.5, backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5' }}>
                    {errorMsg}
                  </Alert>
                )}

                {/* Step 1: Role Selector */}
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block', mb: 1 }}>
                  1. Select Participation Role
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.5, mb: 3 }}>
                  <RoleButton
                    role="student"
                    current={selectedRole}
                    onClick={() => handleRoleSelect('student')}
                    icon={<StudentIcon />}
                    label="Student"
                    sub="Walk & Learn"
                  />
                  <RoleButton
                    role="teacher"
                    current={selectedRole}
                    onClick={() => handleRoleSelect('teacher')}
                    icon={<TeacherIcon />}
                    label="Teacher"
                    sub="Lecture & Lead"
                  />
                  <RoleButton
                    role="observer"
                    current={selectedRole}
                    onClick={() => handleRoleSelect('observer')}
                    icon={<ObserverIcon />}
                    label="Observer"
                    sub="Bird's Eye"
                  />
                </Box>

                {/* Step 2: Auth Tabs */}
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block', mb: 1 }}>
                  2. Credentials & Profile
                </Typography>
                <Tabs
                  value={activeTab}
                  onChange={(e, val) => setActiveTab(val)}
                  variant="fullWidth"
                  sx={{
                    backgroundColor: 'rgba(30, 41, 59, 0.6)',
                    borderRadius: '10px',
                    p: 0.5,
                    mb: 2.5,
                    minHeight: 38,
                    '& .MuiTab-root': {
                      minHeight: 34,
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#94a3b8',
                      borderRadius: '8px',
                      textTransform: 'none',
                    },
                    '& .Mui-selected': {
                      color: '#ffffff !important',
                      backgroundColor: '#0284c7',
                    },
                    '& .MuiTabs-indicator': { display: 'none' },
                  }}
                >
                  <Tab icon={<QuickIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Instant Play" />
                  <Tab label="Sign In" />
                  <Tab label="Register" />
                </Tabs>

                {/* Tab 0: Quick Play */}
                {activeTab === 0 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Your Display Name"
                      placeholder={selectedRole === 'teacher' ? 'Teacher John' : selectedRole === 'observer' ? 'Dr. Harrison' : 'Alice Patel'}
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      helperText="Optional custom avatar badge name"
                      InputProps={{ sx: { color: '#ffffff', backgroundColor: 'rgba(30, 41, 59, 0.5)' } }}
                      InputLabelProps={{ sx: { color: '#94a3b8' } }}
                    />

                    {/* Pre-configured Demo Cadets */}
                    <Box sx={{ p: 1.5, borderRadius: '10px', backgroundColor: 'rgba(2, 132, 199, 0.1)', border: '1px solid rgba(2, 132, 199, 0.25)' }}>
                      <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 700, display: 'block', mb: 0.5 }}>
                        Ready Profile: {selectedRole === 'teacher' ? 'Prof. John (Lead Lecturer)' : selectedRole === 'observer' ? 'Dr. Harrison (Faculty Reviewer)' : 'Alice Patel (Biology Cadet)'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        1-Click direct entry. Boots synchronous 3D environment instantly.
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Tab 1: Standard Sign In */}
                {activeTab === 1 && (
                  <Box component="form" onSubmit={handleStartGame} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      InputProps={{ sx: { color: '#ffffff', backgroundColor: 'rgba(30, 41, 59, 0.5)' } }}
                      InputLabelProps={{ sx: { color: '#94a3b8' } }}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      type="password"
                      label="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      InputProps={{ sx: { color: '#ffffff', backgroundColor: 'rgba(30, 41, 59, 0.5)' } }}
                      InputLabelProps={{ sx: { color: '#94a3b8' } }}
                    />
                  </Box>
                )}

                {/* Tab 2: Register */}
                {activeTab === 2 && (
                  <Box component="form" onSubmit={handleStartGame} sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      InputProps={{ sx: { color: '#ffffff', backgroundColor: 'rgba(30, 41, 59, 0.5)' } }}
                      InputLabelProps={{ sx: { color: '#94a3b8' } }}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      InputProps={{ sx: { color: '#ffffff', backgroundColor: 'rgba(30, 41, 59, 0.5)' } }}
                      InputLabelProps={{ sx: { color: '#94a3b8' } }}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      type="password"
                      label="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      InputProps={{ sx: { color: '#ffffff', backgroundColor: 'rgba(30, 41, 59, 0.5)' } }}
                      InputLabelProps={{ sx: { color: '#94a3b8' } }}
                    />
                  </Box>
                )}

                {/* Big Action Button */}
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleStartGame}
                  disabled={isLoading}
                  startIcon={<PlayIcon />}
                  sx={{
                    mt: 3.5,
                    py: 1.6,
                    borderRadius: '12px',
                    fontWeight: 900,
                    fontSize: '1rem',
                    letterSpacing: 0.5,
                    background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                    boxShadow: '0 8px 24px rgba(2, 132, 199, 0.45)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0369a1 0%, #1d4ed8 100%)',
                      boxShadow: '0 12px 32px rgba(2, 132, 199, 0.65)',
                    },
                  }}
                >
                  {isLoading ? 'Entering Academy...' : 'Enter Classroom & Start Game'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

const RoleButton = ({ role, current, onClick, icon, label, sub }) => {
  const isSelected = current === role;
  const roleColor = role === 'teacher' ? '#f59e0b' : role === 'observer' ? '#a855f7' : '#38bdf8';

  return (
    <Box
      onClick={onClick}
      sx={{
        p: 1.5,
        borderRadius: '12px',
        backgroundColor: isSelected ? `${roleColor}18` : 'rgba(30, 41, 59, 0.5)',
        border: `1.5px solid ${isSelected ? roleColor : 'rgba(255, 255, 255, 0.1)'}`,
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'all 0.15s ease',
        '&:hover': {
          borderColor: roleColor,
          backgroundColor: `${roleColor}10`,
        },
      }}
    >
      <Box sx={{ color: isSelected ? roleColor : '#94a3b8', mb: 0.5 }}>
        {icon}
      </Box>
      <Typography variant="body2" sx={{ fontWeight: 800, color: isSelected ? '#ffffff' : '#cbd5e1', fontSize: '12px' }}>
        {label}
      </Typography>
      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '10px', display: 'block' }}>
        {sub}
      </Typography>
    </Box>
  );
};
