import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Register from '@/components/Register'
import Login from '@/components/Login'
import Confirm from '@/components/Confirm'

Vue.use(Router)

export default new Router({
	mode: 'history',
	routes: [
		{
			path: '/',
			name: 'HelloWorld',
			component: HelloWorld
		},
		{
			path: '/register',
			name: 'Register',
			component: Register
		},
		{
			path: '/confirm/:token',
			name: 'Confirm',
			component: Confirm
		},
		{
			path: '/login',
			name: 'Login',
			component: Login
		},
		{
			path: '/logout',
			name: 'Logout'
		}
	]
})
