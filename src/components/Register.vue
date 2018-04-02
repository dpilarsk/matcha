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
					<v-flex xs12 sm6 md6 class="pb-1 pr-1">
						<v-text-field
							label="Prénom"
							v-model="user.firstName"
							:rules="nameRules"
							required></v-text-field>
					</v-flex>
					<v-flex xs12 sm6 md6 class="pb-1 pr-1">
						<v-text-field
							label="Nom"
							v-model="user.lastName"
							:rules="nameRules"
							required></v-text-field>
					</v-flex>
				</v-layout>
				<v-layout row wrap>
					<v-flex xs12 sm6 md6 class="pb-1 pr-1">
						<v-text-field
							label="Nom d'utilisateur"
							v-model="user.username"
							:rules="usernameRules"
							:counter="12"
							required></v-text-field>
					</v-flex>
					<v-flex xs12 sm6 md6 class="pb-1 pr-1">
						<v-text-field
							label="Adresse E-mail"
							v-model="user.email"
							:rules="emailRules"
							type="email"
							required></v-text-field>
					</v-flex>
				</v-layout>
				<v-layout row wrap>
					<v-flex xs12 sm6 md6 class="pb-1 pr-1">
						<v-text-field
							label="Mot de passe"
							v-model="user.password"
							:rules="passwordRules"
							hint="Au moins 8 caractères (1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial)."
							min="8"
							type="password"
							required></v-text-field>
					</v-flex>
					<v-flex xs12 sm6 md6 class="pb-1 pr-1">
						<v-text-field
							label="Confirmation du mot de passe"
							v-model="user.passwordConfirm"
							:rules="passwordConfirmRules"
							min="8"
							type="password"
							required></v-text-field>
					</v-flex>
				</v-layout>
				<v-btn ref="submit" block @click="submit" :disabled="!valid">S'inscrire</v-btn>
			</v-form>
		</v-flex>
	</v-layout>
</template>

<script>
	import 'vue-use-vuex'
	import store from '@/store/UsersStore.js'
	export default {
		name: 'register',
		data () {
			return {
				store,
				valid: false,
				user: {
					firstName: '',
					lastName: '',
					username: '',
					email: '',
					password: '',
					passwordConfirm: ''
				},
				nameRules: [
					v => !!v || 'Ce champ est requis.',
					v => v.match('^[a-zA-Z][a-zA-Z0-9-_\\.]{1,50}$') !== null || 'Ce champ est invalide.'
				],
				usernameRules: [
					v => !!v || 'Un nom d\'utilisateur est requis.',
					v => v.length >= 5 || 'Votre nom d\'utilisateur doit comporter au moins 5 caractères.',
					v => v.length <= 20 || 'Votre nom d\'utilisateur ne doit pas comporter plus de 12 caractères.',
					v => v.match('^[a-zA-Z][a-zA-Z0-9-_\\.]{4,20}$') !== null || 'Votre nom d\'utilisateur est invalide.'
				],
				emailRules: [
					v => !!v || 'Votre email est requis.',
					v => v.match('^[A-Za-z0-9\\._%+-]+@[a-z0-9\\.-]+\\.[a-z]{2,4}$') !== null || 'Votre adresse email est invalide.'
				],
				passwordRules: [
					v => !!v || 'Un mot de passe est requis.',
					v => v.length >= 8 || 'Votre mot de passe doit faire au moins 8 caractères.',
					v => v.length <= 50 || 'Votre mot de passe ne doit pas faire plus de 50 caractères.',
					v => v.match('(?=^.{8,50}$)((?=.*\\d)|(?=.*\\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$') !== null || 'Votre mot de passe ne respecte pas le minimum recommandé.'
				],
				passwordConfirmRules: [
					v => !!v || 'La confirmation de votre mot de passe est nécessaire.',
					v => v === this.user.password || 'Vos mots de passe ne correspondent pas.'
				]
			}
		},
		mounted () {},
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
				this.axios.post('/users', [this.user])
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
