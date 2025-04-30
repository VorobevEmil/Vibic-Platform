import { Link } from 'react-router-dom';
import AuthLayout from '../components/Layout/AuthLayout';
import { useSignUp } from '../hooks/auth/useSignUp';

function SignUpPage() {
  const {
    displayName, setDisplayName,
    username, setUsername,
    email, setEmail,
    password, setPassword,
    handleRegister
  } = useSignUp();

  return (
    <AuthLayout
      title="Create your Vibic account"
      subtitle="Join the community — it’s free!"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/sign-in" className="text-indigo-600 hover:text-indigo-500 font-medium">
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleRegister}>

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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Display Name</label>
          <input
            type="text"
            className="input"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
          <input
            type="text"
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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

        <button type="submit" className="btn-primary w-full">Sign Up</button>
      </form>
    </AuthLayout>
  );
}

export default SignUpPage;
