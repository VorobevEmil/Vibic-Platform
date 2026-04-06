import { Link } from 'react-router-dom';
import AuthLayout from '../components/Layout/AuthLayout';
import { useSignUp } from '../hooks/auth/useSignUp';

function SignUpPage() {
  const {
    signUpRequest, setSignUpRequest,
    handleRegister
  } = useSignUp();

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
          <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
            Email
          </label>
          <input
            type="email"
            className="input"
            placeholder="you@example.com"
            value={signUpRequest.email}
            onChange={(e) =>
              setSignUpRequest(prev => ({ ...prev, email: e.target.value }))
            }
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
            Отображаемое имя
          </label>
          <input
            type="text"
            className="input"
            placeholder="Как вас зовут?"
            value={signUpRequest.displayName}
            onChange={(e) =>
              setSignUpRequest(prev => ({ ...prev, displayName: e.target.value }))
            }
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
            Имя пользователя
          </label>
          <input
            type="text"
            className="input"
            placeholder="username"
            value={signUpRequest.username}
            onChange={(e) =>
              setSignUpRequest(prev => ({ ...prev, username: e.target.value }))
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
            value={signUpRequest.password}
            onChange={(e) =>
              setSignUpRequest(prev => ({ ...prev, password: e.target.value }))
            }
            required
          />
        </div>

        <button type="submit" className="btn-primary w-full mt-2">
          Зарегистрироваться
        </button>
      </form>
    </AuthLayout>
  );
}

export default SignUpPage;
