// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import router from './router'
// import VueResource from 'vue-resource'
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
import axios from 'axios'
import VueAxios from 'vue-axios'

let options = {
	namespace: 'matcha__'
}

axios.defaults.baseURL = process.env.URL

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
Vue.use(VueLodash, lodash)
Vue.use(VueSocketio, process.env.SOCKETS, store)
Vue.use(VueAxios, axios)

Vue.config.productionTip = false
Vue.config.devtools = false
Vue.config.debug = false
Vue.config.silent = true

router.beforeEach((to, from, next) => {
	if (to.meta.requireAuth === true) {
		if (Vue.$jwt.getToken() !== null) {
			let token = JSON.parse(Vue.$jwt.getToken()).value
			if (token && store.state.user === null) {
				if ((Vue.$jwt.decode(token)) !== null) {
					store.commit('CREATE_USER', Vue.$jwt.decode(JSON.parse(Vue.$jwt.getToken()).value).user)
					store.commit('LOGIN')
				} else {
					let token = Vue.ls.get('token')
					Vue.ls.remove('token')
					new Vue().$socket.emit('disconnect_user', token)
					if (store.state.logged === true) store.commit('LOGOUT')
					next('/login')
				}
			}
		} else if (Vue.$jwt.getToken() == null) {
			store.commit('DELETE_USER')
			store.commit('LOGOUT')
			next('/login')
			return
		}
		new Vue().$socket.emit('connect_user', {'name': store.state.user.username})
		if (to.meta.requireProfileComplete === true) {
			if (!store.state.user.valid || store.state.user.valid === false) next({ name: 'Account' })
			else if (Number(to.params.id) === store.state.user.ID) next({ name: 'Account' })
			else next()
		} else if (to.name === 'Logout') {
			let token = Vue.ls.get('token')
			Vue.ls.remove('token')
			new Vue().$socket.emit('disconnect_user', token)
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
					let token = Vue.ls.get('token')
					Vue.ls.remove('token')
					store.commit('DELETE_USER')
					new Vue().$socket.emit('disconnect_user', token)
					if (store.state.logged === true) store.commit('LOGOUT')
					next('/login')
				}
			} else {
				let token = Vue.ls.get('token')
				Vue.ls.remove('token')
				store.commit('DELETE_USER')
				new Vue().$socket.emit('disconnect_user', token)
				if (store.state.logged === true) store.commit('LOGOUT')
				next('/login')
			}
		} else next('/login')
	} else if (!to.meta.requireAuth && (to.name === 'Login' || to.name === 'Register')) {
		if (Vue.ls.get('token')) {
			if (store.state.logged === false) store.commit('LOGIN')
			if (store.state.user === null) store.commit('CREATE_USER', Vue.$jwt.decode(JSON.parse(Vue.$jwt.getToken()).value).user)
			new Vue().$socket.emit('connect_user', {'name': store.state.user.username})
			next('/search')
		} else next()
	} else if (!to.meta.requireAuth && Vue.ls.get('token')) {
		next('/login')
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
