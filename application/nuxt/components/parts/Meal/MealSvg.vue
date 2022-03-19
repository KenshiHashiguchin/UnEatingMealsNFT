<template>
  <div>
    <template v-if="this.svg">
      <span v-html="this.svg" style="width: 100%"></span>
    </template>
    <template v-else>
      <b-card-img src="https://picsum.photos/400/400/?image=20" alt="Image" class="rounded-0"></b-card-img>
    </template>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import {Meal} from "~/models/Meal";
import {MealService} from "~/services/MealService";

type DataType = {
  svg: string | null,
}
export default Vue.extend({
  props: {
    meal: {
      type: Object as () => Meal,
    }
  },
  data(): DataType {
    return {
      svg: null,
    }
  },
  async created() {
    const mealService = new MealService(this.meal, this.$service.nftService.getRepositoryFactoryHttp(), this.$config.servicePublicKey, this.$config.networkType);
    this.svg = await mealService.getSVG({wearable: true, background: true});
  },
})
</script>

<style scoped>

</style>