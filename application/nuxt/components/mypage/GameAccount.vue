<template>
  <div>
    <p v-if="this.myGameAccounts.length === 0">所持しているMealsはありません。</p>
    <template v-for="(account, i) in this.myGameAccounts">
      <MealPanel :prop-meal="account.meal" :game-account="account" :display-buy-button="false" :display-wearable="true" :is-mine="true" :key="i"/>
    </template>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import {mapGetters} from "vuex";
import {Address, Metadata, MosaicId} from "symbol-sdk";
import {MealService} from "~/services/MealService";
import {Ability, Meal} from "~/models/Meal";
import {MealsStore, MyGameAccountStore} from "~/utils/store-accessor";
import {GameAccount} from "~/models/GameAccount";
import MealPanel from "~/components/parts/Meal/MealPanel.vue";


export type DataType = {}

export default Vue.extend({
  components: {MealPanel},
  data(): DataType {
    return {}
  },
  computed: {
    ...mapGetters({
      user: 'auth/getAuthUser',
      myMeal: 'myitem/getMeals',
      myGameAccounts: 'myGameAccount/getMyGameAccounts',
    }),
  },
  methods: {},
  async created() {
    if (process.client){
      await this.$store.dispatch("myGameAccount/set", {userAddress: this.user.address, nftService: this.$service.nftService, servicePublicKey: this.$config.servicePublicKey, networkType: this.$config.networkType});
    }
  },
})
</script>

<style scoped lang="scss"></style>