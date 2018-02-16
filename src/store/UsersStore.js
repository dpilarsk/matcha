import Vuex from 'vuex'

let store = new Vuex.Store({
	state: {
		logged: false
	},
	mutations: {
		LOGIN: state => {
			state.logged = true
		},
		LOGOUT: state => {
			state.logged = false
		}
	},
	getters: {
		logged: state => state.logged
	},
	actions: {},
	strict: true
})

global.store = store

export default store
