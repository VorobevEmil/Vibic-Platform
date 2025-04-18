import { Routes, Route } from 'react-router-dom';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import AuthRedirect from './pages/AuthRedirect';
import ChannelPage from './pages/DirectChannelPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthRedirect />} />
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/channels/@me" element={<HomePage />} />
      <Route path="/channels/:id" element={<ChannelPage />} />
      {/* 404 fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>

  );
}

export default App;
