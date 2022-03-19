import Phaser from "phaser";
export default class LoadingScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'Loading',
        });
    }
    /**アセットを読み込むライフサイクルで呼ばれるメソッド*/
    preload(): void {
        //ロード中の文面を設定する
        const loadingText = (progress: number): string =>
            `Now Loading ... ${Math.round(progress * 100)}%`;

        //テキストオブジェクトを作る
        const currentLoadingText = this.add.text(10, 10, loadingText(0));
        // @ts-ignore
        this.load.svg('meal_front', `/get/meal?meal_id=${this.game.mosaicId.toHex()}&direction=front`);
        // @ts-ignore
        this.load.svg('meal_left', `/get/meal?meal_id=${this.game.mosaicId.toHex()}&direction=left`);
        // @ts-ignore
        this.load.svg('meal_right', `/get/meal?meal_id=${this.game.mosaicId.toHex()}&direction=right`);
        // @ts-ignore
        this.load.svg('meal_back', `/get/meal?meal_id=${this.game.mosaicId.toHex()}&direction=back`);
        // @ts-ignore
        this.load.svg('enemy', `/get/meal?meal_id=578EF81B71B9AB8F`);

        // 音源
        this.load.audio('outgame_music', `game/assets/ingame_music1.mp3`)
        this.load.audio('ingame_music', `game/assets/ingame_music2.mp3`)

        // 矢印
        this.load.image('arrow_left', 'game/assets/arrow.png');
        this.load.image('arrow_up', 'game/assets/arrow_up.png');
        this.load.image('arrow_down', 'game/assets/arrow_down.png');


        //ファイルのロードをしていく
        this.load.image('ingame_background', 'game/assets/ingame_background.jpg');
        //ロードに進捗があるたびに発生するイベント
        this.load.on('progress', (progress: number) => {
            //テキストの内容を書き換える
            currentLoadingText.text = loadingText(progress);
        });
        //ロードが完了すると発生するイベント
        this.load.on('complete', () => {
            //タイトルシーンへ遷移
            this.scene.start('Main');
        });
    }
}