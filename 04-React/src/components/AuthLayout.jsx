import { Link } from 'react-router-dom';

function AuthLayout({ children, title, eyebrow, intro, prompt, promptLink, promptLabel }) {
  return (
    <div className="auth-page">
      <aside className="auth-visual">
        <Link className="brand brand--light" to="/"><span className="brand-mark" aria-hidden="true">R</span><span>Rail<span>Go</span></span></Link>
        <div className="auth-visual-copy">
          <p className="eyebrow">YOUR NEXT ADVENTURE AWAITS</p>
          <h2>Every mile has a story worth telling.</h2>
          <p>Make space for new views, old cities and the people you meet along the way.</p>
        </div>
        <span className="image-credit">Photo inspiration from Unsplash</span>
      </aside>
      <section className="auth-panel" aria-labelledby="auth-title">
        <div className="auth-form-wrap">
          <Link className="back-home" to="/">← Back to home</Link>
          <p className="eyebrow">{eyebrow}</p>
          <h1 id="auth-title">{title}</h1>
          <p className="auth-intro">{intro}</p>
          {children}
          <p className="auth-switch">{prompt} <Link to={promptLink}>{promptLabel}</Link></p>
        </div>
      </section>
    </div>
  );
}

export default AuthLayout;
