import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Shield, CheckCircle } from 'lucide-react';
import { checkPasswordStrength } from '../utils/passwordStrength';
import './Auth.css';

const ResetPassword = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { resetPassword } = useAuth();
  const [formData, setFormData] = useState({ password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '#666', percentage: 0, checks: [] });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setIsError(false);
    if (e.target.name === 'password') {
      setPasswordStrength(checkPasswordStrength(e.target.value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const password = formData.password;
    if (password.length < 8 || password.length > 16) {
      setIsError(true);
      toast.error('Password must be 8-16 characters long.');
      setIsLoading(false);
      return;
    }
    if (formData.password !== formData.confirm) {
      setIsError(true);
      toast.error('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    const result = await resetPassword(uid, token, password);

    if (result.success) {
      toast.success('Password reset successfully! Please login.');
      navigate('/login');
    } else {
      setIsError(true);
      toast.error(result.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="auth-container">
      <div className={`auth-box ${isError ? 'shake' : 'slide-in'}`}>
        <div className="auth-box-content">
          <h2>Create New Password</h2>
          <p>Choose a new password for your FitTrack account.</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                placeholder=" "
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                maxLength={16}
              />
              <label htmlFor="password">New Password</label>
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {formData.password && (
              <div className="password-strength">
                <div className="password-strength__header">
                  <Shield size={14} color={passwordStrength.color} />
                  <span className="password-strength__label" style={{ color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="password-strength__bar">
                  <div
                    className="password-strength__fill"
                    style={{ width: `${passwordStrength.percentage}%`, backgroundColor: passwordStrength.color }}
                  />
                </div>
                <div className="password-strength__checks">
                  {passwordStrength.checks.map((check, i) => (
                    <div key={i} className={`password-strength__check ${check.passed ? 'passed' : ''}`}>
                      <CheckCircle size={12} />
                      <span>{check.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="form-group">
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirm"
                id="confirm"
                placeholder=" "
                value={formData.confirm}
                onChange={handleChange}
                required
                minLength={8}
                maxLength={16}
              />
              <label htmlFor="confirm">Confirm New Password</label>
            </div>

            <button type="submit" className={`auth-btn ${isLoading ? 'btn-loading' : ''}`} disabled={isLoading}>
              {isLoading ? <span className="spinner"></span> : 'Reset Password'}
            </button>
          </form>
          <div className="auth-links">
            <p>Remembered it? <Link to="/login">Back to Login</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;