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
		<v-layout row wrap>
			<v-flex xs3 sm3 md2>
				<v-card style="height: 400px;overflow: auto;">
					<v-list subheader>
						<v-subheader>Amis</v-subheader>
						<v-divider></v-divider>
						<div v-for="talk in talks" :key="talk.talk_id">
							<v-list-tile avatar @click="changeActiveID(talk.talk_id)" :class="active_id === talk.ID ? 'active' : ''">
								<v-list-tile-avatar><img :src="talk.path" :alt="talk.ID"></v-list-tile-avatar>
								<v-list-tile-content>
									<v-list-tile-title v-html="talk.username"></v-list-tile-title>
								</v-list-tile-content>
							</v-list-tile>
							<v-divider></v-divider>
						</div>
					</v-list>
				</v-card>
			</v-flex>
			<v-flex xs9 sm9 md10>
				<v-card style="height: 400px;overflow: auto;">
					<h2 class="text-xs-center">{{ store.state.user.first_name }} {{ store.state.user.last_name }}</h2>
					<hr>
					<v-card style="height: 293px;overflow: auto;" id="talk">
						<v-layout row wrap>
							<v-flex xs12 class="pl-2 pt-2 pb-2">
								<v-layout v-if="messages.length !== 0" row wrap v-for="(message, id) in messages" :key="id">
									<v-flex xs3 v-if="message.user_ID !== store.state.user.ID">
										<v-card color="primary" class="pl-1 pt-1 pr-1 pb-1">
											{{ message.content }}
										</v-card>
									</v-flex>
									<v-flex xs3 offset-xs9 class="pr-2" v-else>
										<v-card color="green" class="pl-1 pt-1 pr-1 pb-1">
											{{ message.content }}
										</v-card>
									</v-flex>
								</v-layout>
							</v-flex>
						</v-layout>
					</v-card>
					<v-layout row wrap v-if="talks.length > 0">
						<v-flex xs9 class="ml-1">
							<v-text-field @keyup.enter="(writing.trim().length > 0) ? submitMessage() : 0" v-model="writing"></v-text-field>
						</v-flex>
						<v-flex xs2>
							<v-btn outline large color="primary" :disabled="!(writing.length > 0)" @click="submitMessage()">
								<v-icon>send</v-icon>
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card>
			</v-flex>
		</v-layout>
	</v-layout>
</template>

<style>
	.active {
		background-color: #4F4F4F;
		transition: all .5s;
	}
</style>

<script>
	import 'vue-use-vuex'
	import store from '@/store/UsersStore.js'
	export default {
		name: 'messages',
		sockets: {
			error_message () {
				this.messages.splice(-1, 1)
			},
			receive_message (data) {
				let container = this.$el.querySelector('#talk')
				this.messages.push(data)
				setTimeout(() => {
					container.scrollTop = container.scrollHeight
				}, 10)
			}
		},
		data () {
			return {
				store,
				talks: [],
				active_id: 0,
				writing: '',
				messages: []
			}
		},
		mounted () {
			this.axios.get('/talks', { headers: { 'Authorization': 'Bearer ' + this.$ls.get('token') } })
				.then(response => {
					if (response.data.status === 0 || response.data.message === null || response.data.message.length === 0) {
						console.log('No talks...')
					} else {
						response.data.message.forEach(t => {
							t.active = false
							this.talks.push(t)
						})
						this.changeActiveID(this.talks[0].talk_id)
					}
				})
				.catch(err => {
					console.log(err)
				})
		},
		methods: {
			changeActiveID: function (id) {
				let container = this.$el.querySelector('#talk')
				this.active_id = id
				this.messages = []
				this.axios.get('/talks/' + id, { headers: { 'Authorization': 'Bearer ' + this.$ls.get('token') } })
					.then(response => {
						if (response.data.message !== null) {
							response.data.message.forEach(m => {
								m.content = Buffer.from(m.content).toString()
								this.messages.push(m)
								setTimeout(() => {
									container.scrollTop = container.scrollHeight
								}, 10)
							})
						}
					})
					.catch(err => {
						console.log(err)
					})
			},
			submitMessage: function () {
				let container = this.$el.querySelector('#talk')
				let talk = this.talks.find(e => e.ID === this.active_id)
				this.$socket.emit('new_message', {
					user_source: this.$ls.get('token'),
					conv_ID: talk.ID,
					user_ID_destination: talk.user_ID_destination !== this.store.state.user.ID ? talk.user_ID_destination : talk.user_ID_source,
					username_destination: talk.username,
					message: this.writing
				})
				let id = this.messages.length > 0 ? Number(this.messages[this.messages.length - 1].ID) + 1 : 1
				this.messages.push({
					ID: id,
					content: this.writing,
					conv_ID: talk.ID,
					created_at: new Date().toISOString(),
					user_ID: this.store.state.user.ID
				})
				setTimeout(() => {
					container.scrollTop = container.scrollHeight
				}, 10)
				this.writing = ''
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
		}
	}
</script>
