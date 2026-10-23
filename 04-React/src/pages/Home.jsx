import { useState } from 'react';
import { Link } from 'react-router-dom';

const initialSearch = { from: '', to: '', date: '', travelClass: 'AC 3 Tier' };

function Home() {
  const [search, setSearch] = useState(initialSearch);
  const [notice, setNotice] = useState('');
  const update = (event) => setSearch({ ...search, [event.target.name]: event.target.value });
  const swapStations = () => setSearch({ ...search, from: search.to, to: search.from });
  const submit = (event) => {
    event.preventDefault();
    if (!search.from || !search.to || !search.date) {
      setNotice('Choose your departure, destination and journey date to search for trains.');
      return;
    }
    setNotice(`Live train results are not available for ${search.from} to ${search.to} on ${new Date(`${search.date}T00:00:00`).toLocaleDateString('en-IN', { dateStyle: 'long' })} right now. Please try another date or route.`);
  };

  return (
    <>
      <section className="hero">
        <div className="hero-overlay" />
        <div className="container hero-content">
          <p className="eyebrow eyebrow--orange">THE JOURNEY BEGINS HERE</p>
          <h1>Explore India, <br /><em>One Journey at a Time</em></h1>
          <p className="hero-subtitle">Your Journey, Our Priority</p>
          <p className="hero-description">From bustling cities to quiet coastlines, discover the joy of travelling by rail.</p>
        </div>
        <div className="search-card container">
          <div className="search-heading"><div><p className="eyebrow">PLAN YOUR JOURNEY</p><h2>Where will you go next?</h2></div><span className="demo-pill">Search trains</span></div>
          <form onSubmit={submit} className="search-form">
            <div className="station-fields">
              <label className="input-wrap"><span>From</span><input name="from" value={search.from} onChange={update} placeholder="Departure station" /></label>
              <button className="swap-button" type="button" onClick={swapStations} aria-label="Swap departure and destination">⇄</button>
              <label className="input-wrap"><span>To</span><input name="to" value={search.to} onChange={update} placeholder="Destination station" /></label>
            </div>
            <label className="input-wrap"><span>Journey date</span><input name="date" type="date" min={new Date().toISOString().split('T')[0]} value={search.date} onChange={update} /></label>
            <label className="input-wrap"><span>Travel class</span><select name="travelClass" value={search.travelClass} onChange={update}><option>AC 3 Tier</option><option>AC 2 Tier</option><option>AC First Class</option><option>Sleeper</option><option>Chair Car</option></select></label>
            <button className="button search-button" type="submit">Explore trains <span aria-hidden="true">→</span></button>
          </form>
          {notice && <p className="search-notice" role="status">{notice}</p>}
        </div>
      </section>
      <section className="section container benefits">
        <div className="section-heading"><p className="eyebrow">WHY RAILGO</p><h2>Travel thoughtfully. <em>Arrive inspired.</em></h2><p>Everything you need for a smoother, more memorable railway journey.</p></div>
        <div className="benefit-grid">
          <article className="benefit-card"><span className="feature-icon">✦</span><h3>Simple planning</h3><p>Bring your route, date and class together in one calm, clear experience.</p></article>
          <article className="benefit-card"><span className="feature-icon">⌁</span><h3>Made for India</h3><p>Thoughtful details for the long-distance journeys that connect our country.</p></article>
          <article className="benefit-card"><span className="feature-icon">♡</span><h3>Journey-first design</h3><p>Less noise, more confidence — so the best part of travel can begin sooner.</p></article>
        </div>
      </section>
      <section className="quote-band"><div className="container quote-content"><p>“The world is a book and those who do not travel read only one page.”</p><span>— Saint Augustine</span><Link className="button button--light" to="/signup">Start your journey <span>→</span></Link></div></section>
      <footer className="footer"><div className="container footer-content"><div><Link className="brand brand--light" to="/"><span className="brand-mark" aria-hidden="true">R</span><span>Rail<span>Go</span></span></Link><p>Your Journey, Our Priority</p></div><p className="footer-note">Thoughtful journeys begin with a simpler way to plan.</p></div></footer>
    </>
  );
}

export default Home;
