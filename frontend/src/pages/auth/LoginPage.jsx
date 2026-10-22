import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../features/auth/AuthContext';
import { loginSchema } from '../../features/auth/auth.schemas';
import { getErrorMessage } from '../../utils/errors';

export default function LoginPage() {
  const { login, isAuthenticated, loginState } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  if (isAuthenticated) {
    const redirectTo = location.state?.from || ROUTES.home;
    return <Navigate to={redirectTo} replace />;
  }

  const onSubmit = async (values) => {
    setFormError('');
    try {
      await login(values);
      navigate(location.state?.from || ROUTES.home, { replace: true });
    } catch (error) {
      setFormError(getErrorMessage(error, 'Đăng nhập thất bại'));
    }
  };

  const busy = isSubmitting || loginState.isPending;

  return (
    <div className="auth-page login-page">
      <div className="login-card">
        <div className="avatar-section">
          <div className="circle-bg">
            <div className="laptop-icon">
              <i className="fa-solid fa-laptop" />
            </div>
          </div>
          <span className="shape shape-1" />
          <span className="shape shape-2" />
          <span className="shape shape-3" />
          <span className="shape shape-4" />
        </div>
        <div className="form-section">
          <h2>Đăng nhập</h2>
          {formError && (
            <div className="alert alert-danger alert-auth" role="alert">
              {formError}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="input-group">
              <i className="fa-solid fa-envelope icon" />
              <input type="email" placeholder="Email" autoComplete="email" {...register('email')} />
            </div>
            {errors.email && <p className="form-error-text">{errors.email.message}</p>}

            <div className="input-group">
              <i className="fa-solid fa-lock icon" />
              <input
                type="password"
                placeholder="Mật khẩu"
                autoComplete="current-password"
                {...register('password')}
              />
            </div>
            {errors.password && <p className="form-error-text">{errors.password.message}</p>}

            <button type="submit" className="btn-login" disabled={busy}>
              {busy ? 'Đang xử lý...' : 'ĐĂNG NHẬP'}
            </button>
          </form>
          <div className="links">
            <p className="getHome">
              <Link to={ROUTES.home}>Về trang chủ</Link>
            </p>
            <p className="getRegister">
              <Link to={ROUTES.register} className="create-account">
                Tạo tài khoản mới
              </Link>
            </p>
          </div>
        </div>
      </div>
      <section className="auth-caption">
        <div className="author">
          <p>
            Created by{' '}
            <span>
              Hung Mase |{' '}
              <a href="https://www.facebook.com/hungmaseco2k5" target="_blank" rel="noreferrer">
                FB: Lê Đình Hùng
              </a>
            </span>
          </p>
        </div>
      </section>
    </div>
  );
}
