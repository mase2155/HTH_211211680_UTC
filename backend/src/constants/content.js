const NEWS_POST_STATUS = Object.freeze({
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
});

module.exports = {
  NEWS_POST_STATUS,
  NEWS_POST_STATUS_VALUES: Object.freeze(Object.values(NEWS_POST_STATUS)),
};
