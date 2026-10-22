import { Outlet } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import Header from '../components/layout/Header';

export default function ClientLayout() {
  return (
    <div className="client-layout">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
