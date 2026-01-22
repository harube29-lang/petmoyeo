import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  Grid,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const VolunteerWrite = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    shelter_name: '',
    shelter_location: '',
    volunteer_date: '',
    volunteer_time: '',
    max_participants: 10,
  });
  const [selectedImage, setSelectedImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하만 가능합니다.');
      return;
    }

    // 이미지 파일 체크
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // 미리보기 설정
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Supabase Storage에 업로드
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop().toLowerCase();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `volunteer/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || 'image/jpeg'
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }

      // 공개 URL 가져오기
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setSelectedImage(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(`이미지 업로드 오류: ${error.message || '알 수 없는 오류'}`);
      setImagePreview('');
    }
    setUploading(false);
  };

  const handleRemoveImage = () => {
    setSelectedImage('');
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('volunteer_posts').insert([
        {
          ...formData,
          author_id: user.id,
          image_url: selectedImage || null,
        },
      ]);

      if (error) throw error;
      navigate('/home');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('글 작성 중 오류가 발생했습니다.');
    }
    setLoading(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#FFFDF7', pb: 4 }}>
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
          봉사활동 모집글 작성
        </Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        <form onSubmit={handleSubmit}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="제목"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
              placeholder="예: 울산 유기견 보호소 봉사활동 모집"
            />

            <TextField
              fullWidth
              label="보호소 이름"
              name="shelter_name"
              value={formData.shelter_name}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
              placeholder="예: 울산광역시 유기동물보호소"
            />

            <TextField
              fullWidth
              label="보호소 주소"
              name="shelter_location"
              value={formData.shelter_location}
              onChange={handleChange}
              sx={{ mb: 2 }}
              placeholder="예: 울산광역시 남구 ○○동 123-45"
            />

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="봉사 날짜"
                  name="volunteer_date"
                  type="date"
                  value={formData.volunteer_date}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="봉사 시간"
                  name="volunteer_time"
                  type="time"
                  value={formData.volunteer_time}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="모집 인원"
              name="max_participants"
              type="number"
              value={formData.max_participants}
              onChange={handleChange}
              sx={{ mb: 2 }}
              InputProps={{ inputProps: { min: 1, max: 100 } }}
            />

            <TextField
              fullWidth
              label="상세 내용"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              multiline
              rows={6}
              placeholder="봉사활동에 대한 상세 내용을 작성해주세요.&#10;&#10;예:&#10;- 활동 내용: 유기견 산책, 목욕, 사료 급여&#10;- 준비물: 편한 복장, 운동화&#10;- 교통편: 자차 또는 대중교통 이용"
            />
          </Paper>

          {/* 이미지 업로드 */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              대표 이미지 업로드
            </Typography>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />

            {imagePreview || selectedImage ? (
              <Box sx={{ position: 'relative' }}>
                <img
                  src={imagePreview || selectedImage}
                  alt="preview"
                  style={{
                    width: '100%',
                    height: 200,
                    objectFit: 'cover',
                    borderRadius: 8,
                    pointerEvents: 'none',
                  }}
                />
                {uploading && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      borderRadius: 2,
                    }}
                  >
                    <CircularProgress sx={{ color: '#F5C542' }} />
                  </Box>
                )}
                <IconButton
                  onClick={handleRemoveImage}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: '#FFF',
                    '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ) : (
              <Box
                sx={{
                  border: '2px dashed #DDD',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { borderColor: '#F5C542', backgroundColor: '#FFFDF7' },
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <AddPhotoAlternateIcon sx={{ fontSize: 48, color: '#CCC' }} />
                <Typography variant="body2" sx={{ color: '#999', mt: 1 }}>
                  클릭하여 이미지 선택
                </Typography>
                <Typography variant="caption" sx={{ color: '#BBB' }}>
                  최대 5MB, JPG/PNG/GIF
                </Typography>
              </Box>
            )}
          </Paper>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate('/home')}
              sx={{
                py: 1.5,
                fontWeight: 600,
                color: '#666',
                borderColor: '#DDD',
                '&:hover': { borderColor: '#BBB', backgroundColor: '#F9F9F9' },
              }}
            >
              취소
            </Button>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                backgroundColor: '#F5C542',
                color: '#333',
                py: 1.5,
                fontWeight: 600,
                '&:hover': { backgroundColor: '#D4A83A' },
              }}
            >
              {loading ? '등록 중...' : '등록하기'}
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default VolunteerWrite;
