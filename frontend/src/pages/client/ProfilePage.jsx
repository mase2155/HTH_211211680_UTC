import { useAuth } from '../../features/auth/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="profile-page page-placeholder">
      <h1 className="fw-bold">Hồ sơ cá nhân</h1>
      {user && (
        <ul className="list-unstyled text-start">
          <li>
            <strong>Họ tên:</strong> {user.fullName}
          </li>
          <li>
            <strong>Email:</strong> {user.email}
          </li>
          <li>
            <strong>Vai trò:</strong> {user.role}
          </li>
        </ul>
      )}
      <p className="text-muted">Chỉnh sửa thông tin và đổi mật khẩu sẽ được bổ sung sau.</p>
    </div>
  );
}
