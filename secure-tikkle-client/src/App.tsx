import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import GoalDetail from './pages/GoalDetail';
import Header from './components/Header';


export default function App() {
  return (
    <>
      <Header />
      <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/goals/:id" element={<GoalDetail />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}
