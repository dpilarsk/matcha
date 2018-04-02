const
	express		=	require('express'),
	router		=	express.Router(),
	path		=	require('path'),
	controller	=	require(path.join(__dirname, '/../controllers/notifications.js'))

router.route('/notifications')
	.get(controller.index)

module.exports = router
