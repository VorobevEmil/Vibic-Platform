import {JSX, useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import { checkAuth } from "../api/authApi";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        checkAuth().then((auth) => {
            if (auth) {
                navigate("/"); 
            } else {
                setIsAuthenticated(false); 
            }
        });
    }, [navigate]);

    if (isAuthenticated === null) {
        return null; // 🔹 Ожидаем проверки перед рендерингом
    }

    return children;
};

export default ProtectedRoute;