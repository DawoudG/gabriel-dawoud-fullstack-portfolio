import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL, saveAuth, getAuth } from '../lib/auth';

export default function SignIn() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getAuth()) {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Sign in failed');
        return;
      }

      saveAuth({
        token: data.token,
        user: data.user
      });

      navigate('/');
    } catch {
      setError('Unable to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-xl mx-auto">
      <div className="border border-border rounded-2xl p-8 bg-bg/60">
        <h1 className="text-4xl font-bold mb-2">
          Sign In
        </h1>

        <p className="text-muted mb-8">
          Sign in to access your portfolio account.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
        >
          <div>
            <label className="block mb-2 font-medium">
              Email
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-border bg-bg text-text"
              placeholder="Email"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Password
            </label>

            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-border bg-bg text-text"
              placeholder="Password"
            />
          </div>

          {error && (
            <p className="text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-3 rounded-lg font-bold cursor-pointer bg-accent text-bg"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="text-muted mt-6">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-accent"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </section>
  );
}