import { useQuery } from '@tanstack/react-query';
import PageBreadcrumb from '../../components/ui/PageBreadcrumb';
import { queryKeys } from '../../constants/queryKeys';
import { fetchNewsPostsApi } from '../../features/newsPosts/newsPosts.api';
import { formatDate } from '../../utils/format';
import '../../styles/pages/news.css';

function NewsPostItem({ post }) {
  const imageSrc = post.imageUrl || '';
  return (
    <section className="itemNews">
      <div className="postItem">
        <div className="postThumbnail">
          <a href="#top">
            {imageSrc ? <img src={imageSrc} alt={post.title} /> : null}
          </a>
        </div>
        <div className="postDetails">
          <div className="postMeta">
            <span className="metaDate">{formatDate(post.updatedAt || post.createdAt)}</span>
            <span className="metaComments">0 COMMENTS</span>
          </div>
          <h2 className="postTitle">
            <a href="#top">{post.title}</a>
          </h2>
          <p className="postExcerpt">{post.excerpt}</p>
          <div className="postAction">
            <a href="#top" className="readMoreBtn">
              Read more &gt;
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function NewsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.newsPosts({ public: true, status: 'Published' }),
    queryFn: () => fetchNewsPostsApi({ status: 'Published', limit: 50 }),
  });

  const posts = data?.items ?? [];

  return (
    <div className="news-page" id="top">
      <div className="all-section">
        <PageBreadcrumb current="Tin Tức" />
        <div className="main-content container">
          {isLoading && <p className="text-muted">Đang tải tin tức…</p>}
          {isError && <p className="text-danger">Không tải được tin tức. Vui lòng thử lại sau.</p>}
          {!isLoading && !isError && posts.length === 0 && (
            <p className="text-muted">Chưa có bài viết nào được xuất bản.</p>
          )}
          {posts.map((post) => (
            <NewsPostItem key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}
