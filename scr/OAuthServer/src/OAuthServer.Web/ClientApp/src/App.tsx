import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/sign-in" element={<ProtectedRoute><SignIn /></ProtectedRoute>} />
                <Route path="/sign-up" element={<ProtectedRoute><SignUp /></ProtectedRoute>} />
            </Routes>
        </Router>
    );
}

export default App;
