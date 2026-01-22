import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Divider,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('username', formData.username)
        .eq('password', formData.password)
        .single();

      if (fetchError || !data) {
        setError('아이디 또는 비밀번호가 올바르지 않습니다.');
        setLoading(false);
        return;
      }

      login(data);
      navigate('/home');
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#FFFDF7',
        p: 2,
      }}
    >
      <IconButton onClick={() => navigate('/home')} sx={{ mb: 2 }}>
        <ArrowBackIcon />
      </IconButton>

      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box
          onClick={() => navigate('/home')}
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: '#F5C542',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mx: 'auto',
            mb: 2,
            fontSize: 40,
            cursor: 'pointer',
          }}
        >
          🐶
        </Box>
        <Typography
          onClick={() => navigate('/home')}
          variant="h5"
          sx={{ fontWeight: 700, color: '#333', cursor: 'pointer' }}
        >
          petpi
        </Typography>
      </Box>

      <Paper sx={{ p: 3, maxWidth: 400, mx: 'auto' }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="아이디"
            name="username"
            value={formData.username}
            onChange={handleChange}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label="비밀번호"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            sx={{ mb: 2 }}
            required
          />
          {error && (
            <Typography color="error" sx={{ mb: 2, fontSize: '0.875rem' }}>
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: '#F5C542',
              color: '#333',
              py: 1.5,
              '&:hover': { backgroundColor: '#D4A83A' },
            }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </Button>
        </form>

        <Divider sx={{ my: 3 }}>또는</Divider>

        <Button
          fullWidth
          variant="outlined"
          sx={{
            borderColor: '#FEE500',
            color: '#333',
            backgroundColor: '#FEE500',
            mb: 1,
            '&:hover': { backgroundColor: '#FDD800', borderColor: '#FDD800' },
          }}
        >
          카카오로 로그인
        </Button>
        <Button
          fullWidth
          variant="outlined"
          sx={{
            borderColor: '#03C75A',
            color: '#FFFFFF',
            backgroundColor: '#03C75A',
            '&:hover': { backgroundColor: '#02B350', borderColor: '#02B350' },
          }}
        >
          네이버로 로그인
        </Button>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" sx={{ color: '#666' }}>
            아직 계정이 없으신가요?{' '}
            <Button
              onClick={() => navigate('/signup')}
              sx={{ color: '#F5C542', fontWeight: 600 }}
            >
              회원가입
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
