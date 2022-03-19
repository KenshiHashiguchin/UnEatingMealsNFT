<template>
  <b-card no-body class="overflow-hidden" style="background-color: white;">
    <b-card-body>
      <b-row no-gutters>
        <b-col md="6">
          <MealSvg v-if="this.meal.svg" :meal="this.meal"/>
        </b-col>
        <b-col md="6">
          <b-card-text>
            <b-row no-gutters>
              <b-row no-gutters>
                <b-col md="12">
                  <table style="width: 100%;">
                    <tr>
                      <td>名称</td>
                      <td class="text-right">
                        <MealName/>
                      </td>
                    </tr>
                    <tr>
                      <td>レベル</td>
                      <td class="text-right">1</td>
                    </tr>
                  </table>
                  <br>
                </b-col>
              </b-row>
              <hr>
              <b-col md="12">
                <Nutrients :metadata="meal.metadata"/>
                <br>
              </b-col>
              <b-col v-if="!isMine" md="12">
                <template v-if="displayBuyButton">
                  <p>
                    税込価格　￥0 (xym)
                    <b-badge v-if="!buyable" pill variant="warning">売り切れ</b-badge>
                  </p>
                  <div v-if="this.buyable" align="right">
                    <template v-if="!user || !user.address">
                    <span :id="this.meal.mosaicId.toHex()" class="d-inline-block" tabindex="0">
                    <MealPurchaseButton :buyable="false" :game-account="gameAccount"/>
                    </span>
                      <b-tooltip :target="this.meal.mosaicId.toHex()" placement="bottom">
                        <span v-if="!user">アカウントを登録してください。</span>
                        <span v-else><b-link to="/mypage?page=wallet">ウォレット</b-link>を登録してください。</span>
                      </b-tooltip>
                    </template>
                    <template v-else>
                      <MealPurchaseButton :buyable="myGameAccounts.length === 0" :game-account="gameAccount"/>
                    </template>
                  </div>
                </template>
                <template v-else>
                  <p>
                    税込価格　￥0 (xym)
                    <b-badge v-if="!buyable" pill variant="warning">売り切れ</b-badge>
                  </p>
                </template>
              </b-col>
            </b-row>
          </b-card-text>
        </b-col>
      </b-row>
<!--      <b-row v-if="displayWearable">-->
<!--        <b-card-text>-->
<!--          <b-button class="m-1" pill>名称変更</b-button>-->
<!--        </b-card-text>-->
<!--      </b-row>-->
    </b-card-body>
  </b-card>
</template>

<script lang="ts">
import Vue from "vue";
import {Meal} from "~/models/Meal";
import {GameAccount} from "~/models/GameAccount";
import {MealsStore} from "~/store";
import MealSvg from "~/components/parts/Meal/MealSvg.vue";
import MealName from "~/components/parts/Meal/MealName.vue";
import Nutrients from "~/components/parts/Meal/Nutrients.vue";
import MealPurchaseButton from "~/components/parts/Meal/MealPurchaseButton.vue";
import {mapGetters} from "vuex";
import {Address, MosaicId} from "symbol-sdk";

export default Vue.extend({
  components: {MealName, MealSvg, Nutrients, MealPurchaseButton},
  props: {
    propMeal: {
      type: Object as () => Meal,
      required: true,
    },
    displayBuyButton: {
      type: Boolean,
      required: false,
      default: true,
    },
    displayWearable: {
      type: Boolean,
      required: false,
      default: false,
    },
    isMine: {
      type: Boolean,
      required: false,
      default: false,
    },
    gameAccount: {
      type: Object as () => GameAccount,
      required: true,
    }
  },
  computed: {
    ...mapGetters({
      user: 'auth/getAuthUser',
      supplierMealAddresses: 'supplier/getMealAddresses',
      myGameAccounts: 'myGameAccount/getMyGameAccounts',
    }),
    meal: {
      get(): Meal {
        return this.propMeal;
      },
      set(value: Meal) {
        MealsStore.updateMeal(value);
      },
    },
    buyable: function () {
      const gameAccountAddresses = this.gameAccount.address;
      return !this.supplierMealAddresses.every((supplierMealAddress: Address) => {
        return !supplierMealAddress.equals(gameAccountAddresses);
      });
    },
  },
  methods: {},
});
</script>
<style scoped lang="scss">
table {
  width: 100%;
}

th, td {
  border: 1px #808080 solid;
  min-width: 100px;
}
</style>