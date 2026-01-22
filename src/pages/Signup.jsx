import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    passwordConfirm: '',
    nickname: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (formData.password.length < 4) {
      setError('비밀번호는 최소 4자 이상이어야 합니다.');
      return;
    }

    setLoading(true);

    try {
      // 아이디 중복 확인
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', formData.username)
        .single();

      if (existingUser) {
        setError('이미 사용 중인 아이디입니다.');
        setLoading(false);
        return;
      }

      // 랜덤 프로필 이미지 생성
      const randomSeed = Math.floor(Math.random() * 1000);
      const profileImageUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${randomSeed}`;

      // 회원가입
      const { data, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            username: formData.username,
            password: formData.password,
            nickname: formData.nickname,
            profile_image_url: profileImageUrl,
          },
        ])
        .select()
        .single();

      if (insertError) {
        setError('회원가입 중 오류가 발생했습니다.');
        setLoading(false);
        return;
      }

      login(data);
      navigate('/home');
    } catch (err) {
      setError('회원가입 중 오류가 발생했습니다.');
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
      <IconButton onClick={() => navigate('/login')} sx={{ mb: 2 }}>
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
        <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
          petpi와 함께 봉사활동을 시작하세요!
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
            helperText="영문, 숫자 조합 4자 이상"
          />
          <TextField
            fullWidth
            label="닉네임"
            name="nickname"
            value={formData.nickname}
            onChange={handleChange}
            sx={{ mb: 2 }}
            required
            helperText="다른 사용자에게 보여질 이름입니다"
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
            helperText="최소 4자 이상"
          />
          <TextField
            fullWidth
            label="비밀번호 확인"
            name="passwordConfirm"
            type="password"
            value={formData.passwordConfirm}
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
            {loading ? '가입 중...' : '회원가입'}
          </Button>
        </form>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" sx={{ color: '#666' }}>
            이미 계정이 있으신가요?{' '}
            <Button
              onClick={() => navigate('/login')}
              sx={{ color: '#F5C542', fontWeight: 600 }}
            >
              로그인
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Signup;
