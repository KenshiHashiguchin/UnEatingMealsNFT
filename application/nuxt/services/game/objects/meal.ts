import Phaser from "phaser";
import {Area, Direction} from "~/services/game/scenes/main_scene";
import {Arrows} from "~/services/game/objects/arrows";


export class Meal {
    public meal: Phaser.Physics.Arcade.Image | undefined;
    private scene: Phaser.Scene;
    public x: number;
    public y: number;
    private velocity: number;
    private mealArea: Area;
    private mealDirection: Direction = 'left';
    private acceleration: number;
    public arrowObject: Arrows;
    private key: string;

    private bigSquare = {
        leftSide: 0,
        rightSide: 0,
        upperSide: 0,
        lowerSide: 0,
    }

    private smallSquare = {
        leftSide: 0,
        rightSide: 0,
        upperSide: 0,
        lowerSide: 0,
    }

    constructor(_scene: Phaser.Scene, _x: number, _y: number, _area: Area, _acceleration: number, _arrowObject: Arrows, _velocity: number, _key: string) {
        this.scene = _scene;
        this.x = _x;
        this.y = _y;
        this.mealArea = _area;
        this.acceleration = _acceleration;
        this.arrowObject = _arrowObject;
        this.velocity = _velocity;
        this.key = _key;
    }

    public create(): void {
        this.bigSquare = {
            leftSide: (this.scene.game.scale.width / 20) * 3,
            rightSide: this.scene.game.scale.width - (this.scene.game.scale.width / 20) * 3,
            upperSide: (this.scene.game.scale.height / 20) * 2,
            lowerSide: this.scene.game.scale.height - (this.scene.game.scale.height / 20) * 2,
        }
        this.smallSquare = {
            leftSide: (this.scene.game.scale.width / 20) * 5,
            rightSide: this.scene.game.scale.width - (this.scene.game.scale.width / 20) * 5,
            upperSide: (this.scene.game.scale.height / 20) * 6,
            lowerSide: this.scene.game.scale.height - (this.scene.game.scale.height / 20) * 6,
        };


        this.meal = this.scene.physics.add
            .sprite(this.x, this.y, this.key)
            .setDisplaySize(this.scene.game.scale.width / 20, this.scene.game.scale.width / 20)
            .setVelocityX(this.velocity * -1).setVelocityY(0)
        ;
        this.meal.setDebug(false, false, 0);
        this.meal.body.setSize(this.scene.game.scale.width / 20, this.scene.game.scale.width / 20);

        // 矢印衝突で向き切り替え
        // if (this.arrowObject.direction === 'headUp') {
        // @ts-ignore
        this.scene.physics.add.overlap(this.meal, this.arrowObject.belowAllowUp,
            () => {
                if (this.arrowObject.direction === 'headUp') {
                    this.mealDirection = 'left';
                    this.mealArea = 'small';
                }
            },
            undefined, this.scene);
        // @ts-ignore
        this.scene.physics.add.overlap(this.meal, this.arrowObject.aboveAllowLeft,
            () => {
                if (this.arrowObject.direction === 'headUp') {
                    this.mealDirection = 'left';
                    this.mealArea = 'small';
                }
            },
            undefined, this.scene)
        // } else {
        // @ts-ignore
        this.scene.physics.add.overlap(this.meal, this.arrowObject.belowAllowLeft,
            () => {
                if (this.arrowObject.direction === 'headDown') {
                    this.mealDirection = 'left';
                    this.mealArea = 'big';
                }
            },
            undefined, this.scene);
        // @ts-ignore
        this.scene.physics.add.overlap(this.meal, this.arrowObject.aboveAllowDown,
            () => {
                if (this.arrowObject.direction === 'headDown') {
                    this.mealDirection = 'left';
                    this.mealArea = 'big';
                }
            },
            undefined, this.scene)
        // }

    }

    public update(): void {
        if (!this.meal || !this.arrowObject.aboveAllowLeft || !this.arrowObject.aboveAllowDown || !this.arrowObject.belowAllowUp || !this.arrowObject.belowAllowLeft) {
            return;
        }

        // FPSによるズレも修正する
        if (this.mealArea === 'big') {
            if (this.mealDirection === 'left' && this.meal.x <= this.bigSquare.leftSide) {
                this.setDirection('upper');
            } else if (this.mealDirection === 'right' && this.meal.x >= this.bigSquare.rightSide) {
                this.setDirection('lower');
            } else if (this.mealDirection === 'lower' && this.meal.y >= this.bigSquare.lowerSide) {
                this.setDirection('left');
            } else if (this.mealDirection === 'upper' && this.meal.y <= this.bigSquare.upperSide) {
                this.setDirection('right');
            }
        } else if (this.mealArea === 'small') {
            if (this.mealDirection === 'left' && this.meal.x <= this.smallSquare.leftSide) {
                this.setDirection('upper');
            } else if (this.mealDirection === 'right' && this.meal.x >= this.smallSquare.rightSide) {
                this.setDirection('lower');
            } else if (this.mealDirection === 'lower' && this.meal.y >= this.smallSquare.lowerSide) {
                this.setDirection('left');
            } else if (this.mealDirection === 'upper' && this.meal.y <= this.smallSquare.upperSide) {
                this.setDirection('right');
            }
        }
        if (this.mealDirection === 'left') {
            this.meal.setVelocityX((this.velocity) * -1);
            this.meal.setVelocityY(0);
            if (this.mealArea === 'big') {
                this.meal.setPosition(this.meal.x, this.bigSquare.lowerSide);
            } else {
                this.meal.setPosition(this.meal.x, this.smallSquare.lowerSide);
            }
        } else if (this.mealDirection === 'right') {
            this.meal.setVelocityX(this.velocity);
            this.meal.setVelocityY(0);
            if (this.mealArea === 'big') {
                this.meal.setPosition(this.meal.x, this.bigSquare.upperSide);
            } else {
                this.meal.setPosition(this.meal.x, this.smallSquare.upperSide);
            }
        } else if (this.mealDirection === 'upper') {
            this.meal.setVelocityY((this.velocity) * -1);
            this.meal.setVelocityX(0);
            if (this.mealArea === 'big') {
                this.meal.setPosition(this.bigSquare.leftSide, this.meal.y);
            } else {
                this.meal.setPosition(this.smallSquare.leftSide, this.meal.y);
            }
        } else if (this.mealDirection === 'lower') {
            this.meal.setVelocityY(this.velocity);
            this.meal.setVelocityX(0);
            if (this.mealArea === 'big') {
                this.meal.setPosition(this.bigSquare.rightSide, this.meal.y);
            } else {
                this.meal.setPosition(this.smallSquare.rightSide, this.meal.y);
            }
        }

        this.velocity += this.acceleration;
    }


    public setDirection(direction: Direction): void {
        this.mealDirection = direction;
    }
}