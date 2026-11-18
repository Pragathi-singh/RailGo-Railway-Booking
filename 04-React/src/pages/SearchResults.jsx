import { Link, useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";

const trains = [
  {
    id: "12627",
    name: "Karnataka Express",
    number: "12627",
    departure: "06:15",
    arrival: "14:40",
    duration: "8h 25m",
    fare: 1285,
    availability: "Available",
  },
  {
    id: "12431",
    name: "Rajdhani Express",
    number: "12431",
    departure: "09:30",
    arrival: "17:10",
    duration: "7h 40m",
    fare: 1640,
    availability: "Few seats",
  },
  {
    id: "22159",
    name: "Mumbai Superfast",
    number: "22159",
    departure: "18:20",
    arrival: "03:05",
    duration: "8h 45m",
    fare: 980,
    availability: "Available",
  },
];

function SearchResults() {
  const navigate = useNavigate();
  const { search, chooseTrain } = useBooking();
  const selectTrain = (train) => {
    chooseTrain(train);
    navigate("/passenger-details");
  };
  const dateLabel = search?.date
    ? new Date(`${search.date}T00:00:00`).toLocaleDateString("en-IN", {
        dateStyle: "medium",
      })
    : "Choose a journey";
  return (
    <div className="booking-page">
      <section className="booking-hero">
        <div className="container">
          <Link className="back-link" to="/">
            ← Modify search
          </Link>
          <p className="eyebrow eyebrow--orange">AVAILABLE TRAINS</p>
          <h1>
            {search?.from || "From"} <em>to</em> {search?.to || "Destination"}
          </h1>
          <p>
            {dateLabel} · {search?.travelClass || "AC 3 Tier"}
          </p>
        </div>
      </section>
      <section className="container booking-content">
        <div className="booking-toolbar">
          <h2>3 demo trains</h2>
          <span className="demo-pill">Front-end demo</span>
        </div>
        {!search ? (
          <div className="empty-state">
            <h2>Plan a journey first</h2>
            <p>Choose stations and a date on the home page.</p>
            <Link className="button" to="/">
              Search trains
            </Link>
          </div>
        ) : (
          <div className="train-list">
            {trains.map((train) => (
              <article className="train-card" key={train.id}>
                <div className="train-main">
                  <span className="train-number">{train.number}</span>
                  <h3>{train.name}</h3>
                  <span
                    className={
                      train.availability === "Few seats"
                        ? "seat-alert"
                        : "seat-ok"
                    }
                  >
                    {train.availability}
                  </span>
                </div>
                <div className="train-time">
                  <strong>{train.departure}</strong>
                  <span>{search.from}</span>
                </div>
                <div className="train-duration">
                  <span>— {train.duration} —</span>
                </div>
                <div className="train-time">
                  <strong>{train.arrival}</strong>
                  <span>{search.to}</span>
                </div>
                <div className="train-fare">
                  <span>Starts from</span>
                  <strong>₹{train.fare}</strong>
                  <button
                    className="button button--small"
                    type="button"
                    onClick={() => selectTrain(train)}
                  >
                    Select
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default SearchResults;
