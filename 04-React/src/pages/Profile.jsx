import { useState } from "react";
import FieldMessage from "../components/FieldMessage";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    fullName: user.fullName,
    email: user.email,
    mobile: user.mobile,
  });
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");
  const update = (event) =>
    setForm({ ...form, [event.target.name]: event.target.value });
  const submit = (event) => {
    event.preventDefault();
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "Enter a valid email address.";
    if (!/^[6-9]\d{9}$/.test(form.mobile.replace(/[\s()-]/g, "")))
      next.mobile = "Enter a valid 10-digit Indian mobile number.";
    if (Object.keys(next).length) {
      setErrors(next);
      setNotice("");
      return;
    }
    const result = updateProfile(form);
    if (!result.ok) {
      setErrors({ [result.field]: result.message });
      return;
    }
    setErrors({});
    setNotice("Your RailGo profile has been updated.");
  };
  return (
    <div className="booking-page">
      <section className="booking-hero">
        <div className="container">
          <p className="eyebrow eyebrow--orange">MY ACCOUNT</p>
          <h1>
            Traveller <em>profile</em>
          </h1>
        </div>
      </section>
      <section className="container booking-content profile-layout">
        <aside className="profile-card">
          <div className="dashboard-avatar">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <h2>{user.fullName}</h2>
          <p>{user.email}</p>
          <span className="demo-pill">Demo account</span>
        </aside>
        <form className="form-card" onSubmit={submit} noValidate>
          {notice && <FieldMessage id="profile-success">{notice}</FieldMessage>}
          <label className="field">
            <span>Full name</span>
            <input name="fullName" value={form.fullName} onChange={update} />
            {errors.fullName && (
              <FieldMessage error>{errors.fullName}</FieldMessage>
            )}
          </label>
          <label className="field">
            <span>Email address</span>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={update}
            />
            {errors.email && <FieldMessage error>{errors.email}</FieldMessage>}
          </label>
          <label className="field">
            <span>Mobile number</span>
            <input name="mobile" value={form.mobile} onChange={update} />
            {errors.mobile && (
              <FieldMessage error>{errors.mobile}</FieldMessage>
            )}
          </label>
          <button className="button" type="submit">
            Save changes
          </button>
        </form>
      </section>
    </div>
  );
}

export default Profile;
