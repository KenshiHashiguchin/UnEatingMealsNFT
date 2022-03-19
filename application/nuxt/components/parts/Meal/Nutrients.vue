<template>
  <table>
    <tr>
      <td colspan="2" class="text-center">栄養成分表示(100gあたり)</td>
    </tr>
    <tr>
      <td>エネルギー</td>
      <td class="text-right">{{ energy }}kcal</td>
    </tr>
    <tr>
      <td>たんぱく質</td>
      <td class="text-right">{{ ability.protein }}g</td>
    </tr>
    <tr>
      <td>脂質</td>
      <td class="text-right">{{ ability.fat }}g</td>
    </tr>
    <tr>
      <td>炭水化物</td>
      <td class="text-right">{{ ability.carb }}g</td>
    </tr>
    <tr>
      <td>ビタミン</td>
      <td class="text-right">{{ ability.vitamin }}g</td>
    </tr>
    <tr>
      <td>ミネラル</td>
      <td class="text-right">{{ ability.mineral }}g</td>
    </tr>
  </table>
</template>

<script lang="ts">
import Vue from "vue";
import {Ability, Equipment} from "~/models/Meal";

export default Vue.extend({
  props: {
    metadata: {
      type: Object as () => {type: string, ability?: Ability, equipment?: Equipment},
      required: true,
    },
  },
  computed: {
    energy() {
      const ab = this.ability as Ability;
      return (ab.fat as number * 9 + ab.carb * 4 + ab.protein * 4) * 100;
    },
    ability(): Ability {
      let abi = {
        protein: 0,
        fat: 0,
        carb: 0,
        vitamin: 0,
        mineral: 0,
      };

      if(this.metadata.ability?.protein){
        abi.protein += this.metadata.ability.protein;
      }
      if(this.metadata.ability?.fat){
        abi.fat += this.metadata.ability.fat;
      }
      if(this.metadata.ability?.carb){
        abi.carb += this.metadata.ability.carb;
      }
      if(this.metadata.ability?.vitamin){
        abi.vitamin += this.metadata.ability.vitamin;
      }
      if(this.metadata.ability?.mineral){
        abi.mineral += this.metadata.ability.mineral;
      }

      if (this.metadata.equipment) {
        if (this.metadata.equipment.glasses?.metadata.ability) {
          abi = this.wearableAbility(abi, this.metadata.equipment.glasses.metadata.ability);
        }
        if (this.metadata.equipment.head?.metadata.ability) {
          abi = this.wearableAbility(abi, this.metadata.equipment.head.metadata.ability);
        }
        if (this.metadata.equipment.right_hand?.metadata.ability) {
          abi = this.wearableAbility(abi, this.metadata.equipment.right_hand.metadata.ability);
        }
        if (this.metadata.equipment.left_hand?.metadata.ability) {
          abi = this.wearableAbility(abi, this.metadata.equipment.left_hand.metadata.ability);
        }
        if (this.metadata.equipment.shoes?.metadata.ability) {
          abi = this.wearableAbility(abi, this.metadata.equipment.shoes.metadata.ability);
        }
      }

      return abi;
    },
  },
  methods: {
    wearableAbility(ability: Ability, wearableAbility: Ability): Ability {
      if (wearableAbility.protein){
        ability.protein += wearableAbility.protein;
      }
      if (wearableAbility.fat){
        ability.fat += wearableAbility.fat;
      }
      if (wearableAbility.carb){
        ability.carb += wearableAbility.carb;
      }
      if (wearableAbility.vitamin){
        ability.vitamin += wearableAbility.vitamin;
      }
      if (wearableAbility.mineral){
        ability.mineral += wearableAbility.mineral;
      }
      return ability;
    },
  },
})
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