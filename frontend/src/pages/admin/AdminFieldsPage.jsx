import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../constants/queryKeys';
import { fetchFieldsApi, updateFieldApi } from '../../features/fields/fields.api';
import { getErrorMessage } from '../../utils/errors';

const FIELD_STATUSES = ['Active', 'Maintenance', 'Inactive'];

export default function AdminFieldsPage() {
  const queryClient = useQueryClient();
  const filters = { status: undefined, limit: 100 };

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.adminFields(filters),
    queryFn: () => fetchFieldsApi(filters),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => updateFieldApi(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'fields'] }),
  });

  const fields = data?.items ?? [];

  return (
    <>
      <div className="content-header">
        <h1>Quản lý sân</h1>
        <p className="breadcrumb-demo">Section 2 / Sân</p>
      </div>
      {updateMutation.isError && (
        <div className="alert alert-danger">{getErrorMessage(updateMutation.error)}</div>
      )}
      <div className="card">
        <div className="card-header">
          <span>Danh sách sân</span>
          <span className="small text-muted fw-normal">Cập nhật trạng thái lưu ngay khi đổi</span>
        </div>
        <div className="card-body table-responsive">
          {isLoading && <p className="text-muted mb-0">Đang tải…</p>}
          {isError && <p className="text-danger mb-0">Không tải được danh sách sân.</p>}
          {!isLoading && !isError && (
            <table className="table table-hover table-crud">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên sân</th>
                  <th>Loại</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((f) => (
                  <tr key={f.id}>
                    <td>{f.id}</td>
                    <td>{f.name}</td>
                    <td>{f.fieldTypeName}</td>
                    <td>
                      <select
                        className="form-select"
                        style={{ maxWidth: '11rem' }}
                        value={f.status}
                        disabled={updateMutation.isPending}
                        onChange={(e) => updateMutation.mutate({ id: f.id, status: e.target.value })}
                      >
                        {FIELD_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
