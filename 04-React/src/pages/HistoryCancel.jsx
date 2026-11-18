import { useState } from "react";
import { Link } from "react-router-dom";
import FieldMessage from "../components/FieldMessage";
import { useBooking } from "../context/BookingContext";

function HistoryCancel() {
  const { bookings, cancelBooking } = useBooking();
  const [notice, setNotice] = useState("");
  const cancel = (booking) => {
    if (booking.status === "Cancelled") return;
    cancelBooking(booking.id);
    setNotice(`Booking ${booking.id} was cancelled.`);
  };
  return (
    <div className="booking-page">
      <section className="booking-hero">
        <div className="container">
          <p className="eyebrow eyebrow--orange">YOUR JOURNEYS</p>
          <h1>
            Trip <em>history</em>
          </h1>
        </div>
      </section>
      <section className="container booking-content">
        {notice && <FieldMessage id="cancel-notice">{notice}</FieldMessage>}
        {!bookings.length ? (
          <div className="empty-state">
            <h2>No trips yet</h2>
            <p>Your demo bookings will appear here.</p>
            <Link className="button" to="/search-results">
              Find a train
            </Link>
          </div>
        ) : (
          <div className="history-list">
            {bookings.map((booking) => (
              <article className="history-card" key={booking.id}>
                <div>
                  <span className="trip-status">{booking.status}</span>
                  <h2>
                    {booking.search.from} → {booking.search.to}
                  </h2>
                  <p>
                    {booking.train.name} · {booking.train.number}
                  </p>
                </div>
                <div className="history-details">
                  <span>{booking.search.date}</span>
                  <span>{booking.passengers.length} passenger</span>
                  <strong>₹{booking.train.fare}</strong>
                </div>
                <div className="history-actions">
                  <span>{booking.id}</span>
                  {booking.status !== "Cancelled" && (
                    <button
                      className="button button--outline button--small"
                      type="button"
                      onClick={() => cancel(booking)}
                    >
                      Cancel booking
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default HistoryCancel;
