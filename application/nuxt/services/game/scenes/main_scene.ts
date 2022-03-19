import Phaser from "phaser";
import {Meal} from "~/services/game/objects/meal";
import {Arrows} from "~/services/game/objects/arrows";
export type Direction = 'right' | 'left' | 'upper' | 'lower';
export type Area = 'small' | 'big';


export default class MainScene extends Phaser.Scene {
    private mealObject: Meal | undefined;
    private enemyObject: Meal | undefined;
    private arrowObject: Arrows | undefined;
    private gameOver: boolean = false;

    // score
    private score = 0;
    private scoreText?: Phaser.GameObjects.Text;

    constructor() {
        super({
            key: 'Main',
            physics: {arcade: {debug: true}},
        });
    }

    create(): void {
        this.physics.world.setFPS(1000);

        this.add.image(this.game.scale.width, this.game.scale.height, "ingame_background");

        const ingameMusic = this.sound.add('ingame_music');
        ingameMusic.play({volume: 0.1, loop: true});

        this.scoreText = this.add.text(this.game.scale.width / 2, this.game.scale.height / 2, 'Score: 0', { font: "24px", align: "center" });
        this.scoreText.setAlign("center");

        // @ts-ignore
        const speed = this.game.speed;
        this.arrowObject = new Arrows(this);
        this.mealObject = new Meal(this, this.game.scale.width / 20 * 3, this.game.scale.height - (this.game.scale.height / 20) * 2, 'big', 0, this.arrowObject, speed, 'meal_left');
        this.enemyObject = new Meal(this, this.game.scale.width - (this.game.scale.width / 20) * 3, this.game.scale.height / 20 * 2, 'big', 0.2, this.arrowObject, 350, 'enemy');
        this.arrowObject.create();
        this.mealObject.create();
        this.enemyObject.create();

        let timer = this.time.addEvent({
            delay: 10,
            loop: true
        });
        timer.callback = () => {
            if (!this.gameOver) {
                this.addScore();
            }
        }

        // meal同志の衝突でゲーム終了
        // @ts-ignore
        this.physics.add.overlap(this.mealObject.meal, this.enemyObject.meal, () => {
            this.gameOver = true;
            if (this.scoreText) {
                this.scoreText.text = `GameOver Score: ${this.score}`;
            }

            this.mealObject?.meal?.destroy();
            this.enemyObject?.meal?.destroy();
            // @ts-ignore
            this.game.axios.post(`/api/game_result`, {
                // @ts-ignore
                mosaic_id: this.game.mosaicId.toHex(),
                score: this.score,
            });

        }, undefined, this);
    }

    update(): void {
        if(this.gameOver){
            return;
        }
        if (
            !this.mealObject ||
            !this.enemyObject ||
            !this.arrowObject) {
            return;
        }
        this.arrowObject.update();
        this.mealObject.update();
        this.enemyObject.update();
    }


    addScore() {
        this.score += 1;
        if(this.scoreText) {
            this.scoreText.text = `Score: ${this.score}`;
        }
    }
}