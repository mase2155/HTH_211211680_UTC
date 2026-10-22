import PageBreadcrumb from '../../components/ui/PageBreadcrumb';
import { newsPosts } from '../../constants/newsPosts';
import '../../styles/pages/news.css';

function NewsPostItem({ post }) {
  return (
    <section className="itemNews">
      <div className="postItem">
        <div className="postThumbnail">
          <a href="#top">
            <img src={post.image} alt={post.imageAlt} />
          </a>
        </div>
        <div className="postDetails">
          <div className="postMeta">
            <span className="metaDate">{post.date}</span>
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
  return (
    <div className="news-page" id="top">
      <div className="all-section">
        <PageBreadcrumb current="Tin Tức" />
        <div className="main-content container">
          {newsPosts.map((post) => (
            <NewsPostItem key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}
