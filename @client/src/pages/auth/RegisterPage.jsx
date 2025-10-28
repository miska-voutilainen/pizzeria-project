import { useState } from 'react';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSendVerify = async () => {
    if (!formData.username) {
      return setError('Username is required');
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return setError('Valid email required');
    }
    try {
      const res = await fetch('/api/send-verify-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.username, email: formData.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setIsEmailSent(true);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm) return setError("Passwords don't match");
    if (formData.password.length < 6) return setError('Password too short');
    setIsChecking(true);
    setError('');
    try {
      const check = await fetch('/api/check-email-verified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.username }),
      });
      const { verified } = await check.json();
      if (!verified) {
        return setError('Email not verified. Click the link in your email.');
      }
      const reg = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.username, password: formData.password }),
      });
      const regData = await reg.json();
      if (!reg.ok) throw new Error(regData.message);
      alert('Registered! Going to login...');
      window.location.href = '/login';
    } catch (e) {
      setError(e.message);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleRegister}>
        <input
          placeholder="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 px-3 py-2 mb-2 rounded"
        />
        <div className="flex mb-2">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="grow border border-gray-300 px-3 py-2 rounded-l"
          />
          <button
            type="button"
            onClick={handleSendVerify}
            disabled={isEmailSent}
            className="px-4 py-2 bg-gray-200 rounded-r"
          >
            {isEmailSent ? 'Sent' : 'Send Verification'}
          </button>
        </div>
        <div>
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 px-3 py-2 mb-2 rounded"
        />
        </div>
        <div>
        <input
          type="password"
          name="confirm"
          placeholder="Confirm"
          value={formData.confirm}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 px-3 py-2 mb-2 rounded"
        />
        </div>
        <div>
        <button
          type="submit"
          disabled={isChecking}
          className="w-full bg-blue-500 text-white py-3 rounded"
        >
          {isChecking ? 'Checking...' : 'Register'}
        </button>
        </div>
      </form>
      {isEmailSent && (
        <p className="text-sm mt-4">
          Verification link sent. Check your email!
        </p>
      )}
      <div name="login-link">
        <p>Already have an account?</p>
        <Link to="/login" style={{ color: 'blue', textDecoration: 'underline' }}>Login</Link>
      </div>
    </div>
  );
};

export default RegisterPage;