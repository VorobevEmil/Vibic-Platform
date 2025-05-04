import { SignInRequest } from '../types/auth/SignInType';
import { SignUpRequest } from '../types/auth/SignUpType';
import { http } from './httpClient';

export const authApi = {
  signIn: (data: SignInRequest) =>
    http.post('http://localhost:7154/auth/sign-in', data),

  signUp: (data: SignUpRequest) =>
    http.post('http://localhost:7154/auth/sign-up', data),
};