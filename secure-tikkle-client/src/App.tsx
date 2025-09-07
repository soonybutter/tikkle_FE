import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import GoalDetail from './pages/GoalDetail';
import Header from './components/Header';
import GoalNew from './pages/GoalNew';
import RequireAuth from './routes/RequireAuth';
import BadgesPage from './pages/Badges';
import BadgeAnnouncerProvider from './providers/BadgeAnnouncerProvider';
//import Home from './pages/Home';
import Friends from './pages/Friends';
import GoalsListPage from './pages/GoalsListPage';
import RecordsPage from './pages/RecordsPage';
import RequireGuest from './routes/RequireGuest'; 
import Landing from './pages/Landing';

import './index.css';

export default function App() {
  return (
    <BadgeAnnouncerProvider>
      <Header />
      <Routes>
        {/* 공개 루트 → 로그인 여부에 따라 Intro/Home */}
        <Route path="/" element={<Landing />} />

        {/* 비로그인 전용 */}
        <Route element={<RequireGuest />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* 보호 라우트 */}
        <Route element={<RequireAuth />}>
          <Route path="/app" element={<Dashboard />} />
          <Route path="/goals/new" element={<GoalNew />} />
          <Route path="/goals/:id" element={<GoalDetail />} />
          <Route path="/badges" element={<BadgesPage />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/goals" element={<GoalsListPage />} />
          <Route path="/records" element={<RecordsPage />} />
        </Route>

        {/* 호환/폴백 */}
        <Route path="/dashboard" element={<Navigate to="/app" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BadgeAnnouncerProvider>
  );
}