// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import router from './router'
import VueResource from 'vue-resource'
import VueLocalStorage from 'vue-ls'
import VueJWT from 'vuejs-jwt'
import 'vue-use-vuex'
import Vuex from 'vuex'
import App from './App'
import Vuetify from 'vuetify'
import store from './store/UsersStore.js'
import 'vuetify/dist/vuetify.min.css'
import * as VueGoogleMaps from 'vue2-google-maps'
import lodash from 'lodash'
import VueLodash from 'vue-lodash'
import VueSocketio from 'vue-socket.io'

let options = {
	namespace: 'matcha__'
}

Vue.use(VueGoogleMaps, {
	load: {
		key: 'AIzaSyATVRR2IIe6FF5KxTw5keIVQkFaOibX468',
		libraries: 'places,drawing,visualization'
	}
})
Vue.use(Vuetify, { theme: {
	primary: '#00B0FF',
	secondary: '#424242',
	accent: '#82B1FF',
	error: '#FF5252',
	info: '#2196F3',
	success: '#4CAF50',
	warning: '#FFC107'
}})
Vue.use(Vuex)
Vue.use(VueLocalStorage, options)
Vue.use(VueJWT, {signKey: 'demo', keyName: 'matcha__token'})
Vue.use(VueResource)
Vue.use(VueLodash, lodash)
Vue.use(VueSocketio, 'http://localhost:8082', store)

Vue.config.productionTip = false

router.beforeEach((to, from, next) => {
	if (to.meta.requireAuth === true) {
		if (Vue.$jwt.getToken() !== null) {
			let token = JSON.parse(Vue.$jwt.getToken()).value
			if (token && store.state.user === null) {
				if ((Vue.$jwt.decode(token)) !== null) {
					store.commit('CREATE_USER', Vue.$jwt.decode(JSON.parse(Vue.$jwt.getToken()).value).user)
					store.commit('LOGIN')
				} else {
					Vue.ls.remove('token')
					if (store.state.logged === true) store.commit('LOGOUT')
					next('/login')
				}
			}
		}
		if (to.meta.requireProfileComplete === true) {
			if (!store.state.user.biography || store.state.user.biography === null) next({ name: 'Informations' })
		} else if (to.name === 'Logout') {
			Vue.ls.remove('token')
			if (store.state.logged === true) store.commit('LOGOUT')
			store.commit('DELETE_USER')
			next('/login')
		} else if (!Vue.ls.get('token')) {
			if (store.state.logged === true) store.commit('LOGOUT')
			store.commit('DELETE_USER')
			next('/login')
		} else if (Vue.$jwt.getToken() !== null) {
			let token = JSON.parse(Vue.$jwt.getToken()).value
			if (token) {
				if ((Vue.$jwt.decode(token)) !== null) next()
				else {
					Vue.ls.remove('token')
					store.commit('DELETE_USER')
					if (store.state.logged === true) store.commit('LOGOUT')
					next('/login')
				}
			} else {
				Vue.ls.remove('token')
				store.commit('DELETE_USER')
				if (store.state.logged === true) store.commit('LOGOUT')
				next('/login')
			}
		} else next('/login')
	} else if (!to.meta.requireAuth && (to.name === 'Login' || to.name === 'Register')) {
		if (Vue.ls.get('token')) {
			if (store.state.logged === false) store.commit('LOGIN')
			if (store.state.user === null) store.commit('CREATE_USER', Vue.$jwt.decode(JSON.parse(Vue.$jwt.getToken()).value).user)
			next('/')
		} else next()
	} else next()
})

/* eslint-disable no-new */
new Vue({
	store,
	el: '#app',
	router,
	components: { App },
	template: '<App/>'
})
