import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../features/auth/AuthContext';
import { useChangePassword, useUpdateProfile } from '../../features/users/users.hooks';
import { changePasswordSchema, updateProfileSchema } from '../../features/users/users.schemas';
import { getErrorMessage } from '../../utils/errors';
import '../../styles/pages/contact.css';

export default function ProfilePage() {
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
    <div className="profile-page">
      <div className="main_content">
        <div className="features-wrapper py-5">
          <div className="container">
            <h1 className="fw-bold text-center mb-4">Hồ sơ cá nhân</h1>
            <div className="row g-4 justify-content-center">
              <div className="col-12 col-lg-6">
                <div className="feature-card p-4">
                  <h5 className="fw-bold mb-3">Thông tin cá nhân</h5>
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
                <div className="feature-card p-4">
                  <h5 className="fw-bold mb-3">Đổi mật khẩu</h5>
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
            <p className="text-center text-muted mt-4 mb-0">
              <Link to={ROUTES.booking}>Đặt lịch sân</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
