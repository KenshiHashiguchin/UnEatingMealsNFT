import Phaser from "phaser";
import {Area, Direction} from "~/services/game/scenes/main_scene";


export class Arrows {
    public aboveAllowLeft:  Phaser.Physics.Arcade.Image| undefined;
    public aboveAllowDown: Phaser.Physics.Arcade.Image | undefined;
    public belowAllowLeft: Phaser.Physics.Arcade.Image | undefined;
    public belowAllowUp: Phaser.Physics.Arcade.Image | undefined;
    private scene: Phaser.Scene;
    private switchKey: Phaser.Input.Keyboard.Key;
    public direction: 'headUp' | 'headDown' = 'headDown';

    constructor(_scene: Phaser.Scene) {
        this.scene = _scene;
        this.switchKey = _scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    public create(): void {
        this.belowAllowLeft = this.scene.physics.add
            .sprite(this.scene.game.scale.width / 2, this.scene.game.scale.height - (this.scene.game.scale.height / 20) * 2, 'arrow_left')
            .setDisplaySize(this.scene.game.scale.width / 20, this.scene.game.scale.width / 20)
        ;
        this.belowAllowLeft.body.setSize(1, this.scene.game.scale.width / 20);
        this.belowAllowLeft.setDebug(false, false, 0);

        this.belowAllowUp = this.scene.physics.add
            .sprite(this.scene.game.scale.width / 2, this.scene.game.scale.height - (this.scene.game.scale.height / 20) * 2, 'arrow_up')
            .setDisplaySize(this.scene.game.scale.width / 20, this.scene.game.scale.width / 20)
        ;
        this.belowAllowUp.body.setSize(1, this.scene.game.scale.width / 20);
        this.belowAllowUp.setDebug(false, false, 0);

        this.aboveAllowLeft = this.scene.physics.add
            .sprite(this.scene.game.scale.width / 2, this.scene.game.scale.height - (this.scene.game.scale.height / 20) * 6, 'arrow_left')
            .setDisplaySize(this.scene.game.scale.width / 20, this.scene.game.scale.width / 20)
        ;
        this.aboveAllowLeft.body.setSize(1, this.scene.game.scale.width / 20);
        this.aboveAllowLeft.setDebug(false, false, 0);

        this.aboveAllowDown = this.scene.physics.add
            .sprite(this.scene.game.scale.width / 2, this.scene.game.scale.height - (this.scene.game.scale.height / 20) * 6, 'arrow_down')
            .setDisplaySize(this.scene.game.scale.width / 20, this.scene.game.scale.width / 20)
        ;
        this.aboveAllowDown.body.setSize(1, this.scene.game.scale.width / 20);
        this.aboveAllowDown.setDebug(false, false, 0);


        this.belowAllowLeft.setVisible(false);
        this.belowAllowUp.setVisible(false);
    }

    public update(): void {
        if (this.switchKey.isUp) {
            this.switchDirection('headUp');
        } else {
            this.switchDirection('headDown');
        }
    }

    public switchDirection(di: 'headUp' | 'headDown') {
        if (di === 'headUp') {
            this.direction = 'headDown';
            this.aboveAllowDown?.setVisible(true);
            this.aboveAllowLeft?.setVisible(false);
            this.belowAllowUp?.setVisible(false);
            this.belowAllowLeft?.setVisible(true);
        } else if (di === 'headDown') {
            this.direction = 'headUp';
            this.aboveAllowDown?.setVisible(false);
            this.aboveAllowLeft?.setVisible(true);
            this.belowAllowUp?.setVisible(true);
            this.belowAllowLeft?.setVisible(false);
        }
    }
}