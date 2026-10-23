import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../constants/queryKeys';
import {
  createNewsPostApi,
  deleteNewsPostApi,
  fetchNewsPostsApi,
  updateNewsPostApi,
} from '../../features/newsPosts/newsPosts.api';
import { formatDateTime } from '../../utils/format';
import { getErrorMessage } from '../../utils/errors';
import SiteImagePicker from '../../components/admin/SiteImagePicker';
import { saveSiteContentWithPendingImage } from '../../features/siteContent/siteContentUpload.api';
import { NEWS_POST_STATUS_LABELS } from '../../constants/newsPostLabels';
import { getNextContentId } from '../../utils/contentId';

const emptyForm = { title: '', excerpt: '', imageUrl: '', status: 'Draft' };

export default function AdminNewsPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [pendingImageFile, setPendingImageFile] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.newsPosts({ admin: true, list: true }),
    queryFn: () => fetchNewsPostsApi({ limit: 100 }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['newsPosts'] });

  const saveMutation = useMutation({
    mutationFn: () =>
      saveSiteContentWithPendingImage({
        editingId,
        form,
        pendingImageFile,
        createApi: createNewsPostApi,
        updateApi: updateNewsPostApi,
      }),
    onSuccess: () => {
      setMessage({ type: 'success', text: editingId ? 'Đã cập nhật bài viết.' : 'Đã thêm bài viết.' });
      setEditingId(null);
      setForm(emptyForm);
      setPendingImageFile(null);
      invalidate();
    },
    onError: (err) => setMessage({ type: 'danger', text: getErrorMessage(err) }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteNewsPostApi(id),
    onSuccess: () => {
      if (editingId) {
        setEditingId(null);
        setForm(emptyForm);
      }
      invalidate();
    },
    onError: (err) => setMessage({ type: 'danger', text: getErrorMessage(err) }),
  });

  function startEdit(post) {
    setEditingId(post.id);
    setForm({
      title: post.title ?? '',
      excerpt: post.excerpt ?? '',
      imageUrl: post.imageUrl ?? '',
      status: post.status ?? 'Draft',
    });
    setPendingImageFile(null);
    setMessage({ type: '', text: '' });
  }

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setPendingImageFile(null);
    setMessage({ type: '', text: '' });
  }

  const posts = data?.items ?? [];
  const nextPostId = getNextContentId(posts, data?.meta?.total);
  const formDisplayId = editingId ?? nextPostId;

  return (
    <>
      <div className="content-header">
        <h1>Quản lý tin tức</h1>
      </div>
      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>{message.text}</div>
      )}
      <div className="card">
        <div className="card-header">
          <span>Danh sách bài viết</span>
          <button type="button" className="btn btn-primary" onClick={startCreate}>
            <i className="fa-solid fa-plus me-1" /> Thêm bài
          </button>
        </div>
        <div className="card-body table-responsive">
          {isLoading && <p className="text-muted mb-0">Đang tải…</p>}
          {isError && <p className="text-danger mb-0">Không tải được dữ liệu. Kiểm tra migration 002 và API.</p>}
          {!isLoading && !isError && (
            <table className="table table-hover table-crud align-middle">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tiêu đề</th>
                  <th>Trạng thái</th>
                  <th>Cập nhật</th>
                  <th className="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td>{post.id}</td>
                    <td>{post.title}</td>
                    <td>
                      <span
                        className={`badge ${post.status === 'Published' ? 'badge-published' : 'badge-draft'}`}
                      >
                        {NEWS_POST_STATUS_LABELS[post.status] ?? post.status}
                      </span>
                    </td>
                    <td>{formatDateTime(post.updatedAt)}</td>
                    <td className="text-end text-nowrap">
                      <div className="btn-action-group d-inline-flex gap-2">
                        <button type="button" className="btn btn-outline-secondary" onClick={() => startEdit(post)}>
                          Sửa
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            if (window.confirm('Xóa bài viết này?')) deleteMutation.mutate(post.id);
                          }}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <div className="card">
        <div className="card-header">{editingId ? `Sửa bài #${editingId}` : 'Thêm bài mới'}</div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-2">
              <label className="form-label" htmlFor="news-id">
                ID
              </label>
              <input
                id="news-id"
                type="text"
                className="form-control"
                readOnly
                disabled
                value={formDisplayId}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="news-title">
                Tiêu đề
              </label>
              <input
                id="news-title"
                type="text"
                className="form-control"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label" htmlFor="news-status">
                Trạng thái
              </label>
              <select
                id="news-status"
                className="form-select"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                <option value="Draft">{NEWS_POST_STATUS_LABELS.Draft}</option>
                <option value="Published">{NEWS_POST_STATUS_LABELS.Published}</option>
              </select>
            </div>
            <div className="col-12">
              <label className="form-label" htmlFor="news-excerpt">
                Tóm tắt
              </label>
              <textarea
                id="news-excerpt"
                className="form-control"
                rows={3}
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              />
            </div>
            <div className="col-md-6">
              <SiteImagePicker
                id="news-image"
                label="Ảnh tin tức"
                imageUrl={form.imageUrl}
                pendingFile={pendingImageFile}
                onPendingFileChange={setPendingImageFile}
                onImageUrlChange={(imageUrl) => setForm((f) => ({ ...f, imageUrl }))}
                disabled={saveMutation.isPending}
              />
            </div>
            <div className="col-12">
              <button
                type="button"
                className="btn btn-warning"
                disabled={!form.title.trim() || saveMutation.isPending}
                onClick={() => saveMutation.mutate()}
              >
                {saveMutation.isPending ? 'Đang lưu…' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
