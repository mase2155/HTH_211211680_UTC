import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

export default function PageBreadcrumb({ current }) {
  return (
    <section className="breadcrumbSection">
      <div className="container">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumbList">
            <li className="breadcrumbItem">
              <Link to={ROUTES.home} className="breadcrumbLink">
                Trang chủ
              </Link>
            </li>
            <li className="breadcrumbSeparator">&gt;</li>
            <li className="breadcrumbItem">
              <span className="breadcrumbCurrent">{current}</span>
            </li>
          </ol>
        </nav>
      </div>
    </section>
  );
}
