import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Fab,
  Avatar,
  Chip,
  Skeleton,
  Button,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareIcon from '@mui/icons-material/Share';
import AddIcon from '@mui/icons-material/Add';
import ForumIcon from '@mui/icons-material/Forum';
import DeleteIcon from '@mui/icons-material/Delete';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const Community = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:author_id (nickname, profile_image_url)
        `)
        .eq('category', 'community')
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
        .from('posts')
        .update({ likes_count: newLikesCount })
        .eq('id', postId);

      setPosts(
        posts.map((p) =>
          p.id === postId ? { ...p, likes_count: newLikesCount } : p
        )
      );
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (e, postId) => {
    e.stopPropagation();
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await supabase.from('posts').delete().eq('id', postId);
        setPosts(posts.filter((p) => p.id !== postId));
      } catch (error) {
        console.error('Error deleting:', error);
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      {/* 헤더 */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <ForumIcon sx={{ color: '#F5C542' }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#333' }}>
            커뮤니티
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#666' }}>
          반려동물 가족들과 이야기를 나눠보세요
        </Typography>
      </Box>

      {/* 게시물 목록 */}
      {loading ? (
        [...Array(3)].map((_, i) => (
          <Skeleton
            key={i}
            variant="rounded"
            height={300}
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
            아직 게시글이 없어요
          </Typography>
          <Typography variant="body2" sx={{ color: '#BBB' }}>
            첫 번째 게시글을 작성해보세요!
          </Typography>
        </Box>
      ) : (
        posts.map((post) => (
          <Card
            key={post.id}
            sx={{
              mb: 2,
            }}
          >
            {/* 작성자 정보 */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                src={post.author?.profile_image_url}
                sx={{ width: 40, height: 40 }}
              >
                {post.author?.nickname?.charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {post.author?.nickname || '익명'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#999' }}>
                  {formatDate(post.created_at)}
                </Typography>
              </Box>
            </Box>

            {/* 이미지 */}
            {post.image_url && (
              <CardMedia
                component="img"
                image={post.image_url}
                alt="post image"
                sx={{
                  width: '100%',
                  maxHeight: 300,
                  objectFit: 'contain',
                  backgroundColor: '#F5F5F5',
                  pointerEvents: 'none'
                }}
              />
            )}

            {/* 내용 */}
            <CardContent sx={{ pt: 1 }}>
              {post.title && (
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  {post.title}
                </Typography>
              )}
              <Typography
                variant="body2"
                sx={{
                  color: '#333',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {post.content}
              </Typography>

              {/* 해시태그 */}
              {post.hashtags && post.hashtags.length > 0 && (
                <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {post.hashtags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={`#${tag}`}
                      size="small"
                      sx={{
                        height: 24,
                        fontSize: '0.75rem',
                        backgroundColor: '#FFF9E6',
                        color: '#D4A83A',
                      }}
                    />
                  ))}
                </Box>
              )}

              {/* 액션 버튼 */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  mt: 2,
                  pt: 1,
                  borderTop: '1px solid #F0F0F0',
                }}
              >
                <Box
                  sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                  onClick={(e) => handleLike(e, post.id)}
                >
                  {post.likes_count > 0 ? (
                    <FavoriteIcon sx={{ fontSize: 20, color: '#FF6B6B', mr: 0.5 }} />
                  ) : (
                    <FavoriteBorderIcon sx={{ fontSize: 20, color: '#999', mr: 0.5 }} />
                  )}
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    {post.likes_count || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ChatBubbleOutlineIcon sx={{ fontSize: 20, color: '#999', mr: 0.5 }} />
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    댓글
                  </Typography>
                </Box>
                <IconButton size="small" sx={{ ml: 'auto' }}>
                  <ShareIcon sx={{ fontSize: 20, color: '#999' }} />
                </IconButton>
              </Box>
            </CardContent>

            {/* 삭제 버튼 - 작성자만 표시 */}
            {user && post.author_id === user.id && (
              <Box sx={{ px: 2, pb: 2 }}>
                <Button
                  fullWidth
                  size="small"
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  onClick={(e) => handleDelete(e, post.id)}
                  sx={{
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
          onClick={() => navigate('/post/write')}
        >
          <AddIcon sx={{ color: '#333' }} />
        </Fab>
      )}
    </Box>
  );
};

export default Community;
