const User = require('../models/User');
const logger = require('../utils/logger');

// Only the authenticated user may act on their own record.
const isOwner = (req) => req.user && String(req.user._id) === String(req.params.id);

exports.viewAllUsers = async (req, res) => {
	try {
		const users = await User.find().select('-password');
		res.json(users);
	} catch (error) {
		logger.error(error);
		res.status(500).json({ errors: ['Internal server error'] });
	}
};

exports.viewSingleUser = async (req, res) => {
	try {
		if (!isOwner(req)) return res.status(403).json({ errors: ['Forbidden'] });
		const { id } = req.params,
			user = await User.findById(id).select('-password');
		if (!user) return res.status(404).json({ errors: ['User not found'] });
		res.json(user);
	} catch (error) {
		logger.error(error);
		res.status(500).json({ errors: ['Internal server error'] });
	}
};

exports.updateUser = async (req, res) => {
	try {
		if (!isOwner(req)) return res.status(403).json({ errors: ['Forbidden'] });
		const { id } = req.params;
		// Whitelist updatable fields so callers cannot mass-assign password/other fields.
		const updates = {};
		if (req.body.name !== undefined) updates.name = req.body.name;
		if (req.body.email !== undefined) updates.email = req.body.email;
		const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
		if (!user) return res.status(404).json({ errors: ['User not found'] });
		res.json(user);
	} catch (error) {
		logger.error(error);
		res.status(500).json({ errors: ['Internal server error'] });
	}
};

exports.deleteUser = async (req, res) => {
	try {
		if (!isOwner(req)) return res.status(403).json({ errors: ['Forbidden'] });
		const { id } = req.params,
			user = await User.findByIdAndDelete(id).select('-password');
		if (!user) return res.status(404).json({ errors: ['User not found'] });
		res.json(user);
	} catch (error) {
		logger.error(error);
		res.status(500).json({ errors: ['Internal server error'] });
	}
};
