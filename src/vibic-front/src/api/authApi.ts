import { api } from "../utils/axiosInstance";

export const signIn = (data: { email: string; password: string }) => api.post('/api/auth/sign-in', data);
export const signUp = (data: { username: string; email: string; password: string }) => api.post('/api/auth/sign-up', data);
export const logout = () => api.post('/api/auth/logout');
export const checkAuth = () => api.get('/api/auth/check');