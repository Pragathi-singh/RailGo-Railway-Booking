import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import FieldMessage from '../components/FieldMessage';
import { useAuth } from '../context/AuthContext';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const successMessage = location.state?.message;
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => {
    event.preventDefault();
    if (!form.email || !form.password) { setError('Enter both your email address and password.'); return; }
    setSubmitting(true);
    const result = await login(form.email, form.password);
    setSubmitting(false);
    if (!result.ok) { setError(result.message); return; }
    navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
  };
  return <AuthLayout title="Welcome back" eyebrow="GOOD TO SEE YOU" intro="Sign in to continue your journey." prompt="New to RailGo?" promptLink="/signup" promptLabel="Create an account">
    <form className="auth-form" onSubmit={submit} noValidate>
      {successMessage && <FieldMessage id="login-success">{successMessage}</FieldMessage>}
      {error && <FieldMessage error id="login-error">{error}</FieldMessage>}
      <label className="field"><span>Email address</span><input name="email" type="email" autoComplete="email" value={form.email} onChange={update} placeholder="you@example.com" aria-describedby={error ? 'login-error' : undefined} required /></label>
      <label className="field"><span>Password</span><div className="password-control"><input name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={form.password} onChange={update} required /><button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-pressed={showPassword}>{showPassword ? 'Hide' : 'Show'}</button></div></label>
      <button className="button button--full" type="submit" disabled={submitting}>{submitting ? 'Signing in…' : 'Log in to RailGo'} <span aria-hidden="true">→</span></button>
    </form>
  </AuthLayout>;
}

export default Login;
