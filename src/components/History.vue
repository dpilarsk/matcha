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
			<h1 class="text-xs-center">Historique des visites</h1>
			<hr>
			<v-data-table
				:items="items"
				class="elevation-1"
				:loading="!loading"
				hide-actions
				hide-headers
			>
				<template slot="items" slot-scope="props">
					<td>
						<router-link :to="{name: 'Profile', params: {id: props.item.user_ID_source}}" tag="td" style="cursor: pointer;">
							{{ props.item.content }}
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
		name: 'History',
		data () {
			return {
				store,
				items: [],
				loading: true
			}
		},
		mounted () {
			let _this = this
			this.axios.get('/users/history', { headers: { 'Authorization': 'Bearer ' + this.$ls.get('token') } })
				.then(response => {
					if (response.data.message) {
						response.data.message.forEach(v => {
							this.items.push(v)
						}, (this.loading = false))
					} else {
						this.store.commit('NEW_ALERT', {type: response.data.type, message: response.data.message})
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
