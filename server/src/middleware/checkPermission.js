/** Require a permission code previously loaded onto req.user by verifyToken. */
export function checkPermission(requiredPermission) {
  if (typeof requiredPermission !== 'string' || !requiredPermission.trim()) {
    throw new TypeError('requiredPermission must be a non-empty string');
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Yêu cầu xác thực trước' });
    }

    if (!req.user.permissions?.includes(requiredPermission)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền thực hiện thao tác này' });
    }

    return next();
  };
}

export default checkPermission;
