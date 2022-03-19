<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-light" style="background-color: #e3f2fd;">
      <a class="navbar-bran ml-5">MiniGame</a>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item active">
            <nuxt-link class="nav-link ml-5" to="/minigame">ゲームで遊ぶ</nuxt-link>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/minigame/ranking" target="_blank">ランキングを見る</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" :href="marketUrl" target="_blank">Mealsを取得する</a>
          </li>
        </ul>
      </div>
    </nav>
    <div class="container-fluid mt-5" style="max-width: 1000px;">
      <div class="content">
        <nuxt/>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  data() {
    return {
      marketUrl: "",
    }
  },
  created() {
    this.marketUrl = this.$config.baseBrowserURL + '/market';
  }
})
</script>

<style scoped>

</style>