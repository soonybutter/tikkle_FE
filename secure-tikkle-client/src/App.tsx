import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import GoalDetail from './pages/GoalDetail';


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/goals/:id" element={<GoalDetail />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
