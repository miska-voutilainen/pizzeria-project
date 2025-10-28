import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(null);

  useEffect(() => {
    if (!token) {
      setServerMessage('Invalid or missing token');
      setIsTokenValid(false);
      return;
    }
    const validateToken = async () => {
      try {
        const response = await fetch(`/api/reset-password/${token}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Invalid token');
        }
        setIsTokenValid(true);
      } catch (err) {
        setServerMessage(err.message || 'Invalid or expired token');
        setIsTokenValid(false);
      }
    };
    validateToken();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
    setServerMessage('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(formData.password))
      newErrors.password = 'Password must include uppercase, lowercase, and a number';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm Password is required';
    else if (formData.confirmPassword !== formData.password) newErrors.confirmPassword = 'Passwords do not match';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/api/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: formData.password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Reset failed');
      setFormData({ password: '', confirmPassword: '' });
      setServerMessage('Password changed successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setServerMessage(err.message || 'Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token || isTokenValid === false) {
    return (
      <div className="max-w-md mx-auto mt-8 p-4 text-center">
        Error: {serverMessage || 'Invalid or missing token'}
        <br />
        <Link to="/login" className="text-blue-500 underline">Login</Link>
      </div>
    );
  }

  if (isTokenValid === null) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  const isSubmitEnabled =
    isTokenValid &&
    formData.password &&
    formData.confirmPassword &&
    Object.keys(validate()).length === 0;

  return (
    <div className="max-w-md mx-auto mt-8 p-4">
      <h2 className="text-2xl font-bold mb-4">Reset Your Password</h2>
      <p className="text-sm mb-4">Password must be at least 8 characters and include at least one uppercase letter, one lowercase letter, and one number.</p>
      <form onSubmit={handleSubmit}>
        {serverMessage && (
          <div className={`mb-4 ${serverMessage.includes('successfully') ? 'text-green-500' : 'text-red-500'}`}>
            {serverMessage}
          </div>
        )}
        <div className="mb-4">
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className="w-full border border-black px-3 py-2 mb-1"
          />
          {errors.password && <div className="text-red-500 text-sm">{errors.password}</div>}
        </div>
        <div className="mb-4">
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
            className="w-full border border-black px-3 py-2 mb-1"
          />
          {errors.confirmPassword && <div className="text-red-500 text-sm">{errors.confirmPassword}</div>}
        </div>
        <button
          type="submit"
          disabled={!isSubmitEnabled || isLoading}
          className="w-full bg-blue-500 text-white py-2 rounded disabled:bg-gray-400"
        >
          {isLoading ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;