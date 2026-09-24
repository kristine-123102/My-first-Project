import { useState } from "react";

export default function Signup({ onSignup, onBackToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await onSignup({
        name: name.trim(),
        email: email.trim(),
        password,
      });
    } catch (err) {
      console.error("Signup error:", err);

      const messages = {
        "auth/email-already-in-use":
          "This email is already registered.",

        "auth/invalid-email":
          "Please enter a valid email address.",

        "auth/weak-password":
          "Password is too weak.",

        "auth/network-request-failed":
          "Network error. Please check your internet connection.",

        "permission-denied":
          "You do not have permission to create this account."
      };

      setError(
        messages[err.code] ||
        err.message ||
        "Unable to create account."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center bg-light min-vh-100 px-3 py-4">

      <div className="login-card card border-0 shadow-lg rounded-4">

        <div className="text-center mb-4">

          <div className="login-icon text-dark mb-3">
            <i className="bi bi-person-plus-fill" />
          </div>

          <h1 className="fw-bold mb-1">
            Create Account
          </h1>

          <p className="text-muted mb-0">
            PC &amp; Laptop Inventory
          </p>

        </div>

        <form onSubmit={handleSubmit}>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Name
            </label>

            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Email
            </label>

            <input
              type="email"
              className="form-control form-control-lg"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Password
            </label>

            <input
              type="password"
              className="form-control form-control-lg"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Confirm Password
            </label>

            <input
              type="password"
              className="form-control form-control-lg"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {error && (
            <div className="alert alert-danger py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-dark btn-lg w-100"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Sign Up"}
          </button>

        </form>

        <button
          type="button"
          className="btn btn-link w-100 mt-3"
          onClick={onBackToLogin}
          disabled={loading}
        >
          Already have an account? Login
        </button>

        <small className="text-muted text-center d-block mt-1">
          New accounts are registered as Admin.
        </small>

      </div>
    </div>
  );
}