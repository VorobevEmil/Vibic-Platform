import { Link } from 'react-router-dom';
import AuthLayout from '../components/Layout/AuthLayout';
import { useSignIn } from '../hooks/auth/useSignIn';

function SignInPage() {
  const {
    signInRequest, setSignInRequest,
    handleSignIn
  } = useSignIn();

  return (
    <AuthLayout
      title="С возвращением"
      subtitle="Введите данные, чтобы войти в аккаунт."
      footer={
        <>
          Нет аккаунта?{' '}
          <Link to="/sign-up" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Зарегистрироваться
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSignIn}>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
            Email
          </label>
          <input
            type="email"
            className="input"
            placeholder="you@example.com"
            value={signInRequest.email}
            onChange={(e) =>
              setSignInRequest(prev => ({ ...prev, email: e.target.value }))
            }
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
            Пароль
          </label>
          <input
            type="password"
            className="input"
            placeholder="••••••••"
            value={signInRequest.password}
            onChange={(e) =>
              setSignInRequest(prev => ({ ...prev, password: e.target.value }))
            }
            required
          />
        </div>

        <button type="submit" className="btn-primary w-full mt-2">
          Войти
        </button>
      </form>
    </AuthLayout>
  );
}

export default SignInPage;
