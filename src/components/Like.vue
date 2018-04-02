<template>
	<v-layout>
		<v-alert
			:color="this.store.state.alert.type"
			transition="scale-transition"
			dismissible
			v-model="alert_visible"
			v-html="this.store.state.alert.message"
		>
		</v-alert>
		<v-flex xs12>
			<h1 class="text-xs-center">Likes</h1>
			<hr>
			<v-data-table
				:items="items"
				:loading="!loading"
				class="elevation-1"
				hide-actions
				hide-headers
			>
				<template slot="items" slot-scope="props" :color="props.item.color">
					<td>
						<router-link :to="{name: 'Profile', params: {id: props.item.user_ID_source}}" tag="td" style="cursor: pointer;">
							<v-icon>{{ props.item.icon }}</v-icon> {{ props.item.content }}
						</router-link>
					</td>
				</template>
			</v-data-table>
		</v-flex>
	</v-layout>
</template>

<script>
	import 'vue-use-vuex'
	import store from '@/store/UsersStore.js'
	export default {
		name: 'Notifications',
		data () {
			return {
				store,
				items: [],
				loading: true
			}
		},
		mounted () {
			let _this = this
			this.axios.get('/users/notifications', { headers: { 'Authorization': 'Bearer ' + this.$ls.get('token') } })
				.then(response => {
					if (response.data.message) {
						response.data.message.forEach(v => {
							switch (v.type) {
							case 'like':
								v.icon = 'thumb_up'
								v.color = 'green'
								break
							case 'like_back':
								v.icon = 'favorite'
								v.color = 'pink'
								break
							}
							this.items.push(v)
						}, (this.loading = false))
						this.items = this.items.filter(m => m.type === 'like' || m.type === 'like_back')
					} else {
						this.store.commit('NEW_ALERT', {type: 'error', message: 'Une erreur est survenue'})
						setTimeout(function () {
							_this.store.commit('DISMISS')
						}, 2000)
					}
				})
				.catch(err => {
					console.log(err)
				})
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
