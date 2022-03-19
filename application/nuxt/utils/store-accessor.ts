import {Store} from 'vuex';
import {getModule} from 'vuex-module-decorators';
import MealsModule from '~/store/meals';
import AuthModule from "~/store/auth";
import MyItemModule from "~/store/myitem";
import SupplierModule from "~/store/supplier";
import MyGameAccountModule from "~/store/myGameAccount";
import MarketGameAccountModule from "~/store/marketGameAccount";

let MealsStore: MealsModule;
let AuthStore: AuthModule;
let SupplierStore: SupplierModule;
let MyItemStore: MyItemModule;
let MyGameAccountStore: MyGameAccountModule;
let MarketGameAccountStore: MarketGameAccountModule;

function initialiseStores(store: Store<any>): void {
    MealsStore = getModule(MealsModule, store);
    AuthStore = getModule(AuthModule, store);
    MyItemStore = getModule(MyItemModule, store);
    SupplierStore = getModule(SupplierModule, store);
    MyGameAccountStore = getModule(MyGameAccountModule, store);
    MarketGameAccountStore = getModule(MarketGameAccountModule, store);
}

export {initialiseStores, MealsStore, AuthStore, SupplierStore, MyItemStore, MyGameAccountStore, MarketGameAccountStore}