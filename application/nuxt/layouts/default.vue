<template>
  <div class="container-fluid">
    <!--  <div class="container">-->
    <Navbar/>
    <div class="content mt-md-5">
      <nuxt/>
    </div>
    <!--  </div>-->
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({})
</script>

<style scoped>
.container-fluid {
  max-width: 900px;
}
</style>