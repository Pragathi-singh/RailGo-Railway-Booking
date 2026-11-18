import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FieldMessage from "../components/FieldMessage";
import { useBooking } from "../context/BookingContext";

function PassengerDetails() {
  const navigate = useNavigate();
  const { search, selectedTrain, choosePassengers } = useBooking();
  const [passenger, setPassenger] = useState({
    name: "",
    age: "",
    gender: "",
    berth: "No preference",
  });
  const [error, setError] = useState("");
  const update = (event) =>
    setPassenger({ ...passenger, [event.target.name]: event.target.value });
  const submit = (event) => {
    event.preventDefault();
    if (
      !passenger.name.trim() ||
      Number(passenger.age) < 1 ||
      Number(passenger.age) > 120 ||
      !passenger.gender
    ) {
      setError("Enter the passenger name, a valid age and gender.");
      return;
    }
    choosePassengers([
      { ...passenger, name: passenger.name.trim(), age: Number(passenger.age) },
    ]);
    navigate("/demo-payment");
  };
  if (!search || !selectedTrain) {
    return (
      <div className="booking-page">
        <section className="container empty-state">
          <h1>Complete a train search first</h1>
          <Link className="button" to="/search-results">
            View demo trains
          </Link>
        </section>
      </div>
    );
  }
  return (
    <div className="booking-page">
      <section className="booking-hero">
        <div className="container">
          <Link className="back-link" to="/search-results">
            ← Change train
          </Link>
          <p className="eyebrow eyebrow--orange">PASSENGER DETAILS</p>
          <h1>
            Who is <em>travelling?</em>
          </h1>
        </div>
      </section>
      <section className="container booking-content booking-grid">
        <form className="form-card" onSubmit={submit} noValidate>
          {error && <FieldMessage error>{error}</FieldMessage>}
          <label className="field">
            <span>Passenger name</span>
            <input
              name="name"
              value={passenger.name}
              onChange={update}
              placeholder="As on government ID"
            />
          </label>
          <div className="form-row">
            <label className="field">
              <span>Age</span>
              <input
                name="age"
                type="number"
                min="1"
                max="120"
                value={passenger.age}
                onChange={update}
              />
            </label>
            <label className="field">
              <span>Gender</span>
              <select name="gender" value={passenger.gender} onChange={update}>
                <option value="">Select</option>
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
              </select>
            </label>
          </div>
          <label className="field">
            <span>Berth preference</span>
            <select name="berth" value={passenger.berth} onChange={update}>
              <option>No preference</option>
              <option>Lower berth</option>
              <option>Middle berth</option>
              <option>Upper berth</option>
            </select>
          </label>
          <button className="button button--full" type="submit">
            Continue to payment <span>→</span>
          </button>
        </form>
        <aside className="journey-summary">
          <p className="eyebrow">YOUR JOURNEY</p>
          <h2>
            {search.from} → {search.to}
          </h2>
          <p>
            {selectedTrain.name} · {selectedTrain.number}
          </p>
          <p>
            {search.date} · {search.travelClass}
          </p>
          <hr />
          <div className="fare-line">
            <span>Base fare</span>
            <strong>₹{selectedTrain.fare}</strong>
          </div>
        </aside>
      </section>
    </div>
  );
}

export default PassengerDetails;
