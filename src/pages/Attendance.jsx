import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Skeleton,
  Chip,
} from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const Attendance = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [myAttendanceCount, setMyAttendanceCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, [user]);

  const fetchAttendance = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // 오늘 출석 목록
      const { data: attendanceData, error } = await supabase
        .from('attendance')
        .select(`
          *,
          user:user_id (nickname, profile_image_url)
        `)
        .eq('attendance_date', today)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setTodayAttendance(attendanceData || []);

      // 현재 사용자 출석 여부 확인
      if (user) {
        const hasChecked = attendanceData?.some((a) => a.user_id === user.id);
        setHasCheckedIn(hasChecked);

        // 이번 달 출석 횟수
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        const { count } = await supabase
          .from('attendance')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('attendance_date', startOfMonth.toISOString().split('T')[0]);

        setMyAttendanceCount(count || 0);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
    setLoading(false);
  };

  const handleCheckIn = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (hasCheckedIn) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      const { error } = await supabase.from('attendance').insert([
        {
          user_id: user.id,
          attendance_date: today,
        },
      ]);

      if (error) throw error;

      setHasCheckedIn(true);
      setMyAttendanceCount(myAttendanceCount + 1);
      setTodayAttendance([
        ...todayAttendance,
        {
          user_id: user.id,
          user: { nickname: user.nickname, profile_image_url: user.profile_image_url },
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      if (error.code === '23505') {
        setHasCheckedIn(true);
      } else {
        console.error('Error checking in:', error);
      }
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const today = new Date();
  const todayStr = `${today.getMonth() + 1}월 ${today.getDate()}일`;

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      {/* 헤더 */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <EventAvailableIcon sx={{ color: '#F5C542' }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#333' }}>
            출석체크
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#666' }}>
          매일 출석하고 포인트를 모아보세요!
        </Typography>
      </Box>

      {/* 내 출석 현황 */}
      {user && (
        <Paper
          sx={{
            p: 3,
            mb: 3,
            background: 'linear-gradient(135deg, #F5C542 0%, #FFE082 100%)',
            borderRadius: 3,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="body2" sx={{ color: '#333', opacity: 0.8 }}>
                {user.nickname}님의 이번 달 출석
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 1 }}>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#333' }}>
                  {myAttendanceCount}
                </Typography>
                <Typography variant="body1" sx={{ color: '#333' }}>
                  일
                </Typography>
              </Box>
              <Chip
                icon={<EmojiEventsIcon sx={{ fontSize: 16 }} />}
                label={`${myAttendanceCount * 10} 포인트`}
                sx={{
                  mt: 1,
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  fontWeight: 600,
                }}
              />
            </Box>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.3)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 48, color: '#333' }} />
            </Box>
          </Box>
        </Paper>
      )}

      {/* 출석 버튼 */}
      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={handleCheckIn}
        disabled={hasCheckedIn || !user}
        sx={{
          mb: 3,
          py: 2,
          backgroundColor: hasCheckedIn ? '#E0E0E0' : '#F5C542',
          color: hasCheckedIn ? '#999' : '#333',
          fontWeight: 700,
          fontSize: '1.1rem',
          borderRadius: 3,
          '&:hover': {
            backgroundColor: hasCheckedIn ? '#E0E0E0' : '#D4A83A',
          },
        }}
      >
        {!user
          ? '로그인 후 출석체크'
          : hasCheckedIn
          ? '오늘 출석 완료!'
          : `${todayStr} 출석하기`}
      </Button>

      {/* 오늘 출석 목록 */}
      <Paper sx={{ borderRadius: 3 }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #F0F0F0' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            오늘의 출석 ({todayAttendance.length}명)
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ p: 2 }}>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} height={60} sx={{ mb: 1 }} />
            ))}
          </Box>
        ) : todayAttendance.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#999' }}>
              아직 출석한 사람이 없어요
            </Typography>
            <Typography variant="body2" sx={{ color: '#BBB', mt: 1 }}>
              첫 번째로 출석해보세요!
            </Typography>
          </Box>
        ) : (
          <List>
            {todayAttendance.map((attendance, index) => (
              <Box key={attendance.id || index}>
                <ListItem>
                  <ListItemAvatar>
                    <Box sx={{ position: 'relative' }}>
                      <Avatar
                        src={attendance.user?.profile_image_url}
                        sx={{
                          backgroundColor:
                            index === 0
                              ? '#FFD700'
                              : index === 1
                              ? '#C0C0C0'
                              : index === 2
                              ? '#CD7F32'
                              : '#F5C542',
                        }}
                      >
                        {attendance.user?.nickname?.charAt(0)}
                      </Avatar>
                      {index < 3 && (
                        <Chip
                          label={index + 1}
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            minWidth: 20,
                            height: 20,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            backgroundColor:
                              index === 0
                                ? '#FFD700'
                                : index === 1
                                ? '#C0C0C0'
                                : '#CD7F32',
                            color: '#FFFFFF',
                          }}
                        />
                      )}
                    </Box>
                  </ListItemAvatar>
                  <ListItemText
                    primary={attendance.user?.nickname || '익명'}
                    secondary={formatTime(attendance.created_at)}
                    primaryTypographyProps={{ fontWeight: 500 }}
                    secondaryTypographyProps={{ fontSize: '0.75rem' }}
                  />
                  {attendance.user_id === user?.id && (
                    <Chip label="나" size="small" color="primary" />
                  )}
                </ListItem>
                {index < todayAttendance.length - 1 && <Divider component="li" />}
              </Box>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default Attendance;
