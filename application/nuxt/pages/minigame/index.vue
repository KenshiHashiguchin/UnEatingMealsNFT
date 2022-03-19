<template>
  <div class="container">
    <template v-if="selectedMeal || false">
      <client-only>
        <InGame :meal="selectedMeal" @back="selectedMeal = null"/>
      </client-only>
    </template>
    <template v-else>
      <div v-if="!isConfirmedPrivateKey" class="row">
        <div class="col-12 text-center">
          <h4>秘密鍵でログインする</h4>
          <div class="mb-5" style="max-width: 500px; margin: auto;">
            <div class="input-group mb-3 text-center">
              <input type="password" class="form-control" v-model="privateKey" placeholder="秘密鍵を入力してください。"
                     aria-label="login account"
                     aria-describedby="button-addon2">
              <div class="input-group-append">
                <button class="btn btn-outline-secondary" type="button" id="login" @click="getAccount">決定</button>
              </div>
            </div>
            <p v-if="errorMessage" class="text-danger">{{ errorMessage }}</p>
          </div>
        </div>
        <div class="col-12">
          <div class="card" style="max-width: 500px; margin: auto;">
            <div class="card-body">
              <p>所持しているmealsを取得するために、あなたのアドレスを教えてください。（※テストネットです。）</p>
              <p>※入力された秘密鍵が送信されることはありません。</p>
            </div>
          </div>
        </div>
        <div class="row">
          <MealPanel v-for="(myGameAccount, i) in myGameAccounts" :game-account="myGameAccount"
                     :prop-meal="myGameAccount.meal" :key="i"/>
        </div>
      </div>
      <div v-else>
        <Select :game-accounts="myGameAccounts" @decisionAccount="gameStart"/>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {Account, Address, MosaicId} from "symbol-sdk";
import {mapGetters} from "vuex";
import MealSvg from "~/components/parts/Meal/MealSvg.vue";
import MealPanel from "~/components/parts/Meal/MealPanel.vue";
import Select from "~/components/game/Select.vue";
import {GameAccount} from "~/models/GameAccount";
import InGame from "~/components/game/InGame.vue";
import {Meal} from "~/models/Meal";

type DataType = {
  privateKey: string;
  isConfirmedPrivateKey: boolean;
  selectedMeal: null | Meal;
  errorMessage: string;
}

export default Vue.extend({
  layout: "game",
  components: {InGame, MealSvg, MealPanel, Select},
  data(): DataType {
    return {
      privateKey: '',
      isConfirmedPrivateKey: false,
      selectedMeal: null,
      errorMessage: '',
    }
  },
  computed: {
    ...mapGetters({
      myGameAccounts: 'myGameAccount/getMyGameAccounts',
    }),
  },
  methods: {
    async getAccount() {
      let account: Account;
      try {
        account = Account.createFromPrivateKey(this.privateKey, this.$config.networkType);
      } catch {
        this.errorMessage = "無効な秘密鍵です。もう一度お確かめの上、入力してください。";
        return;
      }

      this.privateKey = '';
      await this.$store.dispatch("myGameAccount/set", {
        userAddress: account.address.plain(),
        nftService: this.$service.nftService,
        servicePublicKey: this.$config.servicePublicKey,
        networkType: this.$config.networkType
      });
      this.isConfirmedPrivateKey = true;
    },
    gameStart(value: GameAccount) {
      // this.isConfirmedPrivateKey = false;
      this.selectedMeal = value.meal;
    }
  }
})
</script>

<style scoped>

</style>