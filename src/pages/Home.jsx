import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  IconButton,
  Fab,
  Skeleton,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVolunteerPosts();
  }, []);

  const fetchVolunteerPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('volunteer_posts')
        .select(`
          *,
          author:author_id (nickname, profile_image_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
    setLoading(false);
  };

  const handleLike = async (e, postId) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const post = posts.find((p) => p.id === postId);
      const newLikesCount = (post.likes_count || 0) + 1;

      await supabase
        .from('volunteer_posts')
        .update({ likes_count: newLikesCount })
        .eq('id', postId);

      setPosts(
        posts.map((p) =>
          p.id === postId ? { ...p, likes_count: newLikesCount } : p
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      {/* 헤더 섹션 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#333', mb: 1 }}>
          봉사활동 모집
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          유기동물과 함께하는 따뜻한 봉사활동에 참여해보세요
        </Typography>
      </Box>

      {/* 봉사활동 카드 목록 */}
      {loading ? (
        [...Array(3)].map((_, i) => (
          <Skeleton
            key={i}
            variant="rounded"
            height={200}
            sx={{ mb: 2, borderRadius: 3 }}
          />
        ))
      ) : posts.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            backgroundColor: '#FFFFFF',
            borderRadius: 3,
          }}
        >
          <Typography variant="body1" sx={{ color: '#999', mb: 2 }}>
            아직 등록된 봉사활동이 없어요
          </Typography>
          <Typography variant="body2" sx={{ color: '#BBB' }}>
            첫 번째 봉사활동을 등록해보세요!
          </Typography>
        </Box>
      ) : (
        posts.map((post) => (
          <Card
            key={post.id}
            sx={{
              mb: 2,
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
            onClick={() => navigate(`/volunteer/${post.id}`)}
          >
            <CardMedia
              component="img"
              image={
                post.image_url ||
                `https://source.unsplash.com/400x200/?dog,shelter&sig=${post.id}`
              }
              alt={post.title}
              sx={{
                width: '100%',
                maxHeight: 250,
                objectFit: 'contain',
                backgroundColor: '#F5F5F5',
                pointerEvents: 'none'
              }}
            />
            <CardContent sx={{ p: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    fontSize: '1rem',
                    flex: 1,
                    pr: 1,
                  }}
                >
                  {post.title}
                </Typography>
                <IconButton
                  size="small"
                  onClick={(e) => handleLike(e, post.id)}
                  sx={{ color: '#FF6B6B' }}
                >
                  {post.likes_count > 0 ? (
                    <FavoriteIcon fontSize="small" />
                  ) : (
                    <FavoriteBorderIcon fontSize="small" />
                  )}
                </IconButton>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 0.5 }}>
                <LocationOnIcon sx={{ fontSize: 16, color: '#999' }} />
                <Typography variant="body2" sx={{ color: '#666' }}>
                  {post.shelter_name || '보호소'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CalendarTodayIcon sx={{ fontSize: 14, color: '#999' }} />
                  <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem' }}>
                    {formatDate(post.volunteer_date)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTimeIcon sx={{ fontSize: 14, color: '#999' }} />
                  <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem' }}>
                    {post.volunteer_time?.slice(0, 5) || '미정'}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: 2,
                }}
              >
                <Chip
                  icon={<PeopleIcon sx={{ fontSize: 16 }} />}
                  label={`${post.current_participants || 0}/${post.max_participants || 10}명`}
                  size="small"
                  sx={{
                    backgroundColor:
                      (post.current_participants || 0) >= (post.max_participants || 10)
                        ? '#FFE0E0'
                        : '#E8F5E9',
                    color:
                      (post.current_participants || 0) >= (post.max_participants || 10)
                        ? '#D32F2F'
                        : '#2E7D32',
                  }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <FavoriteIcon sx={{ fontSize: 14, color: '#FF6B6B' }} />
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    {post.likes_count || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))
      )}

      {/* 글쓰기 버튼 */}
      {user && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 20,
            backgroundColor: '#F5C542',
            '&:hover': { backgroundColor: '#D4A83A' },
          }}
          onClick={() => navigate('/volunteer/write')}
        >
          <AddIcon sx={{ color: '#333' }} />
        </Fab>
      )}
    </Box>
  );
};

export default Home;
