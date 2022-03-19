<template>
  <div>
    <b-button v-if="buyable" @click="purchase" pill>購入する</b-button>
    <b-button v-else pill disabled>購入する</b-button>
    <Decryption ref="decryptionModal" :message="'このMealを0xymで購入しますか？'" :button-message="'購入する'" @action="action" />
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import {mapGetters} from "vuex";
import {Account, Address} from "symbol-sdk";
import {GameAccount} from "~/models/GameAccount";
import Decryption, {DataType} from "~/components/modals/Decryption.vue";


export default Vue.extend({
  components: {Decryption},
  data() {
    return {
      targetAddress: '', //購入するゲームアカウントアドレス
    }
  },
  computed: {
    ...mapGetters({
      user: 'auth/getAuthUser',
    }),
  },
  props: {
    buyable: {
      type: Boolean,
      required: false,
      default: false,
    },
    gameAccount: {
      type: Object as () => GameAccount,
      required: true,
    },
  },
  methods: {
    // async purchase() {
    async purchase() {
      const refs = this.$refs as any;
      refs.decryptionModal.open();
    },
    async action(privateKey: string) {
      const userAccount = Account.createFromPrivateKey(privateKey, this.$config.networkType);
      const {result, message} = await this.$service.purchaseService.createPurchaseGameAccountTransaction(userAccount, this.gameAccount.address, 0);
      const refs = this.$refs as any;
      refs.decryptionModal.close();
      if (result) {
        (this as any).$bvToast.toast(message, {
          autoHideDelay: 5000,
          appendToast: false,
          variant: "info",
        })
      } else {
        (this as any).$bvToast.toast(message, {
          autoHideDelay: 5000,
          appendToast: false,
          variant: "danger",
        })
      }
    }
  },
})
</script>

<style scoped>

</style>