const User = require('../models/userModel');

// GET /api/admin/users
// List users with basic pagination for admin panel
async function getUsers(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().select('-password').skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(),
    ]);

    return res.json({
      success: true,
      message: 'Users fetched',
      data: {
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/admin/users/:id/role
// Allow admin to change a user's role (user/admin)
async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, message: 'User role updated', user });
  } catch (error) {
    next(error);
  }
}

// GET /api/admin/dashboard
// Simple stats to show in admin dashboard
async function getDashboard(req, res, next) {
  try {
    const [totalUsers, admins, normalUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'user' }),
    ]);

    return res.json({
      success: true,
      message: 'Dashboard stats',
      data: {
        totalUsers,
        admins,
        users: normalUsers,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUsers,
  updateUserRole,
  getDashboard,
};
