<template>
  <b-table
      :striped="true"
      :hover="true"
      :items="items"
      :fields="fields"
      :head-variant="'dark'"
  ></b-table>
</template>

<script lang="ts">
import Vue from "vue";

// type DataType = {
//   fields: ['No', 'MosaicId', 'Score'],
//   items: [],
// }

export default Vue.extend({
  layout: "game",
  data() {
    return {
      fields: ['No', 'MosaicId', 'Score'],
      items: [],
    }
  },
  async created() {
    if(process.client) {
      const {score} = await this.$axios.$get('/api/game_ranking')
      let no = 1;
      score.forEach((item: {id: number, score: number, mosaic_id: string}) => {
        console.log(item);
        this.items.push(
            //@ts-ignore
            {No: no++, MosaicId: item.mosaic_id, Score: item.score}
        );
      })
    }
  },
})
</script>

<style scoped>

</style>