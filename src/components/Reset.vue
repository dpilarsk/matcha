<template>
	<v-layout row wrap>
		<v-alert
			:color="this.store.state.alert.type"
			transition="scale-transition"
			dismissible
			v-model="alert_visible"
		>
			{{ this.store.state.alert.message }}
		</v-alert>
		<div>
		</div>
	</v-layout>
</template>

<script>
	import 'vue-use-vuex'
	import store from '@/store/UsersStore.js'
	export default {
		name: 'confirm',
		data () {
			return {
				store
			}
		},
		computed: {
			alert_visible: {
				get () {
					return this.store.state.alert.visible
				},
				set () {
					this.store.commit('DISMISS')
				}
			}
		},
		mounted () {
			let _this = this
			this.axios.get('/tokens/reset/' + this.$route.params.token)
				.then(response => {
					this.store.commit('NEW_ALERT', {type: response.data.type, message: response.data.message})
					setTimeout(function () {
						_this.store.commit('DISMISS')
					}, 2000)
					this.$router.push({ name: 'Login' })
				})
				.catch(err => {
					this.store.commit('NEW_ALERT', {type: 'error', message: 'Une erreur est survenue.' + err})
					setTimeout(function () {
						_this.store.commit('DISMISS')
					}, 2000)
					this.$router.push({ name: 'Login' })
				})
		}
	}
</script>
