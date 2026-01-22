import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  BottomNavigation,
  BottomNavigationAction,
  Badge,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ForumIcon from '@mui/icons-material/Forum';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { label: '봉사활동', icon: <VolunteerActivismIcon />, path: '/home' },
    { label: '맛집', icon: <RestaurantIcon />, path: '/restaurants' },
    { label: '출석', icon: <EventAvailableIcon />, path: '/attendance' },
    { label: '커뮤니티', icon: <ForumIcon />, path: '/community' },
  ];

  const getCurrentNavValue = () => {
    const currentPath = location.pathname;
    const index = navItems.findIndex((item) => item.path === currentPath);
    return index >= 0 ? index : 0;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* 상단 헤더 */}
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: '#FFFFFF',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* 왼쪽 로고 */}
          <Box
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => navigate('/home')}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: '#F5C542',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mr: 1,
                fontSize: 24,
              }}
            >
              🐶
            </Box>
            <Typography
              variant="h6"
              sx={{
                color: '#333',
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              petpi
            </Typography>
          </Box>

          {/* 오른쪽 아이콘들 */}
          <Box>
            <IconButton onClick={() => navigate('/notifications')}>
              <Badge badgeContent={3} color="error">
                <NotificationsIcon sx={{ color: '#666' }} />
              </Badge>
            </IconButton>
            <IconButton onClick={() => navigate(user ? '/mypage' : '/login')}>
              {user ? (
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: '#F5C542',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Typography sx={{ color: '#FFF', fontWeight: 600, fontSize: 14 }}>
                    {user.nickname?.charAt(0) || 'U'}
                  </Typography>
                </Box>
              ) : (
                <PersonIcon sx={{ color: '#666' }} />
              )}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* 메인 컨텐츠 */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: '64px',
          mb: '56px',
          backgroundColor: '#FFFDF7',
          minHeight: 'calc(100vh - 120px)',
        }}
      >
        <Outlet />
      </Box>

      {/* 하단 네비게이션 */}
      <BottomNavigation
        value={getCurrentNavValue()}
        onChange={(event, newValue) => {
          navigate(navItems[newValue].path);
        }}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 64,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            padding: '6px 0',
            '&.Mui-selected': {
              color: '#F5C542',
            },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.7rem',
            '&.Mui-selected': {
              fontSize: '0.75rem',
            },
          },
        }}
      >
        {navItems.map((item, index) => (
          <BottomNavigationAction
            key={index}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </Box>
  );
};

export default Layout;
