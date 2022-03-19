<template>
  <div>
    <b-modal v-model="modal" centered hide-header hide-footer>
      <h5 class="text-center my-5">{{ message }}</h5>
      <div class="row">
        <div class="col-md-12 px-md-5 pb-5">
          <b-form-group
              id="decryption_password"
              label="パスワード"
              label-for="decryption_password"
              description="ウォレットパスワードを入力してください。"
          >
            <b-form-input
                id="input-1"
                v-model="password"
                type="password"
                placeholder="Enter password"
                required
            ></b-form-input>
          </b-form-group>
          <p class="text-danger">{{ errorMessage }}</p>
          <div class="text-right">
            <template v-if="spinner">
              <b-button pill><b-spinner label="Spinning" small></b-spinner> 処理中です...</b-button>
            </template>
            <template v-else>
              <b-button @click="action" pill>{{ buttonMessage }}</b-button>
            </template>
          </div>
        </div>
      </div>
    </b-modal>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import {Crypto} from "symbol-sdk";
import {mapGetters} from "vuex";

export type DataType = {
  modal: boolean;
  password: string;
  errorMessage: string;
  spinner: boolean;
}

export default Vue.extend({
  data(): DataType {
    return {
      modal: false,
      password: '',
      errorMessage: '',
      spinner: false,
    }
  },
  props: {
    message: {
      type: String,
      required: false,
      default: '',
    },
    buttonMessage: {
      type: String,
      required: false,
      default: '',
    },
  },
  computed: {
    ...mapGetters({
      user: 'auth/getAuthUser',
    }),
  },
  methods: {
    open() {
      this.modal = true;
    },
    close() {
      this.spinner = false;
      this.modal = false;
    },
    action() {
      this.errorMessage = '';
      if (!this.password) {
        this.errorMessage = 'パスワードを入力してください。'
        return;
      }
      let privateKey = Crypto.decrypt(this.user.encryption_private_key, this.password);
      this.password = ''
      if (!privateKey) {
        this.errorMessage = 'パスワードが一致しません。アドレス登録時に入力したパスワードをご確認ください。';
        return;
      }
      this.spinner = true;
      this.$emit('action', privateKey)
      privateKey = "";
    },
  },
})
</script>

<style scoped>

</style>