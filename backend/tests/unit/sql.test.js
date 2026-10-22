const { escapeLike, splitSqlBatches, isUniqueViolationOf } = require('../../src/utils/sql');

describe('sql utils', () => {
  test('escapeLike escape các ký tự đặc biệt % _ [ \\', () => {
    expect(escapeLike('50%_[a]\\')).toBe('50\\%\\_\\[a]\\\\');
  });

  test('splitSqlBatches tách theo dòng GO và bỏ batch rỗng', () => {
    const script = 'SELECT 1;\nGO\nSELECT 2;\n  go  \n\nGO\n';
    expect(splitSqlBatches(script)).toEqual(['SELECT 1;', 'SELECT 2;']);
  });

  test('isUniqueViolationOf nhận diện đúng tên index', () => {
    const error = { number: 2601, message: "Cannot insert duplicate key ... 'UX_Bookings_ActiveSlot'" };
    expect(isUniqueViolationOf(error, 'UX_Bookings_ActiveSlot')).toBe(true);
    expect(isUniqueViolationOf(error, 'UQ_Users_Email')).toBe(false);
  });
});
