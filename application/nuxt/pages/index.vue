<template>
  <div>
    <!--  TODO image max-width min-width  -->
    <b-card class="border-0 mb-5" img-src="/mv.png" img-alt="Card image" img-right img-width="400">
      <b-card-title>”Uneatingmeals”</b-card-title>
      <b-card-body>
        <b-card-text>
          20XX年、仮想世界に移住した人々。<br>
          衣服や建造物、現実世界を構築していた様々なものが仮想世界にも生み出され、繁栄を築いていた。<br>
          そんな中、仮想世界の発展を快く思わないものたちがいた。<br>
          現実世界では娯楽の象徴だったが、仮想世界で人々に見向きもされなくなった存在”食べ物”たちだ。<br>
          存在意義を失った”食べ物”たちは自我を持ち、”Uneatingmeals”となって仮想世界で暴れ出す！<br>
        </b-card-text>
        <b-button href="#" variant="dark" @click="$refs.signInModal.open()">新規登録してゲームを始める</b-button>
      </b-card-body>
    </b-card>
    <b-card class="border-0 mb-5" img-src="/market_mv.png" img-alt="Card image" img-left img-width="400">
      <b-card-title>SuperMarket</b-card-title>
      <b-card-body>
        <b-card-text>
          お気に入りのMealsを探してみよう！<br><br>
          MealsはSymbolブロックチェーンのフルオンチェーンNFTです。<br>
          ※現在はテストネット版です。<br>
        </b-card-text>
        <b-button to="/market" variant="dark">Mealsをのぞく</b-button>
      </b-card-body>
    </b-card>
    <b-card class="border-0 mb-5" img-src="/mv_game.png" img-alt="Card image" img-right img-width="400">
      <b-card-title>Game</b-card-title>
      <b-card-body>
        <b-card-text>
          自分のMealsを使用してゲームをしよう！<br><br>
          Mealsの能力によってゲームの有利不利が決まります。<br>
        </b-card-text>
        <b-button to="/minigame" variant="dark">ゲームをする</b-button>
      </b-card-body>
    </b-card>
    <SignIn ref="signInModal"/>
    <LoginCallback/>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import SignIn from "~/components/modals/SignIn.vue";
import LoginCallback from "~/components/login/Callback.vue";

export default Vue.extend({
  components: {SignIn, LoginCallback},
  created() {
    const action = this.$route.query.action || '';
    if (action === 'logout') {
      (this as any).$bvToast.toast("ログアウトしました。", {
        autoHideDelay: 5000,
        appendToast: false,
        variant: "info",
      })
    }
  }
})
</script>
