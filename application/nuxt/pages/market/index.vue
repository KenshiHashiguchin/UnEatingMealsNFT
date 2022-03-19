<template>
  <div class="row">
    <div class="col-3">
      <b-list-group>
        <b-list-group-item button>Meals</b-list-group-item>
        <b-list-group-item button>Wearables</b-list-group-item>
        <b-list-group-item id="ticket" button>Tickets</b-list-group-item>
      </b-list-group>
      <b-popover target="ticket" triggers="hover" placement="right">
        Comming Soon...
      </b-popover>
    </div>
    <div class="col-9">
      <b-alert v-if="!user" show variant="primary">Mealsを購入するにはアカウントを登録してください。</b-alert>
      <b-alert v-else-if="user && !user.address" show variant="primary">Mealsを購入するには
        <b-link to="/mypage?page=wallet">ウォレット</b-link>
        を登録してください。
      </b-alert>
      <b-alert v-else show variant="primary">より多くの方にα版をお試しいただきたいので、購入できるMealsは一個までとなります。</b-alert>
      <template v-if="gameAccounts.length">
        <div class="row">
          <div v-for="(gameAccount, i) in gameAccounts" class="col-12">
            <MealPanel :prop-meal="gameAccount.meal" :game-account="gameAccount" :key="i"/>
          </div>
        </div>
      </template>
      <template v-else>
        <b-overlay :show="true" rounded="sm" no-wrap>
          <template #overlay>
            <div class="text-center">
              <span class="spinner-border"></span>
            </div>
          </template>
        </b-overlay>
      </template>
      <br>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import {Address, Metadata, MosaicId,} from "symbol-sdk";
import {Ability, Equipment, EquipmentMosaicId, Meal} from "~/models/Meal";
import MealPanel from "~/components/parts/Meal/MealPanel.vue";
import {MarketGameAccountStore, MealsStore, SupplierStore} from "~/store";
import {MealService} from "~/services/MealService";
import {GameAccount} from "~/models/GameAccount";
import {mapGetters} from "vuex";
import {YamlUtils} from "~/services/storage";

type DataType = {}

export default Vue.extend({
  components: {MealPanel},
  data(): DataType {
    return {}
  },
  asyncData({app}): Promise<object | void> | object | void {
  },
  computed: {
    ...mapGetters({
      user: 'auth/getAuthUser',
      myGameAccounts: 'myGameAccount/getMyGameAccounts',
    }),
    meals: {
      get() {
        return MealsStore.getMeals;
      },
      set(value: Meal[]) {
        MealsStore.setMeals(value);
      }
    },
    gameAccounts: {
      get() {
        return MarketGameAccountStore.getMarketGameAccounts;
      },
      set(value: GameAccount[]) {
        MarketGameAccountStore.setMarketGameAccount(value);
      },
    },
  },
  methods: {
    async setGameAccount(_addresses: string[]) {
      let gameAccounts: GameAccount[] = [];
      let addresses: Address[] = [];
      _addresses.forEach((address: string) => {
        const accountAddress = Address.createFromRawAddress(address);
        addresses.push(accountAddress);
      });

      // let accounts: {metadata: Metadata, address: Address}[] = [];
      const serviceAddress = Address.createFromRawAddress(this.$config.serviceAddress);
      const accounts: { metadata: Metadata, address: Address }[] = (await Promise.all(addresses.map(async (address: Address) => {
        return {
          address: address,
          metadata: await this.$service.nftService.getAccountMetadataByAddress('meal_id', address, serviceAddress)
        }
      }))).filter((account: { metadata: Metadata | null, address: Address }) => {
        return account.metadata !== null;
      }) as { metadata: Metadata, address: Address }[];

      const accountMeals: { address: Address, meal: Meal }[] = (await Promise.all(accounts.map(async (account: { metadata: Metadata, address: Address }) => {
        const mosaicId = new MosaicId(account.metadata.metadataEntry.value);
        const agg = await this.$service.nftService.getAggregateTransactionByMosaicId(mosaicId);
        if (agg) {
          const meal: Meal = {
            mosaicId: mosaicId,
            aggregateTransaction: agg,
            metadata: {
              type: 'meals',
            }
          }
          const mealServices = new MealService(meal, this.$service.nftService.getTransactionRepository(), this.$config.servicePublicKey, this.$config.networkType)
          meal.svg = await mealServices.getSVGStruct();


          // ability取得
          await mealServices.getAbility().then(async (res: Ability | null) => {
            if (res && meal.metadata) {
              meal.metadata.ability = res;
            }
          });
          return {address: account.address, meal: meal};
        }
        return null;
      }))).filter(async (meal) => {
        if (meal === null) {
          return false;
        }

        // 所有チェック
        const holdMosaicIds = await this.$service.nftService.getHoldMosaicIds(meal.address);
        return !holdMosaicIds.every((mosaicId: MosaicId) => {
          //持ってないことをtrue
          return !mosaicId.equals(meal.meal.mosaicId);
        });

      }) as { address: Address, meal: Meal }[];

      if (accountMeals.length !== 0) {
        // 装備情報メタデータ取得
        gameAccounts = await Promise.all(accountMeals.map(async (accountMeal: { address: Address, meal: Meal }) => {
          let tmp = {address: accountMeal.address, meal: accountMeal.meal};
          try {
            const parentAddresses = await this.$service.nftService.getCosignatoryAddresses(accountMeal.address);
            let cosigAddress = accountMeal.address;
            if (parentAddresses.length > 0) {
              cosigAddress = parentAddresses[0];
            }
            const equipMetadata = await this.$service.nftService.getAccountMetadataByAddress('equipments', accountMeal.address, cosigAddress);

            if (equipMetadata?.metadataEntry.value) {
              console.log(equipMetadata.metadataEntry.value);
              const eq = YamlUtils.fromYaml(equipMetadata?.metadataEntry.value) as
                  { left_hand: string | null, right_hand: string | null, head: string | null, shoes: string | null, glasses: string | null };
              // 実際に所有しているmosaicのみ抽出
              const eqMosaicIds: EquipmentMosaicId = await this.$service.nftService.filterEquipmentMosaicIds(accountMeal.address, eq);
              const equipment: Equipment = {};
              const mealServices = new MealService(accountMeal.meal, this.$service.nftService.getTransactionRepository(), this.$config.servicePublicKey, this.$config.networkType);
              if (eqMosaicIds.left_hand?.id) {
                equipment.left_hand = await mealServices.getWearables(eqMosaicIds.left_hand, this.$service.nftService);
              }
              if (eqMosaicIds.right_hand?.id) {
                equipment.right_hand = await mealServices.getWearables(eqMosaicIds.right_hand, this.$service.nftService);
              }
              if (eqMosaicIds.head?.id) {
                console.log('head!!!');
                console.log(eqMosaicIds.head.id);
                equipment.head = await mealServices.getWearables(eqMosaicIds.head, this.$service.nftService);
              }
              if (eqMosaicIds.shoes?.id) {
                equipment.shoes = await mealServices.getWearables(eqMosaicIds.shoes, this.$service.nftService);
              }
              if (eqMosaicIds.glasses?.id) {
                equipment.glasses = await mealServices.getWearables(eqMosaicIds.glasses, this.$service.nftService);
              }
              if (tmp.meal.metadata) {
                tmp.meal.metadata.equipment = equipment
              }
            }
          } catch (e) {
            console.log(e);
            return null;
          }
          console.log('gameAccount');
          console.log(tmp);
          return tmp
        })) as GameAccount[];
        MarketGameAccountStore.setMarketGameAccount(gameAccounts.filter((item) => {
          return item != null;
        }));
      }
    },
    async setSupplierMealAddresses() {
      const rawAddress = Address.createFromRawAddress(this.$config.supplierAddress);
      const mealAddresses = await this.$service.nftService.getGameMultiSigAccount(rawAddress);
      const addresses = mealAddresses.map((item) => {
        return item.address;
      });
      SupplierStore.setMealAccounts(addresses);
    },
    async getMyItem() {

    },
  },
  mounted() {
  },
  async created() {
    if (process.client) {
      const {data} = await this.$axios.get('/api/game_account');
      const addresses = data.game_accounts.map((account: { id: number, address: string, created_at: string }) => {
        return account.address;
      });
      if (SupplierStore.getMealAddresses.length === 0) {
        this.setSupplierMealAddresses();
      }
      await this.setGameAccount(addresses);

      // 所持ゲームアカウントセット
      if (this.user && this.user.address) {
        await this.$store.dispatch("myGameAccount/set", {
          userAddress: this.user.address,
          nftService: this.$service.nftService,
          servicePublicKey: this.$config.servicePublicKey,
          networkType: this.$config.networkType
        });
      }
    }
  },
})
</script>
