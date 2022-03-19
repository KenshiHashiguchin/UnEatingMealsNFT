<template>
  <div>
    <p @click="back">もどる</p>
    <h1 class="text-center">鬼ごっこ</h1>
    <p class="text-center">スペースで矢印切り替え</p>
    <div id="game"></div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import {Meal} from "~/models/Meal";
export type DataType = {
  game: Phaser.Game | undefined;
}
export default Vue.extend({
  props: {
    meal: {
      type: Object as () => Meal,
      required: true,
    }
  },
  data(): DataType {
    return {
      game: undefined,
    }
  },
  created() {
    if (process.client) {
      let speed = 350;
      if(this.meal.metadata && this.meal.metadata.ability) {
        speed += (100 - this.meal.metadata.ability.fat) * 1.5;
      }
      this.game = this.$newGame(this.meal.mosaicId, speed, this.$axios);
    }
  },
  methods: {
    back() {
      this.game?.destroy(true);
      this.$emit('back');
    }
  },
})
</script>
<style scoped>
#game {
  margin-bottom: 30px;
  max-width: 900px;
}
</style>