import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  Chip,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const PostWrite = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [hashtag, setHashtag] = useState('');
  const [hashtags, setHashtags] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddHashtag = () => {
    if (hashtag.trim() && !hashtags.includes(hashtag.trim())) {
      setHashtags([...hashtags, hashtag.trim()]);
      setHashtag('');
    }
  };

  const handleRemoveHashtag = (tagToRemove) => {
    setHashtags(hashtags.filter((tag) => tag !== tagToRemove));
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하만 가능합니다.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop().toLowerCase();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `posts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || 'image/jpeg'
        });

      if (uploadError) throw uploadError;

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
      const { error } = await supabase.from('posts').insert([
        {
          ...formData,
          author_id: user.id,
          image_url: selectedImage || null,
          hashtags: hashtags.length > 0 ? hashtags : null,
          category: 'community',
        },
      ]);

      if (error) throw error;
      navigate('/community');
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
        <IconButton onClick={() => navigate('/community')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600, ml: 1 }}>
          글 작성
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
              sx={{ mb: 2 }}
              placeholder="제목을 입력하세요 (선택)"
            />

            <TextField
              fullWidth
              label="내용"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              multiline
              rows={8}
              placeholder="반려동물과 함께하는 일상, 궁금한 점, 정보 공유 등 자유롭게 작성해주세요!"
            />

            {/* 해시태그 입력 */}
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  size="small"
                  label="해시태그"
                  value={hashtag}
                  onChange={(e) => setHashtag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddHashtag();
                    }
                  }}
                  placeholder="태그 입력 후 Enter"
                  sx={{ flex: 1 }}
                />
                <Button onClick={handleAddHashtag} variant="outlined">
                  추가
                </Button>
              </Box>
              {hashtags.length > 0 && (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {hashtags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={`#${tag}`}
                      onDelete={() => handleRemoveHashtag(tag)}
                      deleteIcon={<CloseIcon />}
                      sx={{
                        backgroundColor: '#FFF9E6',
                        color: '#D4A83A',
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Paper>

          {/* 이미지 업로드 */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              이미지 업로드 (선택)
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
              onClick={() => navigate('/community')}
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

export default PostWrite;
