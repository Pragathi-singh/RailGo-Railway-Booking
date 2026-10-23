import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import FieldMessage from '../components/FieldMessage';
import { useAuth } from '../context/AuthContext';

const initial = { fullName: '', email: '', mobile: '', password: '', confirmPassword: '' };
function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [show, setShow] = useState({ password: false, confirmPassword: false });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const validate = () => {
    const next = {};
    if (!form.fullName.trim() || form.fullName.trim().length > 100) next.fullName = 'Enter your name (up to 100 characters).';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = 'Enter a valid email address.';
    if (!/^[6-9]\d{9}$/.test(form.mobile.replace(/[\s()-]/g, ''))) next.mobile = 'Enter a valid 10-digit Indian mobile number.';
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.password)) next.password = 'Use 8+ characters with uppercase, lowercase and a number.';
    if (!form.confirmPassword || form.confirmPassword !== form.password) next.confirmPassword = 'Your passwords do not match.';
    return next;
  };
  const submit = async (event) => {
    event.preventDefault();
    const next = validate();
    if (Object.keys(next).length) { setErrors(next); return; }
    setSubmitting(true);
    const result = await signup(form);
    setSubmitting(false);
    if (!result.ok) { setErrors({ [result.field]: result.message }); return; }
    navigate('/login', { state: { message: 'Your RailGo demo account is ready. Please log in.' } });
  };
  return <AuthLayout title="Create your account" eyebrow="A NEW JOURNEY STARTS HERE" intro="Join RailGo and bring your travel plans together." prompt="Already have an account?" promptLink="/login" promptLabel="Log in">
    <div className="demo-warning" role="note"><strong>Demo only.</strong> Your account stays in this browser. This is not production-secure authentication.</div>
    <form className="auth-form" onSubmit={submit} noValidate>
      <label className="field"><span>Full name</span><input name="fullName" autoComplete="name" maxLength="100" value={form.fullName} onChange={update} required />{errors.fullName && <FieldMessage error>{errors.fullName}</FieldMessage>}</label>
      <label className="field"><span>Email address</span><input name="email" type="email" autoComplete="email" value={form.email} onChange={update} required />{errors.email && <FieldMessage error>{errors.email}</FieldMessage>}</label>
      <label className="field"><span>Mobile number</span><input name="mobile" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="10-digit Indian mobile number" value={form.mobile} onChange={update} required />{errors.mobile ? <FieldMessage error>{errors.mobile}</FieldMessage> : <FieldMessage>Numbers beginning with 6, 7, 8 or 9</FieldMessage>}</label>
      <label className="field"><span>Password</span><div className="password-control"><input name="password" type={show.password ? 'text' : 'password'} autoComplete="new-password" value={form.password} onChange={update} required /><button type="button" className="password-toggle" onClick={() => setShow({ ...show, password: !show.password })} aria-pressed={show.password}>{show.password ? 'Hide' : 'Show'}</button></div>{errors.password && <FieldMessage error>{errors.password}</FieldMessage>}</label>
      <label className="field"><span>Confirm password</span><div className="password-control"><input name="confirmPassword" type={show.confirmPassword ? 'text' : 'password'} autoComplete="new-password" value={form.confirmPassword} onChange={update} required /><button type="button" className="password-toggle" onClick={() => setShow({ ...show, confirmPassword: !show.confirmPassword })} aria-pressed={show.confirmPassword}>{show.confirmPassword ? 'Hide' : 'Show'}</button></div>{errors.confirmPassword && <FieldMessage error>{errors.confirmPassword}</FieldMessage>}</label>
      <button className="button button--full" type="submit" disabled={submitting}>{submitting ? 'Creating account…' : 'Create demo account'} <span aria-hidden="true">→</span></button>
    </form>
  </AuthLayout>;
}

export default Signup;
