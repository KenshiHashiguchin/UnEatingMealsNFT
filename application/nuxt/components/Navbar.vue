<template>
  <div>
    <b-navbar>
      <b-navbar-brand href="/">Uneatingmeals</b-navbar-brand>
      <b-nav-text href="#" class="mx-2">Testnet</b-nav-text>
      <b-navbar-nav class="ml-auto">
        <b-link to="/minigame"><b-nav-text>Minigame</b-nav-text></b-link>
        <b-link to="/market"><b-nav-text class="mx-2">SuperMarket</b-nav-text></b-link>
        <template v-if="isAuthenticated">
          <b-link to="/mypage"><b-nav-text href="#" class="mx-2">MyPage</b-nav-text></b-link>
        </template>
        <template v-else>
          <b-nav-text href="#" class="mx-2" @click="$refs.signInModal.open()">Sign In</b-nav-text>
        </template>
      </b-navbar-nav>
    </b-navbar>
    <SignIn ref="signInModal"/>
    <SignUp ref="signUpModal"/>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import SignIn from "~/components/modals/SignIn.vue";
import SignUp from "~/components/modals/SignUp.vue";
import {mapState} from 'vuex'

export type DataType = {
  signInModal: boolean;
  signUpModal: boolean;
}

export default Vue.extend({
  components: {SignIn, SignUp},
  data(): DataType {
    return {
      signInModal: false,
      signUpModal: false,
    }
  },
  computed: {
    ...mapState('auth', ['authUser']),
    ...mapState('auth', ['isAuthenticated']),
  },
  methods: {},
})

</script>