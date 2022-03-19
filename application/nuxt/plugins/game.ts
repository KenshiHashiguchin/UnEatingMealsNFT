import Vue from 'vue'
import {Game} from "~/services/game/index";
import Scenes from "~/services/game/scenes/scenes";
import {MosaicId} from "symbol-sdk";
import {NuxtAxiosInstance} from "@nuxtjs/axios";

declare module 'vue/types/vue' {
    interface Vue {
        $newGame(mosaicId: MosaicId, speed: number, axios: NuxtAxiosInstance): Phaser.Game;
    }
}
Vue.prototype.$newGame = (mosaicId: MosaicId, speed: number, axios: NuxtAxiosInstance) => {
    const config: Phaser.Types.Core.GameConfig = {
        //画面サイズ
        width: 1000, // 横幅
        height: 600,
        type: Phaser.AUTO,
        //ゲーム画面を描画するcanvasを書き出す先
        parent: 'game',
        physics: {
            default: 'arcade',
            arcade: {
                debug: false,
                gravity: { y: 0 }
            }
        },
        //ゲーム画面を伸縮して表示させるための設定
        scale: {
            mode: Phaser.Scale.NONE,
            autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
            parent: 'game',
        },
        //必要なシーンを読み込む
        scene: Scenes,

    };

    return new Game(config, mosaicId, speed, axios);
}
