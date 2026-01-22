import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { AuthProvider } from './context/AuthContext';

// Pages
import Splash from './pages/Splash';
import Layout from './components/Layout';
import Home from './pages/Home';
import VolunteerDetail from './pages/VolunteerDetail';
import VolunteerWrite from './pages/VolunteerWrite';
import VolunteerEdit from './pages/VolunteerEdit';
import Restaurants from './pages/Restaurants';
import RestaurantWrite from './pages/RestaurantWrite';
import Attendance from './pages/Attendance';
import Community from './pages/Community';
import PostWrite from './pages/PostWrite';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MyPage from './pages/MyPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* 스플래시 화면 */}
            <Route path="/" element={<Splash />} />

            {/* 인증 페이지 */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* 메인 레이아웃 */}
            <Route element={<Layout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/restaurants" element={<Restaurants />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/community" element={<Community />} />
            </Route>

            {/* 상세/작성/수정 페이지 */}
            <Route path="/volunteer/:id" element={<VolunteerDetail />} />
            <Route path="/volunteer/write" element={<VolunteerWrite />} />
            <Route path="/volunteer/edit/:id" element={<VolunteerEdit />} />
            <Route path="/restaurant/write" element={<RestaurantWrite />} />
            <Route path="/post/write" element={<PostWrite />} />
            <Route path="/mypage" element={<MyPage />} />

            {/* 기본 리다이렉트 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
