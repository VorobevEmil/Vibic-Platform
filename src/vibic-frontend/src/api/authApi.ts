import { http } from './httpClient';

export const authApi = {
  signIn: (data: { email: string; password: string }) =>
    http.post('http://localhost:7154/auth/sign-in', data),

  signUp: (data: { displayName: string; username: string; email: string; password: string }) =>
    http.post('http://localhost:7154/auth/sign-up', data),
};