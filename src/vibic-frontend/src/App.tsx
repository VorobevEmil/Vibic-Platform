import { Outlet, Routes, Route } from 'react-router-dom';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import ChannelPage from './pages/DirectChannelPage';
import PrivateRoute from './pages/PrivateRoute';
import ServerPage from './pages/ServerPage';
import InvitePage from './pages/InvitePage';
import AppShell from './layout/AppShell';
import { AuthProvider } from './context/AuthContext';
import { HeaderProvider } from './context/HeaderContext';
import { RightSidebarProvider } from './context/RightSidebarContext';
import ServerAvailabilityToast from './components/Layout/ServerAvailabilityToast';

function ProtectedAppLayout() {
  return (
    <AuthProvider>
      <RightSidebarProvider>
        <AppShell>
          <Outlet />
        </AppShell>
      </RightSidebarProvider>
    </AuthProvider>
  );
}

function App() {
  return (
    <HeaderProvider>
      <ServerAvailabilityToast />
      <Routes>
        <Route element={<PrivateRoute />}>
          <Route path="/invite/:inviteCode" element={<InvitePage />} />
          <Route element={<ProtectedAppLayout />}>
            <Route path="/channels/@me" element={<HomePage />} />
            <Route path="/channels/@me/:id" element={<ChannelPage />} />
            <Route path="/channels/:serverId/:channelId" element={<ServerPage />} />
          </Route>
        </Route>
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </HeaderProvider>

  );
}

export default App;
