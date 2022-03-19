<template>
  <b-overlay :show="show" rounded="sm" no-wrap>
    <template #overlay>
      <div class="text-center">
        <span class="spinner-border"></span>
        <p id="cancel-label">ログインしています。</p>
      </div>
    </template>
  </b-overlay>
</template>

<script lang="ts">
import Vue from "vue";
import {AuthStore} from "~/utils/store-accessor";

export type DataType = {
  show: boolean,
  provider: string | (string | null)[]
}

export default Vue.extend({
  data(): DataType {
    return {
      show: false,
      provider: "",
    }
  },
  methods: {
    makeToast(message: string): void {
      (this as any).$bvToast.toast(message, {
        autoHideDelay: 5000,
        appendToast: false,
        variant: "info",
      })
    },
    // onShown(): void {
    //   // Focus the cancel button when the overlay is showing
    //   (this as any).$refs.cancel.focus()
    // },
    // onHidden(): void {
    //   // Focus the show button when the overlay is removed
    //   (this as any).$refs.show.focus()
    // }
  },
  async created() {
    if (this.$route.query.provider && this.$route.query.state && this.$route.query.code) {
      this.show = true
    }
  },
  async mounted() {
    if (process.client) {
      if (this.$route.query.provider && this.$route.query.state && this.$route.query.code) {
        this.provider = this.$route.query.provider
        this.show = true

        // jwt発行
        let query = this.$route.query
        delete query["provider"]
        var {data} = await this.$axios.get(
            `/api/callback/auth/${this.provider}`,
            {
              params: this.$route.query,
            }
        )
        const jwt = await AuthStore.setAuthConfig(data);
        this.$cookies.set('token', jwt, {
          secure: true,
          path: '/',
        });

        this.$router.push("/")
        await this.$axios.get('/api/auth/me').then(() => {
          this.show = false
          this.makeToast(this.provider + "でログインしました。")
        }).catch(() => {
          this.show = false
          this.makeToast(this.provider + "でログインに失敗しました。")
          AuthStore.logout();
        })
      }
    }
  }
})
</script>

<style scoped>
.toast-header {
  display: none;
}
</style>