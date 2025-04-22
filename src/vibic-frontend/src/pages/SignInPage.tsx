import { Link } from 'react-router-dom';
import AuthLayout from '../components/Layout/AuthLayout';
import { useSignIn } from '../hooks/auth/useSignIn';

function SignInPage() {
  const {
    email, setEmail,
    password, setPassword,
    handleSignIn
  } = useSignIn();

  return (
    <AuthLayout
      title="Sign in to Vibic"
      subtitle="Welcome back! Please enter your credentials."
      footer={
        <>
          Don’t have an account?{' '}
          <Link to="/sign-up" className="text-indigo-600 hover:text-indigo-500 font-medium">
            Sign up
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSignIn}>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
          <input
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-primary w-full">Sign In</button>
      </form>
    </AuthLayout>
  );
}

export default SignInPage;
