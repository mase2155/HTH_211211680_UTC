import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import ProtectedRoute from '../features/auth/ProtectedRoute';
import AuthLayout from '../layouts/AuthLayout';
import ClientLayout from '../layouts/ClientLayout';

const HomePage = lazy(() => import('../pages/client/HomePage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const BookingPage = lazy(() => import('../pages/client/BookingPage'));
const NewsPage = lazy(() => import('../pages/client/NewsPage'));
const PartnersPage = lazy(() => import('../pages/client/PartnersPage'));
const ContactPage = lazy(() => import('../pages/client/ContactPage'));
const ProfilePage = lazy(() => import('../pages/client/ProfilePage'));
const MyBookingsPage = lazy(() => import('../pages/client/MyBookingsPage'));
const PaymentPage = lazy(() => import('../pages/client/PaymentPage'));
const SearchFieldsPage = lazy(() => import('../pages/client/SearchFieldsPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));
const AdminLayout = lazy(() => import('../layouts/AdminLayout'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminNewsPage = lazy(() => import('../pages/admin/AdminNewsPage'));
const AdminPartnersPage = lazy(() => import('../pages/admin/AdminPartnersPage'));
const AdminBookingsPage = lazy(() => import('../pages/admin/AdminBookingsPage'));
const AdminFieldsPage = lazy(() => import('../pages/admin/AdminFieldsPage'));
const AdminOrderStatusPage = lazy(() => import('../pages/admin/AdminOrderStatusPage'));
const AdminFieldTypesPage = lazy(() => import('../pages/admin/AdminFieldTypesPage'));

function PageLoader() {
  return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <div className="spinner-border text-warning" role="status" aria-label="Đang tải trang" />
    </div>
  );
}

function suspense(element) {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  {
    element: <ClientLayout />,
    children: [
      { index: true, element: suspense(<HomePage />) },
      { path: ROUTES.booking.slice(1), element: suspense(<BookingPage />) },
      { path: ROUTES.search.slice(1), element: suspense(<SearchFieldsPage />) },
      { path: ROUTES.news.slice(1), element: suspense(<NewsPage />) },
      { path: ROUTES.partners.slice(1), element: suspense(<PartnersPage />) },
      { path: ROUTES.contact.slice(1), element: suspense(<ContactPage />) },
      {
        element: <ProtectedRoute />,
        children: [
          { path: ROUTES.profile.slice(1), element: suspense(<ProfilePage />) },
          { path: ROUTES.history.slice(1), element: suspense(<MyBookingsPage />) },
          { path: 'payment/:bookingId', element: suspense(<PaymentPage />) },
        ],
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: ROUTES.login.slice(1), element: suspense(<LoginPage />) },
      { path: ROUTES.register.slice(1), element: suspense(<RegisterPage />) },
    ],
  },
  {
    path: ROUTES.admin,
    element: <ProtectedRoute roles={['Admin']} />,
    children: [
      {
        element: suspense(<AdminLayout />),
        children: [
          { index: true, element: suspense(<AdminDashboard />) },
          { path: 'content/news', element: suspense(<AdminNewsPage />) },
          { path: 'content/partners', element: suspense(<AdminPartnersPage />) },
          { path: 'operations/bookings', element: suspense(<AdminBookingsPage />) },
          { path: 'catalog/field-types', element: suspense(<AdminFieldTypesPage />) },
          { path: 'operations/fields', element: suspense(<AdminFieldsPage />) },
          { path: 'operations/order-status', element: suspense(<AdminOrderStatusPage />) },
        ],
      },
    ],
  },
  { path: '/admin-demo', element: <Navigate to={ROUTES.admin} replace /> },
  { path: '/admin-demo/*', element: <Navigate to={ROUTES.admin} replace /> },
  { path: '*', element: suspense(<NotFoundPage />) },
]);
