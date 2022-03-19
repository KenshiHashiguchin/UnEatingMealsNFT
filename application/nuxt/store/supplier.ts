import {Action, Module, Mutation, VuexModule} from 'vuex-module-decorators'
import {Address, Mosaic, MosaicId} from "symbol-sdk";

@Module({
    name: 'supplier',
    stateFactory: true,
    namespaced: true,
})
export default class SupplierModule extends VuexModule {
    private mosaicIds: MosaicId[] = [];
    private mealAddress: Address[] = [];

    public get mosaics(): MosaicId[] {
        return this.mosaicIds;
    }

    public get getMealAddresses(): Address[] {
        return this.mealAddress;
    }

    @Mutation
    private _setMosaicIds(mosaicIds: MosaicId[]) {
        this.mosaicIds = mosaicIds;
    }

    @Mutation
    private _setMealAddress(address: Address[]) {
        this.mealAddress = address;
    }

    @Action
    public setMosaicIds(mosaicIds: MosaicId[]) {
        this._setMosaicIds(mosaicIds);
    }

    @Action
    public setMealAccounts(address: Address[]) {
        this._setMealAddress(address);
    }
}