import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Shield, CheckCircle } from 'lucide-react';
import { checkPasswordStrength } from '../utils/passwordStrength';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
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

    const result = await login(formData.email, formData.password);

    if (result.success) {
      toast.success('Successfully logged in!');
      navigate('/');
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
          <h2>Welcome Back</h2>
          <p>Login to continue to FitTrack</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                name="email"
                id="email"
                placeholder=" "
                value={formData.email}
                onChange={handleChange}
                required
              />
              <label htmlFor="email">Email</label>
            </div>
            <div className="form-group">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                placeholder=" "
                value={formData.password}
                onChange={handleChange}
                required
              />
              <label htmlFor="password">Password</label>
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Password Strength Indicator */}
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

            <button type="submit" className={`auth-btn ${isLoading ? 'btn-loading' : ''}`} disabled={isLoading}>
              {isLoading ? <span className="spinner"></span> : 'Login'}
            </button>
          </form>
          <div className="auth-links">
            <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;