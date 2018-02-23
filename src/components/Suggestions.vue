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
		<v-flex xs12 class="pb-3">
			<v-card>
				<h1 class="text-xs-center">Filtrer</h1>
				<hr>
				<br>
				<v-layout row wrap>
					<v-flex xs12 sm6 md3 lg3 xl3 class="pl-3 pb-3 pr-3">
						<v-card class="grey darken-1">
							<h1 class="text-xs-center">Intervalle d'age</h1>
							<hr>
							<br>
							<v-layout row wrap>
								<v-flex xs12 sm12 md12 lg12 xl6 class="pl-3">
									Age minimal: {{ filters.ageMin }}
									<v-slider min="18" max="99" v-model="filters.ageMin" step="1"></v-slider>
								</v-flex>
								<v-flex xs12 sm12 md12 lg12 xl6 class="pl-3">
									Age maximal: {{ filters.ageMax }}
									<v-slider min="18" max="99" v-model="filters.ageMax" step="1"></v-slider>
								</v-flex>
							</v-layout>
						</v-card>
					</v-flex>
					<v-flex xs12 sm6 md3 lg3 xl3 class="pl-3 pb-3 pr-3">
						<v-card class="grey darken-1">
							<h1 class="text-xs-center">Intervalle de popularité</h1>
							<hr>
							<br>
							<v-layout row wrap>
								<v-flex xs12 sm12 md12 lg12 xl6 class="pl-3">
									Popularité minimale: {{ filters.popularityMin }}
									<v-slider min="0" max="10000" v-model="filters.popularityMin" step="100"></v-slider>
								</v-flex>
								<v-flex xs12 sm12 md12 lg12 xl6 class="pl-3">
									Popularité maximale: {{ filters.popularityMax }}
									<v-slider min="0" max="10000" v-model="filters.popularityMax" step="100"></v-slider>
								</v-flex>
							</v-layout>
						</v-card>
					</v-flex>
					<v-flex xs12 sm6 md3 lg3 xl3 class="pl-3 pb-3 pr-3">
						<v-card class="grey darken-1">
							<h1 class="text-xs-center">Intervalle de distance</h1>
							<hr>
							<br>
							<v-layout row wrap>
								<v-flex xs12 sm12 md12 lg12 xl6 class="pl-3">
									Distance minimale: {{ filters.distanceMin }}
									<v-slider min="0" max="150" v-model="filters.distanceMin" step="1"></v-slider>
								</v-flex>
								<v-flex xs12 sm12 md12 lg12 xl6 class="pl-3">
									Distance maximale: {{ filters.distanceMax }}
									<v-slider min="0" max="150" v-model="filters.distanceMax" step="1"></v-slider>
								</v-flex>
							</v-layout>
						</v-card>
					</v-flex>
				</v-layout>
			</v-card>
		</v-flex>
		<v-layout row wrap>
			<v-flex xs12 sm6 md3 lg3 xl3 class="pl-3 pb-3">
				<v-card color="primary">
					<h1 class="text-xs-center">Filtrer</h1>
					<hr>
					<br>
				</v-card>
			</v-flex>
			<v-flex xs12 sm6 md3 lg3 xl3 class="pl-3 pb-3">
				<v-card color="primary">
					<h1 class="text-xs-center">Filtrer</h1>
					<hr>
					<br>
				</v-card>
			</v-flex>
			<v-flex xs12 sm6 md3 lg3 xl3 class="pl-3 pb-3">
				<v-card color="primary">
					<h1 class="text-xs-center">Filtrer</h1>
					<hr>
					<br>
				</v-card>
			</v-flex>
			<v-flex xs12 sm6 md3 lg3 xl3 class="pl-3 pb-3">
				<v-card color="primary">
					<h1 class="text-xs-center">Filtrer</h1>
					<hr>
					<br>
				</v-card>
			</v-flex>
		</v-layout>
	</v-layout>
</template>

<!--<v-card>-->
	<!--<h1 class="text-xs-center">Intervalle d'age</h1>-->
	<!--<v-layout row wrap>-->
		<!--<v-flex d-inline-flex>-->
			<!--<v-flex class="pl-3">-->
				<!--Age minimum {{ filters.ageMin }}-->
				<!--<v-slider min="18" max="99" v-model="filters.ageMin" step="1"></v-slider>-->
			<!--</v-flex>-->
			<!--<v-flex class="pl-3">-->
				<!--Age maximum {{ filters.ageMax }}-->
				<!--<v-slider min="18" max="99" v-model="filters.ageMax" step="1"></v-slider>-->
			<!--</v-flex>-->
		<!--</v-flex>-->
	<!--</v-layout>-->
<!--</v-card>-->

<script>
	import 'vue-use-vuex'
	import store from '@/store/UsersStore.js'
	export default {
		name: 'suggestions',
		data () {
			return {
				store: store,
				filters: {
					ageMin: null,
					ageMax: null,
					popularityMin: null,
					popularityMax: null,
					distanceMin: null,
					distanceMax: null
				}
			}
		},
		mounted () {
			this.filters.ageMin = (Number(this.store.state.user.age) > 18) ? Number(this.store.state.user.age) - 1 : Number(this.store.state.user.age)
			this.filters.ageMax = (Number(this.store.state.user.age) < 99) ? Number(this.store.state.user.age) + 1 : Number(this.store.state.user.age)
			this.filters.distanceMin = (Number(this.store.state.user.max_distance) > 10) ? Number(this.store.state.user.max_distance) - 10 : Number(this.store.state.user.max_distance)
			this.filters.distanceMax = (Number(this.store.state.user.max_distance) < 140) ? Number(this.store.state.user.max_distance) + 10 : Number(this.store.state.user.max_distance)
			this.filters.popularityMin = (Number(this.store.state.user.popularity) >= 100) ? Number(this.store.state.user.popularity) - 100 : Number(this.store.state.user.popularity)
			this.filters.popularityMax = (Number(this.store.state.user.popularity) <= 9900) ? Number(this.store.state.user.popularity) + 100 : Number(this.store.state.user.popularity)
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
		}
	}
</script>
