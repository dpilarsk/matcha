<template>
	<v-layout row wrap>
		<v-alert
			:color="this.store.state.alert.type"
			transition="scale-transition"
			dismissible
			v-model="alert_visible"
			v-html="this.store.state.alert.message"
		>
		</v-alert>
		<v-flex xs12>
			<v-form v-model="valid">
				<v-layout row wrap>
					<v-flex xs12 class="pb-1 pr-1">
						<v-text-field @keyup.enter="" label="Nom d'utilisateur" v-model="user.username"
									  :rules="usernameRules" required></v-text-field>
					</v-flex>
				</v-layout>
				<v-btn block @click="submit()" :disabled="!valid">Réinitialiser le mot de passe</v-btn>
			</v-form>
		</v-flex>
	</v-layout>
</template>

<script>
	import 'vue-use-vuex'
	import store from '@/store/UsersStore.js'
	export default {
		name: 'Forget',
		data () {
			return {
				store: store,
				valid: false,
				user: {
					username: ''
				},
				usernameRules: [
					v => !!v || 'Ce champ est requis.'
				]
			}
		},
		mounted () {
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
		methods: {
			submit () {
				let _this = this
				this.axios.post('/users/forget', [this.user])
					.then(response => {
						this.store.commit('NEW_ALERT', {type: response.data.type, message: response.data.message})
						setTimeout(function () {
							_this.store.commit('DISMISS')
						}, 2000)
					})
					.catch(err => {
						console.log(err)
					})
			}
		}
	}
</script>
