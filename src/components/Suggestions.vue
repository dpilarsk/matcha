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
				<v-layout row wrap align-baseline>
					<v-flex xs12 sm6 md3 class="pl-3 pb-3 pr-3">
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
									Distance maximale: {{ filters.distanceMax }}
									<v-slider min="0.5" max="150" v-model="filters.distanceMax" step="0.5"></v-slider>
								</v-flex>
							</v-layout>
						</v-card>
					</v-flex>
					<v-flex xs12 sm6 md3 class="pl-3 pb-3 pr-3">
						<v-card class="grey darken-1">
							<h1 class="text-xs-center">Localisation</h1>
							<hr>
							<br>
							<div class="pl-2 pr-2 pb-2">
								<v-layout row wrap align-center>
									<v-flex xs12 sm12 md12 lg12 xl9>
										<v-text-field
											label="Lieu de départ"
											v-model="map.input.address"
											box
										></v-text-field>
									</v-flex>
									<v-flex xs12 lg12 xl3 class="text-xs-center">
										<v-btn @click="locate" color="success">Localiser</v-btn>
									</v-flex>
								</v-layout>
								<gmap-map
									:center="map.center"
									:zoom="map.zoom"
									style="width: 100%; height: 300px;"
								>
									<gmap-marker
										:key="index"
										v-for="(m, index) in map.markers"
										:position="m.position"
										:clickable="true"
										:draggable="false"
										:visible="m.visible"
										@click="map.center=m.position"
									></gmap-marker>
									<gmap-circle
										:center="{lat: Number(map.input.lat), lng: Number(map.input.lng)}"
										:radius="filters.distanceMax * 1000"
									></gmap-circle>
								</gmap-map>
							</div>
						</v-card>
					</v-flex>
				</v-layout>
			</v-card>
		</v-flex>
		<transition-group tag="div" class="layout row wrap" name="rotate" enter-active-class="bounceInLeft" leave-active-class="">
			<v-flex v-for="(user, index) in usersFiltered" :key="user.id" xs12 md6 lg4 xl2 class="pl-3 pb-3">
				<v-card color="grey darken-1">
					<v-card-media :src="user.picture" height="200px"></v-card-media>
					<v-card-title primary-title>
						<div>
							<h3 class="headline mb-0">{{ user.username }}</h3>
							<div>{{ user.address }}</div>
						</div>
					</v-card-title>
				</v-card>
			</v-flex>
		</transition-group>
	</v-layout>
</template>

<script>
	import 'vue-use-vuex'
	import store from '@/store/UsersStore.js'
	require('vue2-animate/dist/vue2-animate.min.css')
	export default {
		name: 'suggestions',
		data () {
			return {
				store: store,
				users: [],
				map: {
					center: {lng: null, lat: null},
					zoom: 14,
					markers: [],
					input: {
						address: null,
						lat: null,
						lng: null
					}
				},
				filters: {
					ageMin: null,
					ageMax: null,
					popularityMin: null,
					popularityMax: null,
					distanceMax: null
				}
			}
		},
		mounted () {
			this.map.input.lng = this.map.center.lng = this.store.state.user.longitude
			this.map.input.lat = this.map.center.lat = this.store.state.user.latitude
			this.$http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + (this.store.state.user.latitude + ',' + this.store.state.user.longitude) + '&sensor=true&key=AIzaSyCfnDMO2EoO16mtlYuh6ceq2JbgGFzTEo8').then(response => {
				this.map.input.address = response.body.results[0].formatted_address
				this.map.markers.push({
					position: {
						lat: this.store.state.user.latitude,
						lng: this.store.state.user.longitude
					}
				})
			}, response => {
				console.error(response)
			})
			this.filters.ageMin = (Number(this.store.state.user.age) > 18) ? Number(this.store.state.user.age) - 1 : Number(this.store.state.user.age)
			this.filters.ageMax = (Number(this.store.state.user.age) < 99) ? Number(this.store.state.user.age) + 1 : Number(this.store.state.user.age)
			this.filters.distanceMin = (Number(this.store.state.user.max_distance) > 10) ? Number(this.store.state.user.max_distance) - 10 : Number(this.store.state.user.max_distance)
			this.filters.distanceMax = (Number(this.store.state.user.max_distance) < 140) ? Number(this.store.state.user.max_distance) + 10 : Number(this.store.state.user.max_distance)
			this.filters.popularityMin = (Number(this.store.state.user.popularity) >= 100) ? Number(this.store.state.user.popularity) - 100 : Number(this.store.state.user.popularity)
			this.filters.popularityMax = (Number(this.store.state.user.popularity) <= 9900) ? Number(this.store.state.user.popularity) + 100 : Number(this.store.state.user.popularity)
			this.$http.get('http://localhost:8081/api/users').then(response => {
				response.body.users.forEach(u => {
					u.address = ''
				})
				this.users = response.body.users
				this.$nextTick().then(() => {
					this.users.forEach(u => {
						this.map.markers.push({
							position: {
								lat: u.longitude,
								lng: u.latitude,
								visible: true
							}
						})
						this.$http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + (u.longitude + ',' + u.latitude) + '&sensor=true&key=AIzaSyCfnDMO2EoO16mtlYuh6ceq2JbgGFzTEo8').then(response => {
							response.body.results = response.body.results.filter(a => a.types.indexOf('political') !== -1)
							if (response.body.results[0] !== undefined) {
								u.address = response.body.results[0].formatted_address
							} else {
								u.address = 'Impossible de trouver l\'adresse.'
							}
						}, () => {
							u.address = 'Impossible de trouver l\'adresse.'
						})
					})
				})
			}, response => {
				console.error(response)
			})
		},
		methods: {
			getCoordsRange: function (radius, latitude, longitude) {
				let kmInDegree = 111.320 * Math.cos(latitude / 180.0 * Math.PI)
				let deltaLat = radius / 111.1
				let deltaLong = radius / kmInDegree

				let minLat = latitude - deltaLat
				let maxLat = latitude + deltaLat
				let minLong = longitude - deltaLong
				let maxLong = longitude + deltaLong
				return {minLat, maxLat, minLong, maxLong}
			},
			locate: function () {
				this.$http.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + (this.map.input.address) + '&sensor=true&key=AIzaSyCfnDMO2EoO16mtlYuh6ceq2JbgGFzTEo8').then(response => {
					this.map.markers = []
					this.map.input.lat = response.body.results[0].geometry.location.lat
					this.map.input.lng = response.body.results[0].geometry.location.lng
					this.map.markers.push({
						position: {
							lat: response.body.results[0].geometry.location.lat,
							lng: response.body.results[0].geometry.location.lng
						},
						visible: false
					})
					this.map.center = this.map.markers[0].position
					this.map.input.address = response.body.results[0].formatted_address
				}, response => {
					console.error(response)
				})
			}
		},
		computed: {
			usersFiltered () {
				// TODO: MATCH BY TAGS
				let distanceRange = this.getCoordsRange(this.filters.distanceMax, this.map.input.lat, this.map.input.lng)
				if (this.filters.ageMin > this.filters.ageMax) [this.filters.ageMin, this.filters.ageMax] = [this.filters.ageMax, this.filters.ageMin]
				if (this.filters.popularityMin > this.filters.popularityMax) [this.filters.popularityMin, this.filters.popularityMax] = [this.filters.popularityMax, this.filters.popularityMin]
				return this.users.filter((u, i) => {
					if (this.map.markers[i + 1]) {
						if (u.age >= this.filters.ageMin && u.age <= this.filters.ageMax) {
							this.map.markers[i + 1].visible = true
						} else {
							this.map.markers[i + 1].visible = false
						}
					}
					return ((u.age >= this.filters.ageMin && u.age <= this.filters.ageMax) &&
						(u.latitude >= distanceRange.minLong && u.latitude <= distanceRange.maxLong) && (u.longitude >= distanceRange.minLat && u.longitude <= distanceRange.maxLat) &&
						(u.popularity >= this.filters.popularityMin && u.popularity <= this.filters.popularityMax))
				})
			},
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
