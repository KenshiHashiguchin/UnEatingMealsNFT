<template>
  <b-card no-body class="overflow-hidden" style="background-color: white;">
    <b-card-body>
      <b-row no-gutters>
        <b-col md="6">
          <template v-if="this.gameAccount.meal.svg">
            <MealSvg :meal="this.gameAccount.meal"/>
            <b-button pill @click="$emit('decisionAccount', gameAccount)">このMealsで遊ぶ</b-button>
          </template>
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
                <table>
                  <tr>
                    <td>スピード</td>
                    <td class="text-right">{{ speed }} / max500</td>
                  </tr>
                </table>
                <br>
              </b-col>
            </b-row>
          </b-card-text>
        </b-col>
      </b-row>
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
    speed: {
      get(): number {
        let speed = 350;
        // 350 + (100 - gameAccount.meal.metadata.ability.fat) * 1.5
        const account = this.gameAccount as GameAccount;
        let fat = 0;
        if (account.meal.metadata?.ability?.fat) {
          fat += account.meal.metadata.ability.fat;
        }
        // wearable
        if(account.meal.metadata?.equipment?.head?.metadata.ability?.fat) {
          fat += account.meal.metadata.equipment.head.metadata.ability.fat;
        }
        if(account.meal.metadata?.equipment?.left_hand?.metadata.ability?.fat) {
          fat += account.meal.metadata.equipment.left_hand.metadata.ability.fat;
        }
        if(account.meal.metadata?.equipment?.right_hand?.metadata.ability?.fat) {
          fat += account.meal.metadata.equipment.right_hand.metadata.ability.fat;
        }
        if(account.meal.metadata?.equipment?.glasses?.metadata.ability?.fat) {
          fat += account.meal.metadata.equipment.glasses.metadata.ability.fat;
        }
        if(account.meal.metadata?.equipment?.shoes?.metadata.ability?.fat) {
          fat += account.meal.metadata.equipment.shoes.metadata.ability.fat;
        }
        return speed + (100 - fat) * 1.5;

      },
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