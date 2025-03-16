import axios from "axios";

const API_URL = "https://localhost:7154/api/auth";

export const signIn = async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/sign-in`, {email, password});
    return response.data;
};

export const signUp = async (username: string, email: string, password: string) => {
    const response = await axios.post(`${API_URL}/sign-up`, {username, email, password});
    return response.data;
};

export const logout = async () => {
    const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
    });

    return response.status == 200;
}

export const checkAuth = async (): Promise<boolean> => {
    try {
        const response = await fetch("/api/auth/check", {
            method: "GET",
            credentials: "include", 
        });

        return response.status == 200; 
    } catch (error) {
        return false;
    }
};
