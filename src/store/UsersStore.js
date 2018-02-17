import Vuex from 'vuex'

let store = new Vuex.Store({
	state: {
		logged: false,
		alert: {
			visible: false,
			message: null,
			type: null
		}
	},
	mutations: {
		LOGIN: state => {
			state.logged = true
		},
		LOGOUT: state => {
			state.logged = false
		},
		NEW_ALERT: (state, payload) => {
			state.alert.type = payload.type
			state.alert.message = payload.message
			state.alert.visible = true
		},
		DISMISS: (state) => {
			state.alert.visible = false
		}
	},
	getters: {
		logged: state => state.logged,
		alert: state => state.alert
	},
	actions: {}
})

global.store = store

export default store
