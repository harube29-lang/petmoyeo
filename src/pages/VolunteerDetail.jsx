import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Avatar,
  Divider,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Skeleton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const VolunteerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isParticipating, setIsParticipating] = useState(false);

  useEffect(() => {
    fetchPostDetail();
  }, [id]);

  const fetchPostDetail = async () => {
    try {
      const { data: postData, error: postError } = await supabase
        .from('volunteer_posts')
        .select(`
          *,
          author:author_id (nickname, profile_image_url)
        `)
        .eq('id', id)
        .single();

      if (postError) throw postError;
      setPost(postData);

      // 참여자 목록 가져오기
      const { data: participantsData } = await supabase
        .from('volunteer_participants')
        .select(`
          *,
          user:user_id (nickname, profile_image_url)
        `)
        .eq('volunteer_post_id', id);

      setParticipants(participantsData || []);

      // 현재 사용자 참여 여부 확인
      if (user) {
        const isUserParticipating = participantsData?.some(
          (p) => p.user_id === user.id
        );
        setIsParticipating(isUserParticipating);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    }
    setLoading(false);
  };

  const handleParticipate = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (isParticipating) {
        // 참여 취소
        await supabase
          .from('volunteer_participants')
          .delete()
          .eq('volunteer_post_id', id)
          .eq('user_id', user.id);

        await supabase
          .from('volunteer_posts')
          .update({ current_participants: (post.current_participants || 1) - 1 })
          .eq('id', id);

        setIsParticipating(false);
        setParticipants(participants.filter((p) => p.user_id !== user.id));
        setPost({ ...post, current_participants: (post.current_participants || 1) - 1 });
      } else {
        // 참여 신청
        await supabase
          .from('volunteer_participants')
          .insert([{ volunteer_post_id: parseInt(id), user_id: user.id }]);

        await supabase
          .from('volunteer_posts')
          .update({ current_participants: (post.current_participants || 0) + 1 })
          .eq('id', id);

        setIsParticipating(true);
        setParticipants([
          ...participants,
          { user_id: user.id, user: { nickname: user.nickname } },
        ]);
        setPost({ ...post, current_participants: (post.current_participants || 0) + 1 });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const newLikesCount = (post.likes_count || 0) + 1;
      await supabase
        .from('volunteer_posts')
        .update({ likes_count: newLikesCount })
        .eq('id', id);

      setPost({ ...post, likes_count: newLikesCount });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Skeleton variant="rectangular" height={250} />
        <Skeleton variant="text" height={40} sx={{ mt: 2 }} />
        <Skeleton variant="text" height={100} />
      </Box>
    );
  }

  if (!post) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography>게시글을 찾을 수 없습니다.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 10 }}>
      {/* 헤더 */}
      <Box
        sx={{
          position: 'relative',
          backgroundColor: '#F5F5F5',
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <img
          src={post.image_url || `https://source.unsplash.com/800x400/?dog,shelter&sig=${post.id}`}
          alt={post.title}
          style={{
            width: '100%',
            maxHeight: 300,
            objectFit: 'contain',
            display: 'block',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 60,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            navigate('/home');
          }}
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            color: '#FFFFFF',
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 10,
            pointerEvents: 'auto',
          }}
        >
          <ArrowBackIcon />
        </IconButton>
      </Box>

      {/* 컨텐츠 */}
      <Box sx={{ p: 2, mt: -3, position: 'relative' }}>
        <Paper sx={{ p: 2, borderRadius: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            {post.title}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Chip
              icon={<PeopleIcon />}
              label={`${post.current_participants || 0}/${post.max_participants || 10}명 참여`}
              sx={{
                backgroundColor:
                  (post.current_participants || 0) >= (post.max_participants || 10)
                    ? '#FFE0E0'
                    : '#E8F5E9',
              }}
            />
            <Chip
              icon={<FavoriteIcon />}
              label={`${post.likes_count || 0}`}
              onClick={handleLike}
              sx={{ backgroundColor: '#FFF0F0' }}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* 봉사 정보 */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <LocationOnIcon sx={{ color: '#F5C542' }} />
              <Box>
                <Typography variant="body2" sx={{ color: '#999', fontSize: '0.75rem' }}>
                  장소
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {post.shelter_name || '보호소'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  {post.shelter_location || '주소 미정'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <CalendarTodayIcon sx={{ color: '#F5C542' }} />
              <Box>
                <Typography variant="body2" sx={{ color: '#999', fontSize: '0.75rem' }}>
                  날짜
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {formatDate(post.volunteer_date)}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon sx={{ color: '#F5C542' }} />
              <Box>
                <Typography variant="body2" sx={{ color: '#999', fontSize: '0.75rem' }}>
                  시간
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {post.volunteer_time?.slice(0, 5) || '미정'}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* 상세 내용 */}
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
            {post.content}
          </Typography>

          {/* 작성자 정보 */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mt: 3,
              p: 1.5,
              backgroundColor: '#F9F9F9',
              borderRadius: 2,
            }}
          >
            <Avatar
              src={post.author?.profile_image_url}
              sx={{ width: 40, height: 40 }}
            >
              {post.author?.nickname?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {post.author?.nickname || '익명'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#999' }}>
                작성자
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* 참여자 목록 */}
        {participants.length > 0 && (
          <Paper sx={{ p: 2, mt: 2, borderRadius: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              참여자 ({participants.length}명)
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {participants.map((p, index) => (
                <Chip
                  key={index}
                  avatar={
                    <Avatar src={p.user?.profile_image_url}>
                      {p.user?.nickname?.charAt(0)}
                    </Avatar>
                  }
                  label={p.user?.nickname || '참여자'}
                  variant="outlined"
                />
              ))}
            </Box>
          </Paper>
        )}

        {/* 참여 버튼 */}
        <Box sx={{ mt: 3 }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleParticipate}
            disabled={
              !isParticipating &&
              (post.current_participants || 0) >= (post.max_participants || 10)
            }
            sx={{
              backgroundColor: isParticipating ? '#EEE' : '#F5C542',
              color: isParticipating ? '#666' : '#333',
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: isParticipating ? '#DDD' : '#D4A83A',
              },
            }}
          >
            {isParticipating
              ? '참여 취소하기'
              : (post.current_participants || 0) >= (post.max_participants || 10)
              ? '모집 마감'
              : '참여 신청하기'}
          </Button>

          {/* 수정/삭제 버튼 - 작성자만 표시 */}
          {user && post.author_id === user.id && (
            <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/volunteer/edit/${id}`)}
                sx={{
                  py: 1.5,
                  color: '#F5C542',
                  borderColor: '#F5C542',
                  '&:hover': {
                    borderColor: '#D4A83A',
                    backgroundColor: '#FFF9E6',
                  },
                }}
              >
                수정
              </Button>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<DeleteIcon />}
                onClick={async () => {
                  if (window.confirm('정말 삭제하시겠습니까?')) {
                    try {
                      await supabase
                        .from('volunteer_participants')
                        .delete()
                        .eq('volunteer_post_id', id);
                      await supabase
                        .from('volunteer_posts')
                        .delete()
                        .eq('id', id);
                      navigate('/home');
                    } catch (error) {
                      console.error('Error deleting:', error);
                      alert('삭제 중 오류가 발생했습니다.');
                    }
                  }
                }}
                sx={{
                  py: 1.5,
                  color: '#FF6B6B',
                  borderColor: '#FF6B6B',
                  '&:hover': {
                    borderColor: '#FF5252',
                    backgroundColor: '#FFF0F0',
                  },
                }}
              >
                삭제
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default VolunteerDetail;
