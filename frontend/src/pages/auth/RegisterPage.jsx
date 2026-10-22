import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../features/auth/AuthContext';
import { registerSchema } from '../../features/auth/auth.schemas';
import { getErrorMessage } from '../../utils/errors';
import '../../styles/pages/register.css';

export default function RegisterPage() {
  const { register: registerUser, isAuthenticated, registerState } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  if (isAuthenticated) {
    return <Navigate to={ROUTES.home} replace />;
  }

  const onSubmit = async (values) => {
    setFormError('');
    const { confirmPassword: _confirm, phone, ...rest } = values;
    const payload = {
      ...rest,
      ...(phone ? { phone } : {}),
    };
    try {
      await registerUser(payload);
      navigate(ROUTES.home, { replace: true });
    } catch (error) {
      setFormError(getErrorMessage(error, 'Đăng ký thất bại'));
    }
  };

  const busy = isSubmitting || registerState.isPending;

  return (
    <div className="auth-page register-page">
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
          <h2>Đăng ký</h2>
          {formError && (
            <div className="alert alert-danger alert-auth" role="alert">
              {formError}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="input-group">
              <i className="fa-solid fa-user icon" />
              <input type="text" placeholder="Họ và tên" autoComplete="name" {...register('fullName')} />
            </div>
            {errors.fullName && <p className="form-error-text">{errors.fullName.message}</p>}

            <div className="input-group">
              <i className="fa-solid fa-envelope icon" />
              <input type="email" placeholder="Email" autoComplete="email" {...register('email')} />
            </div>
            {errors.email && <p className="form-error-text">{errors.email.message}</p>}

            <div className="input-group">
              <i className="fa-solid fa-phone icon" />
              <input type="tel" placeholder="Số điện thoại (tuỳ chọn)" autoComplete="tel" {...register('phone')} />
            </div>
            {errors.phone && <p className="form-error-text">{errors.phone.message}</p>}

            <div className="input-group">
              <i className="fa-solid fa-lock icon" />
              <input type="password" placeholder="Mật khẩu" autoComplete="new-password" {...register('password')} />
            </div>
            {errors.password && <p className="form-error-text">{errors.password.message}</p>}

            <div className="input-group">
              <i className="fa-solid fa-lock icon" />
              <input
                type="password"
                placeholder="Xác nhận mật khẩu"
                autoComplete="new-password"
                {...register('confirmPassword')}
              />
            </div>
            {errors.confirmPassword && <p className="form-error-text">{errors.confirmPassword.message}</p>}

            <button type="submit" className="btn-login" disabled={busy}>
              {busy ? 'Đang xử lý...' : 'ĐĂNG KÝ'}
            </button>
          </form>
          <div className="links">
            <p className="getHome">
              <Link to={ROUTES.home}>Về trang chủ</Link>
            </p>
            <p className="getRegister">
              <Link to={ROUTES.login} className="create-account">
                Đã có tài khoản? Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
      <section id="caption">
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
