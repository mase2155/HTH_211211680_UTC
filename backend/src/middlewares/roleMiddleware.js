exports.requireRole = (role) => {
  return (req, res, next) => {
    res.status(501).json({ message: `Chưa triển khai: phân quyền ${role}` });
  };
};
