const
	express		=	require('express'),
	router		=	express.Router(),
	path		=	require('path'),
	controller	=	require(path.join(__dirname, '/../controllers/users.js'))

router.use((req, res, next) => {
	console.log('Time: ', Date.now())
	next()
})

router.route('/tags')
	.get(controller.getTags)

router.route('/users')
	.get(controller.index)
	.post(controller.create)

router.route('/users/login')
	.post(controller.login)

router.route('/users/informations')
	.patch(controller.update)

router.route('/users/account')
	// .get(controller.getAccount)
	.patch(controller.updateAccount)

router.route('/users/:username')
	.get(controller.read)
	.put(controller.update)
	.delete(controller.delete)

module.exports = router
