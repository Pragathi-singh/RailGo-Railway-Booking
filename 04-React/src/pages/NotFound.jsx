import { Link } from 'react-router-dom';
function NotFound() {
  return <section className="not-found container"><span className="not-found-number">404</span><p className="eyebrow">SIGNAL LOST</p><h1>This route has left the station.</h1><p>We couldn’t find the page you were looking for. Let’s get you back on track.</p><Link className="button" to="/">Return home <span>→</span></Link></section>;
}
export default NotFound;
