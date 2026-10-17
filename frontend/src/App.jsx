import { Routes, Route } from 'react-router-dom';
import ClientLayout from './layouts/ClientLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import Home from './pages/client/Home.jsx';
import SearchFields from './pages/client/SearchFields.jsx';
import FieldDetail from './pages/client/FieldDetail.jsx';
import FieldSchedule from './pages/client/FieldSchedule.jsx';
import Booking from './pages/client/Booking.jsx';
import Payment from './pages/client/Payment.jsx';
import BookingHistory from './pages/client/BookingHistory.jsx';
import Profile from './pages/client/Profile.jsx';
import Login from './pages/client/Login.jsx';
import Register from './pages/client/Register.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import UserManagement from './pages/admin/UserManagement.jsx';
import FieldTypeManagement from './pages/admin/FieldTypeManagement.jsx';
import FieldManagement from './pages/admin/FieldManagement.jsx';
import TimeSlotManagement from './pages/admin/TimeSlotManagement.jsx';
import PriceManagement from './pages/admin/PriceManagement.jsx';
import BookingManagement from './pages/admin/BookingManagement.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<ClientLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchFields />} />
        <Route path="/fields/:id" element={<FieldDetail />} />
        <Route path="/fields/:id/schedule" element={<FieldSchedule />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/history" element={<BookingHistory />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="field-types" element={<FieldTypeManagement />} />
        <Route path="fields" element={<FieldManagement />} />
        <Route path="time-slots" element={<TimeSlotManagement />} />
        <Route path="prices" element={<PriceManagement />} />
        <Route path="bookings" element={<BookingManagement />} />
      </Route>
    </Routes>
  );
}
