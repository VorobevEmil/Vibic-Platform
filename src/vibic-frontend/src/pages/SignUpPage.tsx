import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import AuthLayout from '../components/Layout/AuthLayout';
import { useSignUp } from '../hooks/auth/useSignUp';

function SignUpPage() {
  const { signUpRequest, setSignUpRequest, handleRegister, error, isLoading } = useSignUp();

  return (
    <AuthLayout
      title="Создать аккаунт"
      subtitle="Присоединяйтесь — это бесплатно!"
      footer={
        <>
          Уже есть аккаунт?{' '}
          <Link to="/sign-in" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Войти
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleRegister}>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#555c78] mb-1.5">
            Email
          </label>
          <input
            type="email"
            className="input"
            placeholder="you@example.com"
            value={signUpRequest.email}
            onChange={(e) => setSignUpRequest(prev => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#555c78] mb-1.5">
            Отображаемое имя
          </label>
          <input
            type="text"
            className="input"
            placeholder="Как вас зовут?"
            value={signUpRequest.displayName}
            onChange={(e) => setSignUpRequest(prev => ({ ...prev, displayName: e.target.value }))}
            required
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#555c78] mb-1.5">
            Имя пользователя
          </label>
          <input
            type="text"
            className="input"
            placeholder="username"
            value={signUpRequest.username}
            onChange={(e) => setSignUpRequest(prev => ({ ...prev, username: e.target.value }))}
            required
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#555c78] mb-1.5">
            Пароль
          </label>
          <input
            type="password"
            className="input"
            placeholder="••••••••"
            value={signUpRequest.password}
            onChange={(e) => setSignUpRequest(prev => ({ ...prev, password: e.target.value }))}
            required
          />
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-400/25 bg-red-500/10 px-3.5 py-3 text-sm text-red-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <button type="submit" disabled={isLoading} className="btn-primary w-full mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
          {isLoading ? 'Создаём аккаунт...' : 'Зарегистрироваться'}
        </button>
      </form>
    </AuthLayout>
  );
}

export default SignUpPage;
