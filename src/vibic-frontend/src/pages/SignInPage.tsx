import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import AuthLayout from '../components/Layout/AuthLayout';
import { useSignIn } from '../hooks/auth/useSignIn';
import { useToast } from '../context/ToastContext';

function SignInPage() {
  const { signInRequest, setSignInRequest, handleSignIn, error, isLoading } = useSignIn();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('registered') === '1') {
      showToast('success', 'Аккаунт создан!', 'Теперь вы можете войти.');
      setSearchParams({});
    }
  }, []);

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
            onChange={(e) => setSignInRequest(prev => ({ ...prev, email: e.target.value }))}
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
            onChange={(e) => setSignInRequest(prev => ({ ...prev, password: e.target.value }))}
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
          {isLoading ? 'Входим...' : 'Войти'}
        </button>
      </form>
    </AuthLayout>
  );
}

export default SignInPage;
