import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const trips = [
  { route: 'Mumbai → Goa', detail: 'Coastal escapes · 3 days', color: 'coral' },
  { route: 'Delhi → Jaipur', detail: 'Royal streets · 2 days', color: 'gold' },
  { route: 'Chennai → Kochi', detail: 'Southern trails · 5 days', color: 'teal' },
];

function Dashboard() {
  const { user } = useAuth();
  return <div className="dashboard-page"><section className="dashboard-hero"><div className="container dashboard-heading"><div><p className="eyebrow eyebrow--orange">YOUR RAILGO SPACE</p><h1>Good to see you, <em>{user.fullName.split(' ')[0]}.</em></h1><p>Keep dreaming about the next place you’ll wake up.</p></div><div className="dashboard-avatar" aria-hidden="true">{user.fullName.charAt(0).toUpperCase()}</div></div></section>
    <section className="container dashboard-content"><div className="dashboard-summary"><div><p className="eyebrow">A LITTLE INSPIRATION</p><h2>Where could the tracks take you?</h2></div><span className="demo-pill">My account</span></div><div className="trip-grid">{trips.map((trip) => <article className={`trip-card trip-card--${trip.color}`} key={trip.route}><span className="trip-icon">↗</span><div><h3>{trip.route}</h3><p>{trip.detail}</p></div><span className="trip-arrow" aria-hidden="true">→</span></article>)}</div><div className="dashboard-cta"><div><h2>Ready to plan a route?</h2><p>Search for trains and sketch out your next adventure.</p></div><Link className="button" to="/">Plan a journey <span>→</span></Link></div></section>
  </div>;
}

export default Dashboard;
