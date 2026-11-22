import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../lib/auth';

export default function SignUp() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Sign up failed');
        return;
      }

      setSuccess('Account created successfully!');

      setTimeout(() => {
        navigate('/signin');
      }, 800);
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
          Sign Up
        </h1>

        <p className="text-muted mb-8">
          Create a portfolio account.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block mb-2 font-medium">
              Name
            </label>

            <input
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-border bg-bg text-text"
              placeholder="Name"
            />
          </div>

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
              minLength={6}
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

          {success && (
            <p className="text-green-400">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-3 rounded-lg font-bold cursor-pointer bg-accent text-bg"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-muted mt-6">
          Already have an account?{' '}
          <Link to="/signin" className="text-accent">
            Sign In
          </Link>
        </p>
      </div>
    </section>
  );
}