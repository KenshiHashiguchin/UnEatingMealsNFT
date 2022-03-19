<template>
  <div class="row">
    <div class="col-4">
      <b-list-group>
        <b-list-group-item v-if="user && user.address" button @click="mode = 'item'" :active="mode === 'item'">もちもの</b-list-group-item>
        <b-list-group-item v-else button :active="mode === 'item'" id="disabled_item">もちもの</b-list-group-item>
        <b-popover target="disabled_item" triggers="hover" placement="top">
          ウォレットを登録してください。
        </b-popover>
        <b-list-group-item button @click="mode = 'wallet'" :active="mode === 'wallet'">ウォレット</b-list-group-item>
        <b-list-group-item @click="logout" button :active="mode === 'logout'">ログアウト</b-list-group-item>
      </b-list-group>
    </div>
    <div class="col-8">
      <GameAccount v-if="mode === 'item'"></GameAccount>
      <Wallet v-if="mode === 'wallet'"></Wallet>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {AuthStore} from "~/utils/store-accessor";
import Wallet from "~/components/mypage/Wallet.vue";
import {mapGetters} from "vuex";
import GameAccount from "~/components/mypage/GameAccount.vue";

export interface DataType {
  mode: 'item' | 'wallet' | 'logout';
}

export default Vue.extend({
  components: {GameAccount, Wallet},
  data(): DataType {
    return {
      mode: 'item',
    }
  },
  computed: {
    ...mapGetters({
      user: 'auth/getAuthUser',
    }),
  },
  methods: {
    logout() {
      this.mode = 'logout';
      AuthStore.logout();
      this.$cookies.remove('token');
      this.$router.push({ path: '/', query: { action: 'logout' } });
    },
  },
  created() {
    const param = this.$route.query.page || '';
    if (param === 'wallet' || param === 'logout') {
      this.mode = param;
    } else if (!this.user.address) {
      this.mode = 'wallet';
    } else {
      this.mode = 'item';
    }
  },
})
</script>

<style lang="scss">
ul {
  list-style-type: none;
}
</style>
