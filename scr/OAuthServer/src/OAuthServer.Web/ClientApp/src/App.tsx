import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ApplicationsList from './pages/ApplicationsList';
import ApplicationDetails from './pages/ApplicationDetails';
import CreateApplication from './pages/CreateApplication';
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/sign-in" element={<ProtectedRoute><SignIn /></ProtectedRoute>} />
                <Route path="/sign-up" element={<ProtectedRoute><SignUp /></ProtectedRoute>} />
                <Route path="/settings/applications" element={<ApplicationsList />} />
                <Route path="/settings/applications/new" element={<CreateApplication />} />
                <Route path="/settings/applications/:id" element={<ApplicationDetails />} />
            </Routes>
        </Router>
    );
}

export default App;
