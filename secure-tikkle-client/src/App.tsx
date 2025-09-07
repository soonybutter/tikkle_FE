import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import GoalDetail from './pages/GoalDetail';
import Header from './components/Header';
import GoalNew from './pages/GoalNew';
import RequireAuth from './routes/RequireAuth';
import BadgesPage from './pages/Badges';
import BadgeAnnouncerProvider from './providers/BadgeAnnouncerProvider';
import Home from './pages/Home';
import Friends from './pages/Friends';
import GoalsListPage from './pages/GoalsListPage';
import './index.css';

export default function App() {
  return (
    <BadgeAnnouncerProvider>
      <Header />
        <Routes>
          {/* 공개 라우트 */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* 보호 라우트 */}
          <Route element={<RequireAuth />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/goals/new" element={<GoalNew />} />
            <Route path="/goals/:id" element={<GoalDetail />} />
            <Route path="/badges" element={<BadgesPage />} />
            <Route path="/friends" element={<Friends />} />
             <Route path="/goals" element={<GoalsListPage />} />
          </Route>

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </BadgeAnnouncerProvider>
      
  );
}
