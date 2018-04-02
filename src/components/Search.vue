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
					<v-flex xs12 sm6 md4 class="pl-3 pb-3 pr-3">
						<v-select
							:items="gender"
							v-model="filters.gender"
							chips
							multiple
							label="Sexe"
							></v-select>
					</v-flex>
					<v-flex xs12 sm6 md4 class="pl-3 pb-3 pr-3">
						<v-select
							:items="sexual_orientation"
							v-model="filters.orientation"
							chips
							multiple
							label="Orientation"
						></v-select>
					</v-flex>
					<v-flex xs12 sm6 md4 class="pl-3 pb-3 pr-3">
						<v-select
							:items="tagsAvailable"
							v-model="tags"
							chips
							tags
							label="Les centres d'intérêts ?"
							@keyup.enter="checkList()"
							@blur="checkList()"
							required></v-select>
					</v-flex>
					<v-flex xs12 sm6 md3 class="pl-3 pb-3 pr-3">
						<v-card class="grey darken-1">
							<h1 class="text-xs-center">Intervalle d'age</h1>
							<hr>
							<br>
							<v-layout row wrap>
								<v-flex xs12 sm12 md12 lg12 xl6 class="pl-3">
									Age minimal: {{ filters.ageMin }}
									<v-slider min="18" max="200" v-model="filters.ageMin" step="1"></v-slider>
								</v-flex>
								<v-flex xs12 sm12 md12 lg12 xl6 class="pl-3">
									Age maximal: {{ filters.ageMax }}
									<v-slider min="18" max="200" v-model="filters.ageMax" step="1"></v-slider>
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
									Distance maximale: {{ filters.distanceMax / 1000 }}
									<v-slider min="500" max="150000" v-model="filters.distanceMax" step="500"></v-slider>
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
									<gmap-cluster>
										<gmap-marker
											:key="index"
											v-for="(m, index) in markersFiltered"
											:position="m.position"
											:clickable="true"
											:draggable="false"
											:visible="m.visible"
											@click="map.center=m.position"
										>
										</gmap-marker>
									</gmap-cluster>
									<gmap-circle
										:center="{lat: Number(map.input.lat), lng: Number(map.input.lng)}"
										:radius="filters.distanceMax"
									></gmap-circle>
								</gmap-map>
							</div>
						</v-card>
					</v-flex>
				</v-layout>
				<hr>
				<br>
				<v-btn block @click="search()">Rechercher</v-btn>
				<v-layout row wrap>
					<v-flex class="pl-3 pb-1 pr-3">
						<v-select
							:items="ordered"
							v-model="orderByType"
							label="Trier par"
							single-line
						></v-select>
					</v-flex>
					<v-flex class="pl-3 pb-1 pr-3">
						<v-select
							:items="[{value: 'asc', text: 'Ascendant'}, {value: 'desc', text: 'Descendant'}]"
							v-model="orderByOrder"
							label="Sens"
							single-line
						></v-select>
					</v-flex>
				</v-layout>
			</v-card>
		</v-flex>
		<!--<transition-group tag="div" class="layout row wrap" name="rotate" enter-active-class="bounceInLeft" leave-active-class="">-->
		<v-flex v-for="(user, index) in usersFiltered" :key="user.ID" xs12 md6 lg4 xl2 class="pl-3 pb-3">
			<router-link :to="{ name: 'Profile', params: { id: user.ID } }">
				<v-card color="grey darken-1">
					<v-card-media :src="user.picture" height="200px"></v-card-media>
					<v-card-title primary-title>
						<div>
							<h3 class="headline mb-0">{{ user.username }} - {{ user.age }} ans</h3>
							<div>{{ user.address }}</div>
						</div>
					</v-card-title>
				</v-card>
			</router-link>
		</v-flex>
		<!--</transition-group>-->
		<infinite-loading :distance="15" force-use-infinite-wrapper="true" @infinite="infiniteHandler" v-if="usersFiltered.length" spinner="spiral"></infinite-loading>
	</v-layout>
</template>

<!--icons:-->
<!--icon="http://www.themusicrun.com/images/globalhomepage-dot.png"-->
<!--icon="https://imgrabo.com/design/site/guide/google_map_red_dot_icon.png"-->

<style scoped>
	.asc {
		transform: rotate(180deg);
	}
</style>

<script>
	import 'vue-use-vuex'
	import store from '@/store/UsersStore.js'
	import InfiniteLoading from 'vue-infinite-loading'
	export default {
		name: 'search',
		components: {
			InfiniteLoading
		},
		data () {
			return {
				busy: false,
				store: store,
				isTriggerFirstLoad: false,
				users: [],
				tagsAvailable: [],
				tags: [],
				tagsId: [],
				orderByType: 'distance',
				orderByOrder: 'asc',
				ordered: [
					{
						value: 'popularity',
						text: 'Popularité'
					},
					{
						value: 'age',
						text: 'Âge'
					},
					{
						value: 'common',
						text: 'Intérêts'
					},
					{
						value: 'distance',
						text: 'Distance'
					}
				],
				page: 1,
				active: false,
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
					distanceMax: null,
					gender: [],
					orientation: []
				},
				gender: [
					{
						value: 'man',
						text: 'Homme'
					},
					{
						value: 'woman',
						text: 'Femme'
					}
				],
				sexual_orientation: [
					{
						value: 'homosexual',
						text: 'Homosexuel(le)'
					},
					{
						value: 'bisexual',
						text: 'Bisexuel(le)'
					},
					{
						value: 'heterosexual',
						text: 'Hétérosexuel(le)'
					}
				]
			}
		},
		mounted () {
			let _this = this
			this.axios.get('/tags')
				.then(response => {
					if (response.data.message) {
						response.data.message.forEach(t => {
							_this.tagsAvailable.push(t.content)
						})
						this.tagsAvailableObject = response.data.message
						this.store.state.user.profile.tags_id.split(',').forEach(t => {
							let content = _this.searchArrayById(t, _this.tagsAvailableObject)
							if (content === null) return
							_this.tags.push(content.content)
							_this.tagsId = []
							_this.tags.forEach(t => {
								let id = _this.searchArrayByContent(t, _this.tagsAvailableObject)
								if (id === null) return
								_this.tagsId.push(String(id.ID))
							})
						})
					} else {
						this.store.commit('NEW_ALERT', {type: 'error', message: 'Une erreur est survenue.'})
						setTimeout(function () {
							_this.store.commit('DISMISS')
						}, 2000)
					}
				})
				.catch(err => {
					console.log(err)
				})
			this.map.input.lng = this.map.center.lng = Number(this.$ls.get('longitude'))
			this.map.input.lat = this.map.center.lat = Number(this.$ls.get('latitude'))
			this.axios.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + (this.$ls.get('latitude') + ',' + this.$ls.get('longitude')) + '&sensor=true&key=AIzaSyCfnDMO2EoO16mtlYuh6ceq2JbgGFzTEo8')
				.then(response => {
					this.map.input.address = response.data.results[0].formatted_address
					this.map.markers.push({
						position: {
							lat: Number(this.$ls.get('latitude')),
							lng: Number(this.$ls.get('longitude'))
						},
						visible: true
					})
				})
				.catch(err => {
					console.error(err)
				})
			this.filters.ageMin = this.store.state.user.profile.age < 197 ? this.store.state.user.profile.age + 3 : this.store.state.user.profile.age
			this.filters.ageMax = this.store.state.user.profile.age > 21 ? this.store.state.user.profile.age - 3 : this.store.state.user.profile.age
			this.filters.popularityMin = this.store.state.user.profile.popularity < 10000 ? this.store.state.user.profile.popularity + 1000 : this.store.state.user.profile.popularity
			this.filters.popularityMax = this.store.state.user.profile.popularity > 1000 ? this.store.state.user.profile.popularity - 1000 : this.store.state.user.profile.popularity
			this.filters.distanceMax = this.store.state.user.profile.range * 1000
		},
		methods: {
			searchArrayById: function (objectV, myArray) {
				for (let i = 0; i < myArray.length; i++) {
					if (myArray[i].ID === Number(objectV)) {
						return myArray[i]
					}
				}
				return null
			},
			searchArrayByContent: function (objectV, myArray) {
				for (let i = 0; i < myArray.length; i++) {
					if (myArray[i].content === objectV) {
						return myArray[i]
					}
				}
				return null
			},
			checkList: function () {
				let _this = this
				this.tags = this.tags.filter(t => t.match('^[a-zA-Z0-9-_\\.]{1,20}$') !== null)
				this.tagsId = []
				this.tags.forEach(t => {
					let id = _this.searchArrayByContent(t, _this.tagsAvailableObject)
					if (id === null) return
					_this.tagsId.push(String(id.ID))
				})
			},
			infiniteHandler: function ($state) {
				let _this = this
				let ids = []
				this.users.forEach(u => ids.push(u.ID))
				this.page = Math.floor(Number(Number(this.users.length / 30) + 1))
				let tmp = []
				async function getUsers () {
					await _this.axios.get('/users/search', {
						params: {
							exceptID: _this.store.state.user.ID,
							age: (_this.filters.ageMin + ',' + _this.filters.ageMax),
							tags: _this.tagsId,
							popularity: (_this.filters.popularityMin + ',' + _this.filters.popularityMax),
							coords: (_this.map.input.lat + ',' + _this.map.input.lng),
							distance: _this.filters.distanceMax / 1000,
							sexual_orientation: (_this.filters.orientation[0] + ',' + _this.filters.orientation[1] + ',' + _this.filters.orientation[2]),
							gender: (_this.filters.gender[0] + ',' + _this.filters.gender[1]),
							ids,
							lastId: Math.max.apply(Math, _this.users.map(o => o.ID))
						},
						headers: { 'Authorization': 'Bearer ' + _this.$ls.get('token') }
					})
						.then(response => {
							if (response.data.message.length !== 0 && response.data.message[0].ID !== null) {
								response.data.message.forEach(u => {
									u.address = ''
								})
//								_this.users = response.data.message
								_this.$nextTick().then(() => {
									_this.users.forEach(u => {
										_this.map.markers.push({
											position: {
												lat: u.latitude,
												lng: u.longitude
											},
											user: u.username,
											visible: false
										})
										_this.axios.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + (u.latitude + ',' + u.longitude) + '&sensor=true&key=AIzaSyCfnDMO2EoO16mtlYuh6ceq2JbgGFzTEo8')
											.then(response => {
												response.data.results = response.data.results.filter(a => a.types.indexOf('political') !== -1)
												if (response.data.results[0] !== undefined) {
													u.address = response.data.results[0].formatted_address
												} else {
													u.address = 'Impossible de trouver l\'adresse.'
												}
											})
											.catch(() => {
												u.address = 'Impossible de trouver l\'adresse.'
											})
										tmp = response.data.message
									})
								})
							}
						})
						.catch(err => {
							console.log(err)
						})
					if (tmp.length > 0) {
						_this.users = _this.users.concat(tmp)
						$state.loaded()
					}
					$state.loaded()
				}
				setTimeout(() => getUsers(), 2500)
			},
			getDistanceFromLatLonInKm: function (lat1, lon1, lat2, lon2) {
				let R = 6371 // Radius of the earth in km
				let dLat = this.deg2rad(lat2 - lat1)  // deg2rad below
				let dLon = this.deg2rad(lon2 - lon1)
				let a =
					Math.sin(dLat / 2) * Math.sin(dLat / 2) +
					Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
					Math.sin(dLon / 2) * Math.sin(dLon / 2)
				let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
				let d = R * c // Distance in km
				return d
			},
			deg2rad: function (deg) {
				return deg * (Math.PI / 180)
			},
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
				this.axios.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + (this.map.input.address) + '&sensor=true&key=AIzaSyCfnDMO2EoO16mtlYuh6ceq2JbgGFzTEo8')
					.then(response => {
						this.map.input.lat = response.data.results[0].geometry.location.lat
						this.map.input.lng = response.data.results[0].geometry.location.lng
						this.map.markers[0] = {
							position: {
								lat: response.data.results[0].geometry.location.lat,
								lng: response.data.results[0].geometry.location.lng
							},
							visible: true
						}
						this.map.center = this.map.markers[0].position
						this.map.input.address = response.data.results[0].formatted_address
					})
					.catch(err => {
						console.error(err)
					})
			},
			search: function () {
				this.axios.get('/users/search', {
					params: {
						exceptID: this.store.state.user.ID,
						age: (this.filters.ageMin + ',' + this.filters.ageMax),
						tags: this.tagsId,
						popularity: (this.filters.popularityMin + ',' + this.filters.popularityMax),
						coords: (this.map.input.lat + ',' + this.map.input.lng),
						distance: this.filters.distanceMax / 1000,
						sexual_orientation: (this.filters.orientation[0] + ',' + this.filters.orientation[1] + ',' + this.filters.orientation[2]),
						gender: (this.filters.gender[0] + ',' + this.filters.gender[1])
					},
					headers: { 'Authorization': 'Bearer ' + this.$ls.get('token') }
				})
					.then(response => {
						this.map.markers = [this.map.markers[0]]
						this.users = []
						if (response.data.message.length === 0 || response.data.message[0].ID === null) {
							console.log('nothing')
						} else {
							response.data.message.forEach(u => {
								u.address = ''
							})
							this.users = response.data.message
							this.$nextTick().then(() => {
								this.users.forEach(u => {
									this.map.markers.push({
										position: {
											lat: u.latitude,
											lng: u.longitude
										},
										user: u.username,
										visible: false
									})
									this.axios.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + (u.latitude + ',' + u.longitude) + '&sensor=true&key=AIzaSyCfnDMO2EoO16mtlYuh6ceq2JbgGFzTEo8')
										.then(response => {
											response.data.results = response.data.results.filter(a => a.types.indexOf('political') !== -1)
											if (response.data.results[0] !== undefined) {
												u.address = response.data.results[0].formatted_address
											} else {
												u.address = 'Impossible de trouver l\'adresse.'
											}
										})
										.catch(() => {
											u.address = 'Impossible de trouver l\'adresse.'
										})
								})
							})
						}
					})
					.catch(err => {
						console.log(err)
					})
			}
		},
		computed: {
			usersFiltered () {
				let _this = this
				function getTagsCommon (arrayA, arrayB) {
					let result = 0
					if ((arrayA === null || arrayA === undefined) || (arrayB === null || arrayB === undefined)) {
						return 0
					} else {
						arrayA = arrayA.split(',')
					}
					result = arrayA.filter(function (n) {
						return arrayB.indexOf(n) !== -1
					})
					return result.length
				}
//				let distanceRange = this.getCoordsRange(this.filters.distanceMax / 1000, this.map.input.lat, this.map.input.lng)
				if (this.filters.ageMin > this.filters.ageMax) [this.filters.ageMin, this.filters.ageMax] = [this.filters.ageMax, this.filters.ageMin]
				if (this.filters.popularityMin > this.filters.popularityMax) [this.filters.popularityMin, this.filters.popularityMax] = [this.filters.popularityMax, this.filters.popularityMin]
				this.users.forEach(u => {
					u.common = getTagsCommon(u.tags_id, _this.tagsId)
				})
				let users = this.users.filter(u => {
//					let count = 0
					u.distance = this.getDistanceFromLatLonInKm(this.map.input.lat, this.map.input.lng, u.latitude, u.longitude)
//					if (u.distance <= (this.filters.distanceMax / 1000)) count -= u.distance * 5
//					count += (u.common * 10)
//					u.count = count
					let condition = (((u.age >= this.filters.ageMin && u.age <= this.filters.ageMax) ||
						u.distance <= (this.filters.distanceMax / 1000) ||
						(u.popularity >= this.filters.popularityMin && u.popularity <= this.filters.popularityMax))) && u.block === 0
					if (this.map.markers.findIndex(m => m.user === u.username) !== -1) {
						let i = this.map.markers.findIndex(m => m.user === u.username)
						if (condition) {
							this.map.markers[i].visible = true
						} else {
							this.map.markers[i].visible = false
						}
					}
					return (condition)
				})
//				return this._.orderBy(users, ['count', this.orderByType], ['desc', this.orderByOrder])
				return this._.orderBy(users, [this.orderByType], [this.orderByOrder])
			},
			markersFiltered () {
				return this.map.markers.filter(m => m.visible)
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
