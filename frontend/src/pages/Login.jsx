import { useState } from 'react';

export default function Login({ onLogin, onGoogleLogin, onSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onLogin?.(email, password);
    } catch (err) {
      setError(
        err.code === 'auth/invalid-credential'
          ? 'Incorrect email or password.'
          : err.message || 'Unable to log in.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError('');
    setGoogleLoading(true);

    try {
      await onGoogleLogin?.();
    } catch (err) {
      setError(
        err.code === 'auth/popup-closed-by-user'
          ? 'Google sign-in was closed before finishing.'
          : err.message || 'Unable to sign in with Google.'
      );
    } finally {
      setGoogleLoading(false);
    }
  }

  const disabled = loading || googleLoading;

  return (
    <div className="d-flex justify-content-center align-items-center bg-light min-vh-100 px-3 py-4">
      <div className="login-card card border-0 shadow-lg rounded-4">
        <div className="text-center mb-4">
          <div className="login-icon text-dark mb-3">
            <i className="bi bi-pc-display-horizontal" />
          </div>
          <h1 className="fw-bold mb-1">PC &amp; Laptop Inventory</h1>
          <p className="text-muted mb-0">Inventory Management System</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              className="form-control form-control-lg"
              placeholder="Enter your email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={disabled}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              className="form-control form-control-lg"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={disabled}
              required
            />
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <button
            type="submit"
            className="btn btn-dark btn-lg w-100"
            disabled={disabled}
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="btn btn-outline-dark btn-lg w-100 mt-3 d-flex align-items-center justify-content-center gap-2"
          disabled={disabled}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            width="22"
            height="22"
          />
          {googleLoading ? 'Signing in...' : 'Continue with Google'}
        </button>

        <button
          type="button"
          className="btn btn-link w-100 mt-2"
          onClick={onSignup}
          disabled={disabled}
        >
          Create an account
        </button>
      </div>
    </div>
  );
}
