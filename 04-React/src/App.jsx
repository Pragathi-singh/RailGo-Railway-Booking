import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Signup from "./pages/Signup";
import SearchResults from "./pages/SearchResults";
import PassengerDetails from "./pages/PassengerDetails";
import DemoPayment from "./pages/DemoPayment";
import Confirmation from "./pages/Confirmation";
import HistoryCancel from "./pages/HistoryCancel";
import Profile from "./pages/Profile";

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/search-results" element={<SearchResults />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/passengers" element={<PassengerDetails />} />
            <Route path="/passenger-details" element={<PassengerDetails />} />
            <Route path="/payment" element={<DemoPayment />} />
            <Route path="/demo-payment" element={<DemoPayment />} />
            <Route path="/confirmation" element={<Confirmation />} />
            <Route path="/history" element={<HistoryCancel />} />
            <Route path="/cancel" element={<HistoryCancel />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
