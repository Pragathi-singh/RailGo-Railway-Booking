import { Link, useLocation } from "react-router-dom";
import { useBooking } from "../context/BookingContext";

function Confirmation() {
  const location = useLocation();
  const { bookings } = useBooking();
  const booking =
    bookings.find((item) => item.id === location.state?.bookingId) ||
    bookings[0];
  if (!booking)
    return (
      <div className="booking-page">
        <section className="container empty-state">
          <h1>No booking to confirm</h1>
          <Link className="button" to="/">
            Start a journey
          </Link>
        </section>
      </div>
    );
  return (
    <div className="booking-page">
      <section className="confirmation-hero">
        <div className="container confirmation-card">
          <div className="confirm-icon">✓</div>
          <p className="eyebrow">BOOKING CONFIRMED</p>
          <h1>
            Your journey is <em>all set</em>
          </h1>
          <p>
            Demo booking <strong>{booking.id}</strong>
          </p>
        </div>
      </section>
      <section className="container booking-content">
        <div className="form-card confirmation-details">
          <div>
            <span>Passenger</span>
            <strong>{booking.passengers[0].name}</strong>
          </div>
          <div>
            <span>Train</span>
            <strong>
              {booking.train.name} · {booking.train.number}
            </strong>
          </div>
          <div>
            <span>Route</span>
            <strong>
              {booking.search.from} → {booking.search.to}
            </strong>
          </div>
          <div>
            <span>Date & class</span>
            <strong>
              {booking.search.date} · {booking.search.travelClass}
            </strong>
          </div>
          <div className="confirmation-actions">
            <Link className="button" to="/history">
              View my trips
            </Link>
            <Link className="button button--outline" to="/">
              Plan another journey
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Confirmation;
