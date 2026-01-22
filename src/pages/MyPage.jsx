import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import ArticleIcon from '@mui/icons-material/Article';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const MyPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    attendanceCount: 0,
    volunteerCount: 0,
    postCount: 0,
  });

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      // 이번 달 출석 횟수
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const { count: attendanceCount } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('attendance_date', startOfMonth.toISOString().split('T')[0]);

      // 참여한 봉사활동 수
      const { count: volunteerCount } = await supabase
        .from('volunteer_participants')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // 작성한 게시글 수
      const { count: postCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', user.id);

      setStats({
        attendanceCount: attendanceCount || 0,
        volunteerCount: volunteerCount || 0,
        postCount: postCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/home');
  };

  if (!user) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          로그인이 필요합니다
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/login')}
          sx={{
            backgroundColor: '#F5C542',
            color: '#333',
            '&:hover': { backgroundColor: '#D4A83A' },
          }}
        >
          로그인하기
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#FFFDF7', pb: 10 }}>
      {/* 헤더 */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #F0F0F0',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        <IconButton onClick={() => navigate('/home')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600, ml: 1 }}>
          마이페이지
        </Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        {/* 프로필 카드 */}
        <Paper
          sx={{
            p: 3,
            mb: 3,
            background: 'linear-gradient(135deg, #F5C542 0%, #FFE082 100%)',
            borderRadius: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={user.profile_image_url}
              sx={{
                width: 80,
                height: 80,
                border: '3px solid #FFFFFF',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              {user.nickname?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#333' }}>
                {user.nickname}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                @{user.username}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* 통계 카드 */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <Box>
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  backgroundColor: '#FFF9E6',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mx: 'auto',
                  mb: 1,
                }}
              >
                <EventAvailableIcon sx={{ color: '#F5C542' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {stats.attendanceCount}
              </Typography>
              <Typography variant="caption" sx={{ color: '#666' }}>
                이번 달 출석
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box>
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  backgroundColor: '#FFF9E6',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mx: 'auto',
                  mb: 1,
                }}
              >
                <VolunteerActivismIcon sx={{ color: '#F5C542' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {stats.volunteerCount}
              </Typography>
              <Typography variant="caption" sx={{ color: '#666' }}>
                봉사 참여
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box>
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  backgroundColor: '#FFF9E6',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mx: 'auto',
                  mb: 1,
                }}
              >
                <EmojiEventsIcon sx={{ color: '#F5C542' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {stats.attendanceCount * 10}
              </Typography>
              <Typography variant="caption" sx={{ color: '#666' }}>
                포인트
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* 메뉴 목록 */}
        <Paper sx={{ borderRadius: 3 }}>
          <List>
            <ListItem
              button
              onClick={() => navigate('/my/posts')}
              sx={{ py: 2 }}
            >
              <ListItemIcon>
                <ArticleIcon sx={{ color: '#F5C542' }} />
              </ListItemIcon>
              <ListItemText primary="내가 쓴 글" />
              <ChevronRightIcon sx={{ color: '#CCC' }} />
            </ListItem>
            <Divider />
            <ListItem
              button
              onClick={() => navigate('/my/volunteers')}
              sx={{ py: 2 }}
            >
              <ListItemIcon>
                <VolunteerActivismIcon sx={{ color: '#F5C542' }} />
              </ListItemIcon>
              <ListItemText primary="참여한 봉사활동" />
              <ChevronRightIcon sx={{ color: '#CCC' }} />
            </ListItem>
            <Divider />
            <ListItem
              button
              onClick={() => navigate('/my/attendance')}
              sx={{ py: 2 }}
            >
              <ListItemIcon>
                <EventAvailableIcon sx={{ color: '#F5C542' }} />
              </ListItemIcon>
              <ListItemText primary="출석 기록" />
              <ChevronRightIcon sx={{ color: '#CCC' }} />
            </ListItem>
            <Divider />
            <ListItem button sx={{ py: 2 }}>
              <ListItemIcon>
                <SettingsIcon sx={{ color: '#666' }} />
              </ListItemIcon>
              <ListItemText primary="설정" />
              <ChevronRightIcon sx={{ color: '#CCC' }} />
            </ListItem>
          </List>
        </Paper>

        {/* 로그아웃 버튼 */}
        <Button
          fullWidth
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            mt: 3,
            py: 1.5,
            color: '#999',
            borderColor: '#DDD',
            '&:hover': {
              borderColor: '#BBB',
              backgroundColor: '#F9F9F9',
            },
          }}
        >
          로그아웃
        </Button>
      </Box>
    </Box>
  );
};

export default MyPage;
