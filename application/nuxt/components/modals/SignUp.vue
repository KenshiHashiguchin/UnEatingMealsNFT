<template>
  <b-modal v-model="modal" centered hide-header hide-footer>
    <h5 class="text-center my-5">新規登録</h5>
    <div class="row">
      <div class="col-md-12 px-md-5 pb-5">
        <a class="btn btn-block btn-social btn-google" @click="authenticate('google')">
          <span><b-icon icon="google" scale="0.6"></b-icon></span> Googleでログイン
        </a>
      </div>
    </div>
  </b-modal>
</template>

<script lang="ts">
import Vue from "vue";
import snsAuthenticate from '~/mixins/snsAuthenticate'

export type DataType = {
  showModal: boolean;
}

export default Vue.extend({
  mixins: [snsAuthenticate],
  data() {
    return {
      modal: false,
    }
  },
  methods: {
    open() {
      this.modal = true;
    },
    close() {
      this.modal = false;
    }
  },
})
</script>

<style lang="scss">
</style>