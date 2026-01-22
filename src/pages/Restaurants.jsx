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
  Select,
  MenuItem,
  FormControl,
  Skeleton,
  Button,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AddIcon from '@mui/icons-material/Add';
import PetsIcon from '@mui/icons-material/Pets';
import DeleteIcon from '@mui/icons-material/Delete';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const regions = [
  '전체',
  '서울',
  '경기도',
  '인천',
  '부산',
  '대구',
  '울산',
  '대전',
  '광주',
  '창원',
  '제주',
];

const Restaurants = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurants();
  }, [selectedRegion]);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('restaurants')
        .select(`
          *,
          author:author_id (nickname)
        `)
        .order('created_at', { ascending: false });

      if (selectedRegion !== '전체') {
        query = query.eq('region', selectedRegion);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRestaurants(data || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
    setLoading(false);
  };

  const handleLike = async (e, id) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const restaurant = restaurants.find((r) => r.id === id);
      const newLikesCount = (restaurant.likes_count || 0) + 1;

      await supabase
        .from('restaurants')
        .update({ likes_count: newLikesCount })
        .eq('id', id);

      setRestaurants(
        restaurants.map((r) =>
          r.id === id ? { ...r, likes_count: newLikesCount } : r
        )
      );
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await supabase.from('restaurants').delete().eq('id', id);
        setRestaurants(restaurants.filter((r) => r.id !== id));
      } catch (error) {
        console.error('Error deleting:', error);
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      {/* 헤더 */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <PetsIcon sx={{ color: '#F5C542' }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#333' }}>
            반려동물 동반 맛집
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#666' }}>
          반려동물과 함께 갈 수 있는 맛집을 찾아보세요
        </Typography>
      </Box>

      {/* 지역 필터 */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <Select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          sx={{
            backgroundColor: '#FFFFFF',
            borderRadius: 2,
            '& .MuiSelect-select': { py: 1.5 },
          }}
        >
          {regions.map((region) => (
            <MenuItem key={region} value={region}>
              {region}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* 맛집 카드 목록 */}
      {loading ? (
        [...Array(3)].map((_, i) => (
          <Skeleton
            key={i}
            variant="rounded"
            height={140}
            sx={{ mb: 2, borderRadius: 3 }}
          />
        ))
      ) : restaurants.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            backgroundColor: '#FFFFFF',
            borderRadius: 3,
          }}
        >
          <Typography variant="body1" sx={{ color: '#999', mb: 2 }}>
            {selectedRegion === '전체'
              ? '아직 등록된 맛집이 없어요'
              : `${selectedRegion} 지역에 등록된 맛집이 없어요`}
          </Typography>
          <Typography variant="body2" sx={{ color: '#BBB' }}>
            첫 번째 맛집을 등록해보세요!
          </Typography>
        </Box>
      ) : (
        restaurants.map((restaurant) => (
          <Card
            key={restaurant.id}
            sx={{
              mb: 2,
              overflow: 'visible',
            }}
          >
            <Box sx={{ display: 'flex' }}>
              <CardMedia
                component="img"
                sx={{
                  width: 120,
                  height: 120,
                  objectFit: 'contain',
                  backgroundColor: '#F5F5F5',
                  pointerEvents: 'none'
                }}
                image={
                  restaurant.image_url ||
                  `https://source.unsplash.com/200x200/?restaurant,cafe&sig=${restaurant.id}`
                }
                alt={restaurant.name}
              />
              <CardContent sx={{ flex: 1, p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {restaurant.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => handleLike(e, restaurant.id)}
                    sx={{ color: '#FF6B6B', p: 0 }}
                  >
                    {restaurant.likes_count > 0 ? (
                      <FavoriteIcon fontSize="small" />
                    ) : (
                      <FavoriteBorderIcon fontSize="small" />
                    )}
                  </IconButton>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  <Chip
                    label={restaurant.region}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.7rem',
                      backgroundColor: '#FFF9E6',
                      color: '#D4A83A',
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                  <LocationOnIcon sx={{ fontSize: 14, color: '#999' }} />
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#666',
                      fontSize: '0.75rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {restaurant.address || '주소 미등록'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                  <FavoriteIcon sx={{ fontSize: 12, color: '#FF6B6B' }} />
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    {restaurant.likes_count || 0}
                  </Typography>
                </Box>
              </CardContent>
            </Box>

            {/* 삭제 버튼 - 작성자만 표시 */}
            {user && restaurant.author_id === user.id && (
              <Box sx={{ px: 2, pb: 2, display: 'flex', gap: 1 }}>
                <Button
                  fullWidth
                  size="small"
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  onClick={(e) => handleDelete(e, restaurant.id)}
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
          onClick={() => navigate('/restaurant/write')}
        >
          <AddIcon sx={{ color: '#333' }} />
        </Fab>
      )}
    </Box>
  );
};

export default Restaurants;
