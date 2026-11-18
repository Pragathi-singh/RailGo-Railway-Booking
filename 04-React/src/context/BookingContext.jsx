import { createContext, useContext, useEffect, useMemo, useState } from "react";

const BookingContext = createContext(null);
const API = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:3011";

export function BookingProvider({ children }) {
  const [search, setSearch] = useState(null);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [bookings, setBookings] = useState([]);

  const refreshBookings = async () => {
    const response = await fetch(`${API}/api/bookings`, { credentials: "include" });
    if (response.status === 401) {
      setBookings([]);
      return;
    }
    const data = await response.json();
    setBookings(data.bookings || []);
  };

  useEffect(() => {
    refreshBookings();
  }, []);

  const saveDraft = (next) => {
  };
  const chooseSearch = (value) => {
    setSearch(value);
    saveDraft({ search: value, selectedTrain: null, passengers: [] });
  };
  const chooseTrain = (train) => {
    setSelectedTrain(train);
    saveDraft({ search, selectedTrain: train, passengers });
  };
  const choosePassengers = (value) => {
    setPassengers(value);
    saveDraft({ search, selectedTrain, passengers: value });
  };
  const createBooking = async (payment) => {
    const response = await fetch(`${API}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        scheduleId: selectedTrain?.id,
        passengers,
        payment,
      }),
    });
    const data = await response.json();
    if (!data.ok) throw new Error(data.message || "Booking failed.");
    return data;
  };
  const cancelBooking = async (id) => {
    await fetch(`${API}/api/bookings/${id}/cancel`, {
      method: "POST",
      credentials: "include",
    });
    await refreshBookings();
  };
  const value = useMemo(
    () => ({
      search,
      selectedTrain,
      passengers,
      bookings,
      chooseSearch,
      chooseTrain,
      choosePassengers,
      createBooking,
      cancelBooking,
    }),
    [search, selectedTrain, passengers, bookings],
  );
  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

export const useBooking = () => useContext(BookingContext);
