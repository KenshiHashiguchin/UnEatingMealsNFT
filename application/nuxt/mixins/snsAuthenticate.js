import { $axios } from '~/utils/api'

export default {
  methods: {
    async authenticate(provider) {
      try {
        const { data } = await $axios.get(`/api/auth/redirect/${provider}`);
        window.location.href = data.redirect_url
      } catch (e) {
        this.error = e.response.data.message
      }
    },
  },
}
