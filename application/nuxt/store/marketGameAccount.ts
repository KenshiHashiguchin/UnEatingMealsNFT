import {Action, Module, Mutation, VuexModule} from 'vuex-module-decorators'
import {GameAccount} from "~/models/GameAccount";
import {Meal} from "~/models/Meal";

@Module({
    name: 'marketGameAccount',
    stateFactory: true,
    namespaced: true,
})

export default class MarketGameAccountModule extends VuexModule {
    private marketGameAccounts: GameAccount[] = []

    public get getMarketGameAccounts(): GameAccount[] {
        return this.marketGameAccounts;
    }

    @Mutation
    private _setMarketGameAccount(marketGameAccounts: GameAccount[]) {
        this.marketGameAccounts = marketGameAccounts;
    }

    @Action
    public setMarketGameAccount(marketGameAccounts: GameAccount[]) {
        this._setMarketGameAccount(marketGameAccounts);
    }
}