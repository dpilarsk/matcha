<template>
	<v-app dark>
		<v-navigation-drawer
			fixed
			:clipped="$vuetify.breakpoint.width > 1264"
			v-model="drawer"
			class="light-green accent-4"
			app
		>
			<v-list>
				<router-link :to="{name: 'HelloWorld'}" exact tag="v-list-tile">
					<v-list-tile-action>
						<v-icon>home</v-icon>
					</v-list-tile-action>
					<v-list-tile-content>
						<v-list-tile-title>Accueil</v-list-tile-title>
					</v-list-tile-content>
				</router-link>

				<div v-if="!this.store.state.logged">
					<router-link :to="{name: 'Register'}" exact tag="v-list-tile">
						<v-list-tile-action>
							<v-icon>account_circle</v-icon>
						</v-list-tile-action>
						<v-list-tile-content>
							<v-list-tile-title>Inscription</v-list-tile-title>
						</v-list-tile-content>
					</router-link>

					<router-link :to="{name: 'Login'}" exact tag="v-list-tile">
						<v-list-tile-action>
							<v-icon>lock_open</v-icon>
						</v-list-tile-action>
						<v-list-tile-content>
							<v-list-tile-title>Connexion</v-list-tile-title>
						</v-list-tile-content>
					</router-link>
				</div>

				<div v-else>
					<router-link :to="{name: 'Suggestions'}" exact tag="v-list-tile">
						<v-list-tile-action>
							<v-icon>home</v-icon>
						</v-list-tile-action>
						<v-list-tile-content>
							<v-list-tile-title>Découvertes</v-list-tile-title>
						</v-list-tile-content>
					</router-link>
					<router-link :to="{name: 'Logout'}" exact tag="v-list-tile">
						<v-list-tile-action>
							<v-icon>play_for_work</v-icon>
						</v-list-tile-action>
						<v-list-tile-content>
							<v-list-tile-title>Déconnexion</v-list-tile-title>
						</v-list-tile-content>
					</router-link>
					<v-subheader>
						Mon compte
					</v-subheader>
					<v-list-tile
						v-for="(item, i) in items2"
						@click=""
						:key="i + '__account'"
					>
						<v-list-tile-action>
							<v-icon v-html="item.icon"></v-icon>
						</v-list-tile-action>
						<v-list-tile-content>
							<v-list-tile-title v-text="item.title"></v-list-tile-title>
						</v-list-tile-content>
					</v-list-tile>
					<v-subheader>
						Mes messages
					</v-subheader>
					<v-list-tile
						v-for="(message, i) in messages"
						@click=""
						:key="i + '__messages'"
					>
						<v-list-tile-action>
							<v-list-tile-avatar>
								<img v-bind:src="message.avatar">
							</v-list-tile-avatar>
						</v-list-tile-action>
						<v-list-tile-content>
							<v-list-tile-title v-text="message.name"></v-list-tile-title>
							<v-list-tile-sub-title v-text="message.message"></v-list-tile-sub-title>
						</v-list-tile-content>
					</v-list-tile>
				</div>

			</v-list>
		</v-navigation-drawer>
		<v-toolbar fixed app :clipped-left="clipped">
			<v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
			<v-toolbar-title v-text="title"></v-toolbar-title>
			<v-spacer></v-spacer>
		</v-toolbar>
		<v-content dark>
			<v-container fluid>
				<v-slide-y-transition mode="out-in">
					<v-layout row wrap>
						<router-view transition="fade-transition"></router-view>
					</v-layout>
				</v-slide-y-transition>
			</v-container>
		</v-content>
		<v-footer app>
			<span>&copy; dpilarsk 2018</span>
		</v-footer>
	</v-app>
</template>

<script>
	import store from './store/UsersStore.js'
	import { mapGetters } from 'vuex'
	export default {
		name: 'app',
		data () {
			return {
				store: store,
				clipped: true,
				fixed: false,
				drawer: null,
				items: [
					{ icon: 'home', title: 'Accueil' },
					{ icon: 'lock_open', title: 'Connexion' },
					{ icon: 'account_circle', title: 'Inscription' }
				],
				items2: [
					{ icon: 'info', title: 'Mes Informations' },
					{ icon: 'settings', title: 'Mes Préférences' }
				],
				messages: [
					{ avatar: 'https://thumb1.shutterstock.com/display_pic_with_logo/3900026/426321556/stock-vector-vector-male-face-avatar-logo-template-pictogram-button-round-trendy-flat-icon-with-man-for-426321556.jpg', name: 'John Doe', message: 'Test' },
					{ avatar: 'https://thumb1.shutterstock.com/display_pic_with_logo/3900026/426321556/stock-vector-vector-male-face-avatar-logo-template-pictogram-button-round-trendy-flat-icon-with-man-for-426321556.jpg', name: 'John dsDoe', message: 'Tesadsadst' },
					{ avatar: 'https://thumb1.shutterstock.com/display_pic_with_logo/3900026/426321556/stock-vector-vector-male-face-avatar-logo-template-pictogram-button-round-trendy-flat-icon-with-man-for-426321556.jpg', name: 'John Doe', message: 'Tesadsadst' },
					{ avatar: 'https://thumb1.shutterstock.com/display_pic_with_logo/3900026/426321556/stock-vector-vector-male-face-avatar-logo-template-pictogram-button-round-trendy-flat-icon-with-man-for-426321556.jpg', name: 'John Doe', message: 'Tesadsadst' }
				],
				title: 'Matcha'
			}
		},
		computed: {
			...mapGetters({
				getLogged: 'logged'
			})
		}
	}
</script>
