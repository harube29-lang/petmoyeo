import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(180deg, #FFF9E6 0%, #F5C542 100%)',
        animation: 'fadeIn 0.5s ease-in',
        '@keyframes fadeIn': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      }}
    >
      <Box
        sx={{
          animation: 'bounce 1s ease-in-out infinite',
          '@keyframes bounce': {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-10px)' },
          },
        }}
      >
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 8px 32px rgba(245, 197, 66, 0.4)',
            mb: 3,
            fontSize: 60,
          }}
        >
          🐶
        </Box>
      </Box>
      <Typography
        variant="h1"
        sx={{
          color: '#333',
          fontWeight: 700,
          fontSize: '2rem',
          letterSpacing: 2,
        }}
      >
        petpi
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: '#666',
          mt: 1,
          fontSize: '0.9rem',
        }}
      >
        유기동물과 함께하는 따뜻한 세상
      </Typography>
    </Box>
  );
};

export default Splash;
