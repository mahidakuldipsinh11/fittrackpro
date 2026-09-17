import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import './Auth.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await forgotPassword(email);

    if (result.success) {
      setIsSent(true);
      toast.success('Password reset link sent to your email.');
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
          {isSent ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <CheckCircle size={48} color="#22c55e" />
              </div>
              <h2>Check Your Email</h2>
              <p>We've sent a password reset link to <strong>{email}</strong>. The link is valid for 1 hour — open it to create a new password.</p>
              <button className="auth-btn" onClick={() => navigate('/login')}>
                Back to Login
              </button>
            </>
          ) : (
            <>
              <h2>Forgot Password</h2>
              <p>Enter your account email and we'll send you a reset link.</p>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder=" "
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setIsError(false); }}
                    required
                  />
                  <label htmlFor="email">Email</label>
                  <Mail size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--steel-dim)' }} />
                </div>
                <button type="submit" className={`auth-btn ${isLoading ? 'btn-loading' : ''}`} disabled={isLoading}>
                  {isLoading ? <span className="spinner"></span> : 'Send Reset Link'}
                </button>
              </form>
              <div className="auth-links">
                <p><Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}><ArrowLeft size={14} /> Back to Login</Link></p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;