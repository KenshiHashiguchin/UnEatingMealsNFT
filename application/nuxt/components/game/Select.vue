<template>
  <div class="container">
    <div class="row">
      <div class="col-12 text-center">
        <h4>使用するMealsを選択</h4>
        <div class="mb-5" style="max-width: 500px; margin: auto;">
          <div class="mb-3 text-center">
            <GameAbility v-for="(gameAccount, i) in gameAccounts" :game-account="gameAccount" :prop-meal="gameAccount.meal" :key="i" @decisionAccount="decisionAccount"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import {GameAccount} from "~/models/GameAccount";
import GameAbility from "~/components/game/GameAbility.vue";


export default Vue.extend({
  components: {GameAbility},
  props: {
    gameAccounts: {
      type: Array as () => GameAccount[],
      required: true,
    }
  },
  methods: {
    decisionAccount(value: GameAccount) {
      this.$emit('decisionAccount', value);
    }
  },
})
</script>
