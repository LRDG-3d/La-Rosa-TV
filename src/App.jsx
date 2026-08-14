import { Routes, Route, Navigate } from 'react-router-dom';
import Vnc from './pages/Vnc.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Vnc />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
