import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { ADMIN_PROFILE } from '../../constants/adminProfile';
import { useAuth } from '../../features/auth/AuthContext';
import { useChangePassword, useUpdateProfile } from '../../features/users/users.hooks';
import { changePasswordSchema, updateProfileSchema } from '../../features/users/users.schemas';
import { getErrorMessage } from '../../utils/errors';
import '../../styles/pages/profile.css';

function AdminProfileView() {
  const { user } = useAuth();
  const changePassword = useChangePassword();
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const passwordForm = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onPasswordSubmit = async (values) => {
    setPasswordError('');
    setPasswordMsg('');
    try {
      await changePassword.mutateAsync(values);
      setPasswordMsg('Đã đổi mật khẩu.');
      passwordForm.reset();
    } catch (error) {
      setPasswordError(getErrorMessage(error));
    }
  };

  const email = user?.email ?? ADMIN_PROFILE.email;
  const phone = user?.phone ?? ADMIN_PROFILE.phone;

  return (
    <>
      <div className="profile-hero">
        <span className="profile-hero-badge">Quản trị viên hệ thống</span>
        <h2>{ADMIN_PROFILE.fullName}</h2>
        <p className="profile-hero-id">Mã số: {ADMIN_PROFILE.studentId}</p>
      </div>
      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <div className="profile-info-card">
            <h5>
              <i className="fa-solid fa-user-graduate me-2 text-warning" />
              Thông tin sinh viên
            </h5>
            <dl className="profile-dl">
              <dt>Họ và tên</dt>
              <dd>{ADMIN_PROFILE.fullName}</dd>
              <dt>Mã số sinh viên</dt>
              <dd>{ADMIN_PROFILE.studentId}</dd>
              <dt>Lớp / Khóa</dt>
              <dd>{ADMIN_PROFILE.className}</dd>
              <dt>Liên hệ</dt>
              <dd>
                <a href={`tel:${phone}`}>{phone}</a>
              </dd>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${email}`}>{email}</a>
              </dd>
            </dl>
          </div>
        </div>
        <div className="col-12 col-lg-6">
          <div className="profile-info-card">
            <h5>
              <i className="fa-solid fa-chalkboard-user me-2 text-warning" />
              {ADMIN_PROFILE.supervisor.title}
            </h5>
            <dl className="profile-dl">
              <dt>Giảng viên hướng dẫn</dt>
              <dd>{ADMIN_PROFILE.supervisor.name}</dd>
              <dt>Liên hệ</dt>
              <dd>
                <a href={`tel:${ADMIN_PROFILE.supervisor.phone}`}>{ADMIN_PROFILE.supervisor.phone}</a>
              </dd>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${ADMIN_PROFILE.supervisor.email}`}>{ADMIN_PROFILE.supervisor.email}</a>
              </dd>
            </dl>
          </div>
        </div>
        <div className="col-12 col-lg-6 mx-auto">
          <div className="profile-info-card">
            <h5>
              <i className="fa-solid fa-lock me-2 text-warning" />
              Bảo mật tài khoản
            </h5>
            {passwordMsg && <div className="alert alert-success py-2">{passwordMsg}</div>}
            {passwordError && <div className="alert alert-danger py-2">{passwordError}</div>}
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} noValidate>
              <div className="mb-3">
                <label className="form-label">Mật khẩu hiện tại</label>
                <input type="password" className="form-control" {...passwordForm.register('currentPassword')} />
              </div>
              <div className="mb-3">
                <label className="form-label">Mật khẩu mới</label>
                <input type="password" className="form-control" {...passwordForm.register('newPassword')} />
              </div>
              <div className="mb-3">
                <label className="form-label">Xác nhận mật khẩu mới</label>
                <input type="password" className="form-control" {...passwordForm.register('confirmPassword')} />
              </div>
              <button type="submit" className="btn btn-warning" disabled={changePassword.isPending}>
                {changePassword.isPending ? 'Đang xử lý...' : 'Đổi mật khẩu'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

function CustomerProfileView() {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const [profileMsg, setProfileMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const profileForm = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { fullName: '', phone: '' },
  });

  const passwordForm = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({ fullName: user.fullName ?? '', phone: user.phone ?? '' });
    }
  }, [user, profileForm]);

  const onProfileSubmit = async (values) => {
    setProfileError('');
    setProfileMsg('');
    try {
      await updateProfile.mutateAsync({
        fullName: values.fullName,
        phone: values.phone || null,
      });
      setProfileMsg('Đã cập nhật hồ sơ.');
    } catch (error) {
      setProfileError(getErrorMessage(error));
    }
  };

  const onPasswordSubmit = async (values) => {
    setPasswordError('');
    setPasswordMsg('');
    try {
      await changePassword.mutateAsync(values);
      setPasswordMsg('Đã đổi mật khẩu.');
      passwordForm.reset();
    } catch (error) {
      setPasswordError(getErrorMessage(error));
    }
  };

  return (
    <div className="row g-4 justify-content-center">
      <div className="col-12 col-lg-6">
        <div className="profile-info-card">
          <h5>Thông tin cá nhân</h5>
          {profileMsg && <div className="alert alert-success py-2">{profileMsg}</div>}
          {profileError && <div className="alert alert-danger py-2">{profileError}</div>}
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} noValidate>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" value={user?.email ?? ''} disabled />
            </div>
            <div className="mb-3">
              <label className="form-label">Họ và tên</label>
              <input type="text" className="form-control" {...profileForm.register('fullName')} />
              {profileForm.formState.errors.fullName && (
                <p className="form-error-text">{profileForm.formState.errors.fullName.message}</p>
              )}
            </div>
            <div className="mb-3">
              <label className="form-label">Số điện thoại</label>
              <input type="tel" className="form-control" {...profileForm.register('phone')} />
              {profileForm.formState.errors.phone && (
                <p className="form-error-text">{profileForm.formState.errors.phone.message}</p>
              )}
            </div>
            <button type="submit" className="btn btn-warning" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </form>
        </div>
      </div>
      <div className="col-12 col-lg-6">
        <div className="profile-info-card">
          <h5>Đổi mật khẩu</h5>
          {passwordMsg && <div className="alert alert-success py-2">{passwordMsg}</div>}
          {passwordError && <div className="alert alert-danger py-2">{passwordError}</div>}
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} noValidate>
            <div className="mb-3">
              <label className="form-label">Mật khẩu hiện tại</label>
              <input type="password" className="form-control" {...passwordForm.register('currentPassword')} />
            </div>
            <div className="mb-3">
              <label className="form-label">Mật khẩu mới</label>
              <input type="password" className="form-control" {...passwordForm.register('newPassword')} />
            </div>
            <div className="mb-3">
              <label className="form-label">Xác nhận mật khẩu mới</label>
              <input type="password" className="form-control" {...passwordForm.register('confirmPassword')} />
            </div>
            <button type="submit" className="btn btn-warning" disabled={changePassword.isPending}>
              {changePassword.isPending ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  return (
    <div className="profile-page">
      <div className="main_content">
        <div className="features-wrapper py-5">
          <div className="container">
            <h1 className="fw-bold text-center mb-4">{isAdmin ? 'Hồ sơ quản trị viên' : 'Hồ sơ cá nhân'}</h1>
            {isAdmin ? <AdminProfileView /> : <CustomerProfileView />}
            <p className="text-center text-muted mt-4 mb-0">
              {!isAdmin && (
                <>
                  <Link to={ROUTES.history}>Lịch sử đặt sân</Link>
                  {' · '}
                </>
              )}
              <Link to={ROUTES.booking}>Đặt lịch sân</Link>
              {isAdmin && (
                <>
                  {' · '}
                  <Link to={ROUTES.admin}>Báo cáo hệ thống</Link>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
