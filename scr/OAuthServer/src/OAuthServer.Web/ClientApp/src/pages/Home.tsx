import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { checkAuth, logout } from "../api/authApi";

const Home = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        checkAuth().then(setIsAuthenticated);
    }, []);

    const handleLogout = async () => {
        await logout();
        setIsAuthenticated(false);
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-4">Добро пожаловать в OAuthServer</h1>
            {isAuthenticated === null ? (
                <p className="text-lg text-gray-700 mb-6">Загрузка...</p>
            ) : isAuthenticated ? (
                <>
                    <p className="text-lg text-gray-700 mb-6">Вы успешно вошли в систему!</p>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-6 py-2 rounded shadow"
                    >
                        Выйти
                    </button>
                </>
            ) : (
                <>
                    <p className="text-lg text-gray-700 mb-6">Войдите в систему или зарегистрируйтесь, чтобы продолжить.</p>
                    <div className="space-x-4">
                        <Link to="/sign-in" className="bg-blue-500 text-white px-6 py-2 rounded shadow">
                            Войти
                        </Link>
                        <Link to="/sign-up" className="bg-green-500 text-white px-6 py-2 rounded shadow">
                            Регистрация
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
};

export default Home;
