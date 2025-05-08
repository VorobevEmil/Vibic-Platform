import { Routes, Route } from 'react-router-dom';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import ChannelPage from './pages/DirectChannelPage';
import PrivateRoute from './pages/PrivateRoute';
import ServerPage from './pages/ServerPage';
import InvitePage from './pages/InvitePage';

function App() {
  return (
    <Routes>
      <Route element={<PrivateRoute />}>
        <Route path="/channels/@me" element={<HomePage />} />
        <Route path="/channels/@me/:id" element={<ChannelPage />} />
        <Route path="/channels/:serverId/:channelId" element={<ServerPage />} />
        <Route path="/invite/:inviteCode" element={<InvitePage />} />
      </Route>
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>

  );
}

export default App;
