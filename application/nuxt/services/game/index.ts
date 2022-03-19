import 'phaser';
import {MosaicId} from "symbol-sdk";
import {NuxtAxiosInstance} from "@nuxtjs/axios";

export class Game extends Phaser.Game {
    public mosaicId: MosaicId | undefined;
    public speed: number;
    public axios: NuxtAxiosInstance;
    constructor(config: Phaser.Types.Core.GameConfig, mosaicId: MosaicId, speed: number, axios: NuxtAxiosInstance) {
        super(config);
        this.mosaicId = mosaicId;
        this.speed = speed;
        this.axios = axios;
    }
}

