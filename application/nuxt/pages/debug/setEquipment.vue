<template>
  <div>
    <div class="row">
      <div class="col-12">
        <h3>装備セット</h3>
        <p>Meals保持アカウント（親アカウント）秘密鍵:</p>
        <b-form-input
            label="Meals保持アカウント（親アカウント）:"
            type="password"
            v-model="gameAccountPrivate"
        ></b-form-input>
        <br>
      </div>
      <div class="col-12">
        <p>Mealsアカウント（子アカウント）アドレス:</p>
        <b-form-input
            label="Meals保持アカウント（親アカウント）:"
            v-model="mealAccountRawAddress"
        ></b-form-input>
        <br>
      </div>
      <div class="col-6">
        <p>head モザイク</p>
        <b-form-input
            label="対象モザイク:"
            v-model="headMosaicId"
        ></b-form-input>
      </div>
      <div class="col-6">
        <p>glasses モザイク</p>
        <b-form-input
            label="対象モザイク:"
            v-model="glassesMosaicId"
        ></b-form-input>
      </div>
      <div class="col-6">
        <p>right_hand モザイク</p>
        <b-form-input
            label="対象モザイク:"
            v-model="rightHandMosaicId"
        ></b-form-input>
      </div>
      <div class="col-6">
        <p>left_hand モザイク</p>
        <b-form-input
            label="対象モザイク:"
            v-model="leftHandMosaicId"
        ></b-form-input>
      </div>
      <div class="col-6">
        <p>shoes モザイク</p>
        <b-form-input
            label="対象モザイク:"
            v-model="shoesMosaicId"
        ></b-form-input>
      </div>
      <div class="col-12">
        <br>
        <b-button type="button" variant="primary" @click="setEquipment">Submit</b-button>
      </div>
    </div>
    <br><br>
    <br><br>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import {
  Account, Address,
  AggregateTransaction,
  Deadline,
  KeyGenerator, MetadataHttp, MetadataTransactionService,
  PublicAccount,
  RepositoryFactoryHttp,
  UInt64
} from "symbol-sdk";
import {YamlUtils} from "~/services/storage";
import { of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

export default Vue.extend({
  data() {
    return {
      gameAccountPrivate: '',
      mealAccountRawAddress: '',
      headMosaicId: '',
      glassesMosaicId: '',
      rightHandMosaicId: '',
      leftHandMosaicId: '',
      shoesMosaicId: '',
      mosaicId: '',
      equipmentPart: '',
    }
  },
  methods: {
    // ゲームアカウントにモザイクを送信し、装備情報メタデータを割り当てる
    async setEquipment() {
      // 設定
      const repositoryFactory = new RepositoryFactoryHttp('https://001-joey-dual.symboltest.net:3001');
      const transactionHttp = repositoryFactory.createTransactionRepository();
      const epochAdjustment = await repositoryFactory.getEpochAdjustment().toPromise();
      const deadline = Deadline.create(epochAdjustment);
      const networkType = this.$service.nftService.getNetworkType();
      const generationHash = await repositoryFactory.getGenerationHash().toPromise();
      const metadataHttp = new MetadataHttp('https://001-joey-dual.symboltest.net:3001');
      const metadataService = new MetadataTransactionService(metadataHttp);

      const m19Account = Account.createFromPrivateKey(this.gameAccountPrivate, networkType);
      // 装備情報メタデータ割り当て
      const metadataData = this.getPositionData();
      const value = YamlUtils.toYaml(metadataData);
      const mealAccountAddress = Address.createFromRawAddress(this.mealAccountRawAddress);
      const accountMetadataTransaction = metadataService.createAccountMetadataTransaction(
          deadline,
          networkType,
          mealAccountAddress,
          KeyGenerator.generateUInt64Key('equipments'),
          value,
          m19Account.address,
          UInt64.fromUint(0),
      );
      const signedTransaction = await accountMetadataTransaction.pipe(
          mergeMap((transaction) => {
            const aggregateTransaction = AggregateTransaction.createComplete(
                Deadline.create(epochAdjustment),
                [transaction.toAggregate(m19Account.publicAccount)],
                networkType,
                [],
                UInt64.fromUint(2000000),
            );
            const signedTransaction = m19Account.sign(
                aggregateTransaction,
                generationHash,
            );
            return of(signedTransaction);
          }),
      ).toPromise();

      transactionHttp.announce(signedTransaction).subscribe(
          (x) => {
            console.log('ok');
            console.log(x);
          },
          (err) => console.error(err),
      );
    },
    getPositionData() {
      const tmp = {
        left_hand: this.leftHandMosaicId,
        right_hand: this.rightHandMosaicId,
        head: this.headMosaicId,
        shoes: this.shoesMosaicId,
        glasses: this.glassesMosaicId,
      }
      return tmp;
    },
  }
})
</script>
