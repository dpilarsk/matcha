import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Register from '@/components/Register'
import Login from '@/components/Login'
import Confirm from '@/components/Confirm'
import Forget from '@/components/Forget'
import Reset from '@/components/Reset'
import Suggestions from '@/components/Suggestions'
import Search from '@/components/Search'
import Informations from '@/components/Informations'
import Account from '@/components/Account'
import Profile from '@/components/Profile'
import History from '@/components/History'
import Notifications from '@/components/Notifications'
import Like from '@/components/Like'
import Messages from '@/components/Messages'

Vue.use(Router)

export default new Router({
	mode: 'history',
	routes: [
		{
			path: '/',
			name: 'HelloWorld',
			component: HelloWorld,
			meta: {
				requireAuth: false
			}
		},
		{
			path: '/register',
			name: 'Register',
			component: Register,
			meta: {
				requireAuth: false
			}
		},
		{
			path: '/confirm/:token',
			name: 'Confirm',
			component: Confirm,
			meta: {
				requireAuth: false
			}
		},
		{
			path: '/forget',
			name: 'Forget',
			component: Forget,
			meta: {
				requireAuth: false
			}
		},
		{
			path: '/reset/:token',
			name: 'Reset',
			component: Reset,
			meta: {
				requireAuth: false
			}
		},
		{
			path: '/suggestions',
			name: 'Suggestions',
			component: Suggestions,
			meta: {
				requireAuth: true,
				requireProfileComplete: true
			}
		},
		{
			path: '/search',
			name: 'Search',
			component: Search,
			meta: {
				requireAuth: true,
				requireProfileComplete: true
			}
		},
		{
			path: '/informations',
			name: 'Informations',
			component: Informations,
			meta: {
				requireAuth: true,
				requireProfileComplete: false
			}
		},
		{
			path: '/history',
			name: 'History',
			component: History,
			meta: {
				requireAuth: true,
				requireProfileComplete: false
			}
		},
		{
			path: '/notifications',
			name: 'Notifications',
			component: Notifications,
			meta: {
				requireAuth: true,
				requireProfileComplete: true
			}
		},
		{
			path: '/likes',
			name: 'Like',
			component: Like,
			meta: {
				requireAuth: true,
				requireProfileComplete: true
			}
		},
		{
			path: '/talks',
			name: 'Messages',
			component: Messages,
			meta: {
				requireAuth: true,
				requireProfileComplete: true
			}
		},
		{
			path: '/profile/:id',
			name: 'Profile',
			component: Profile,
			meta: {
				requireAuth: true,
				requireProfileComplete: true
			}
		},
		{
			path: '/account',
			name: 'Account',
			component: Account,
			meta: {
				requireAuth: true,
				requireProfileComplete: false
			}
		},
		{
			path: '/login',
			name: 'Login',
			component: Login,
			meta: {
				requireAuth: false
			}
		},
		{
			path: '/logout',
			name: 'Logout',
			meta: {
				requireAuth: true
			}
		},
		{
			path: '/*',
			redirect: '/'
		}
	]
})
