import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FieldMessage from "../components/FieldMessage";
import { useBooking } from "../context/BookingContext";

function DemoPayment() {
  const navigate = useNavigate();
  const { search, selectedTrain, passengers, createBooking } = useBooking();
  const [method, setMethod] = useState("UPI");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const pay = (event) => {
    event.preventDefault();
    if (!confirmed) {
      setError("Please confirm this is a demo payment.");
      return;
    }
    const booking = createBooking({
      method,
      status: "Demo paid",
      amount: selectedTrain.fare,
    });
    navigate("/confirmation", { state: { bookingId: booking.id } });
  };
  if (!search || !selectedTrain || passengers.length === 0) {
    return (
      <div className="booking-page">
        <section className="container empty-state">
          <h1>Add passenger details first</h1>
          <Link className="button" to="/passenger-details">
            Continue
          </Link>
        </section>
      </div>
    );
  }
  return (
    <div className="booking-page">
      <section className="booking-hero">
        <div className="container">
          <Link className="back-link" to="/passenger-details">
            ← Passenger details
          </Link>
          <p className="eyebrow eyebrow--orange">DEMO PAYMENT</p>
          <h1>
            Review and <em>complete</em>
          </h1>
        </div>
      </section>
      <section className="container booking-content booking-grid">
        <form className="form-card" onSubmit={pay}>
          {error && <FieldMessage error>{error}</FieldMessage>}
          <div className="payment-methods">
            {["UPI", "Card", "Net banking"].map((item) => (
              <button
                type="button"
                key={item}
                className={
                  method === item ? "payment-option active" : "payment-option"
                }
                onClick={() => setMethod(item)}
              >
                {item}
              </button>
            ))}
          </div>
          {method === "UPI" && (
            <label className="field">
              <span>Demo UPI ID</span>
              <input defaultValue="traveller@demo" disabled />
            </label>
          )}
          {method === "Card" && (
            <>
              <label className="field">
                <span>Demo card number</span>
                <input defaultValue="4242 4242 4242 4242" disabled />
              </label>
              <div className="form-row">
                <label className="field">
                  <span>Expiry</span>
                  <input defaultValue="12/30" disabled />
                </label>
                <label className="field">
                  <span>CVV</span>
                  <input defaultValue="123" disabled />
                </label>
              </div>
            </>
          )}
          {method === "Net banking" && (
            <label className="field">
              <span>Demo bank</span>
              <input defaultValue="RailGo Demo Bank" disabled />
            </label>
          )}
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
            />
            I understand no real payment will be processed.
          </label>
          <button className="button button--full" type="submit">
            Pay ₹{selectedTrain.fare} (demo)
          </button>
        </form>
        <aside className="journey-summary">
          <p className="eyebrow">FARE SUMMARY</p>
          <h2>{selectedTrain.name}</h2>
          <p>
            {passengers[0].name} · {passengers.length} passenger
          </p>
          <hr />
          <div className="fare-line">
            <span>Ticket fare</span>
            <strong>₹{selectedTrain.fare}</strong>
          </div>
        </aside>
      </section>
    </div>
  );
}

export default DemoPayment;
