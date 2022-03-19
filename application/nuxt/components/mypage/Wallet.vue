<template>
  <div>
    <template v-if="!user.address">
      <p>
        Symbolアドレスが設定されていません。<br>
        アイテムの購入や出品を行うには、アドレスを登録してください。
      </p>
      <div class="card mb-3">
        <div class="card-body">
          <b-row>
            <b-col md="7">
              <div class="mb-3">
                <b-form-group
                    id="private_key"
                    label="秘密鍵"
                >
                  <b-form-input
                      id="private_key"
                      v-model="privateKey"
                      type="password"
                      placeholder="Private Key"
                      required
                  ></b-form-input>
                </b-form-group>
                <b-form-group
                    id="password"
                    label="暗号化パスワード(半角)"
                >
                  <b-form-input
                      id="password"
                      v-model="password"
                      type="password"
                      placeholder="Password"
                      required
                  ></b-form-input>
                </b-form-group>
                <p v-if="error" class="alert-warning">{{ error }}</p>
                <b-button @click="register" pill>登録</b-button>
              </div>
            </b-col>
            <b-col md="5">
              <p><b>登録処理</b></p>
              <p>1. アドレス作成
                <b-badge v-if="progress >= 1" pill variant="primary">OK</b-badge>
              </p>
              <p>2. 秘密鍵を暗号化
                <b-badge v-if="progress >= 2" pill variant="primary">OK</b-badge>
              </p>
              <p>3. 秘密鍵破棄
                <b-badge v-if="progress >= 3" pill variant="primary">OK</b-badge>
              </p>
              <p>4. 暗号化秘密鍵登録
                <b-badge v-if="progress >= 4" pill variant="primary">OK</b-badge>
              </p>
              <p>5. 登録完了
                <b-badge v-if="progress >= 4" pill variant="primary">OK</b-badge>
              </p>
            </b-col>
          </b-row>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="mb-2">
        登録アドレス：{{ user.address }}
        <br>
        <br>
        <p v-if="error" class="alert-warning">{{ error }}</p>
        <b-button @click="deleteAddress" pill>登録アドレス削除</b-button>
      </div>
    </template>

    <div>
      <p>
        <b>※秘密鍵の取扱について</b><br>
        秘密鍵は暗号化パスワードで暗号化したものをサーバーに保持します。<br>
        秘密鍵は暗号化後に即時破棄しますが、残高を必要最低限にするなど、必ずご自身で盗難対策の実施をお願いいたします。
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import {Account, Crypto} from "symbol-sdk";
import {mapGetters} from 'vuex';
import {AuthStore} from "~/utils/store-accessor";

export type DataType = {
  privateKey: string,
  password: string,
  error: string,
  progress: number,
}

export default Vue.extend({
  data(): DataType {
    return {
      privateKey: '',
      password: '',
      error: '',
      progress: 0,
    }
  },
  computed: {
    ...mapGetters({
      user: 'auth/getAuthUser',
    }),
  },
  methods: {
    validate(): boolean {
      if (!this.privateKey) {
        this.error = '秘密鍵は入力必須項目です。';
        return false;
      }
      if (!this.password) {
        this.error = '暗号化パスワードは入力必須項目です。';
        return false;
      }
      return true;
    },
    async register() {
      this.error = '';
      if (!this.validate()) {
        return;
      }
      const _sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
      let account: Account | undefined;
      try {
        account = Account.createFromPrivateKey(this.privateKey, this.$service.nftService.getNetworkType())
      } catch (e) {
        this.error = '入力エラーです。入力内容をご確認の上、再度お試しください。';
        console.log(e);
        return;
      }
      // アドレス作成
      const address = account.address.plain();
      this.progress = 1;
      await _sleep(500);

      // 秘密鍵暗号化
      const encryption_private_key = Crypto.encrypt(account.privateKey, this.password);
      this.progress = 2;
      await _sleep(500);

      // 秘密鍵破棄
      account = undefined;
      this.progress = 3;
      await _sleep(500);

      // アドレス/暗号化秘密鍵の登録
      let addressData = {address: '', encryption_private_key: ''};
      try {
        addressData = {address: address, encryption_private_key: encryption_private_key};
        const { data } = await this.$axios.post('/api/register/address', addressData);
        if(data.jwt) {
          this.setJWTToken(data.jwt);
        }
      } catch {
        this.error = '不明なエラーが発生しました。時間をおいて再度お試しください。';
        return;
      }
      this.progress = 4;
      this.makeToast("アドレスを登録しました。");
      this.error = "";
      await _sleep(800);
      AuthStore.updateAddressAndEncryptionPrivateKey(addressData);
    },
    async deleteAddress() {
      this.error = "";
      try {
        const {data} = await this.$axios.post('/api/delete/address');
        if(data.jwt) {
          this.setJWTToken(data.jwt);
        }
      } catch {
        this.error = '不明なエラーが発生しました。時間をおいて再度お試しください。';
        return;
      }
      AuthStore.updateAddressAndEncryptionPrivateKey({address: '', encryption_private_key: ''})
      this.makeToast("アドレスを削除しました。");
    },
    makeToast(message: string): void {
      (this as any).$bvToast.toast(message, {
        autoHideDelay: 5000,
        appendToast: false,
        variant: "info",
      })
    },
    setJWTToken(jwt: string) {
      this.$cookies.set('token', jwt, {
        secure: true,
        path: '/',
      });
    },
  },
  created() {
  },
})
</script>

<style scoped lang="scss"></style>