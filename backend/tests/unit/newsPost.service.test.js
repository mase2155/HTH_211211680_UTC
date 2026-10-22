const { ERROR_CODES } = require('../../src/constants/errorCodes');

jest.mock('../../src/modules/newsPosts/newsPost.repository');
const newsPostRepository = require('../../src/modules/newsPosts/newsPost.repository');
const newsPostService = require('../../src/modules/newsPosts/newsPost.service');

describe('newsPostService', () => {
  beforeEach(() => jest.clearAllMocks());

  test('getById trả 404 khi không tồn tại', async () => {
    newsPostRepository.findById.mockResolvedValue(null);
    await expect(newsPostService.getById(999)).rejects.toMatchObject({
      status: 404,
      code: ERROR_CODES.NOT_FOUND,
    });
  });

  test('create gọi repository insert', async () => {
    const row = { id: 1, title: 'Tin', status: 'Draft' };
    newsPostRepository.insert.mockResolvedValue(row);
    const result = await newsPostService.create({ title: 'Tin', status: 'Draft' });
    expect(result).toEqual(row);
  });
});
