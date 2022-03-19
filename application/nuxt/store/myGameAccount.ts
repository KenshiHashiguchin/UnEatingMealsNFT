import {Action, Module, Mutation, VuexModule} from 'vuex-module-decorators'
import {GameAccount} from "~/models/GameAccount";
import {Ability, Equipment, EquipmentMosaicId, Meal, Wearable} from "~/models/Meal";
import {Address, Metadata, MosaicId, NetworkType} from "symbol-sdk";
import {NFTServiceInterface} from "~/services/NFTService";
import {MealService} from "~/services/MealService";
import {YamlUtils} from "~/services/storage";

@Module({
    name: 'myGameAccount',
    stateFactory: true,
    namespaced: true,
})

export default class MyGameAccountModule extends VuexModule {
    private myGameAccounts: GameAccount[] = []

    public get getMyGameAccounts(): GameAccount[] {
        return this.myGameAccounts;
    }

    @Mutation
    private setMyGameAccount(myGameAccounts: GameAccount[]) {
        this.myGameAccounts = myGameAccounts;
    }

    @Action
    async set(payload: {userAddress: string, nftService: NFTServiceInterface, servicePublicKey: string, networkType: NetworkType}) {
        console.log('set');
        const myAddress = Address.createFromRawAddress(payload.userAddress);
        const accounts = await payload.nftService.getGameMultiSigAccount(myAddress);
        let gameAccounts: GameAccount[] = [];
        if (accounts) {
            const accountMeals: {address: Address, meal:Meal}[] = (await Promise.all(accounts.map(async (account: { metadata: Metadata, address: Address }) => {
                const mosaicId = new MosaicId(account.metadata.metadataEntry.value);
                const agg = await payload.nftService.getAggregateTransactionByMosaicId(mosaicId);
                if (agg) {
                    const meal: Meal = {
                        mosaicId: mosaicId,
                        aggregateTransaction: agg,
                        metadata: {
                            type: 'meals',
                        }
                    }
                    const mealServices = new MealService(meal, payload.nftService.getTransactionRepository(), payload.servicePublicKey, payload.networkType)
                    meal.svg = await mealServices.getSVGStruct();

                    // ability取得
                    await mealServices.getAbility().then(async (res: Ability | null) => {
                        if (res && meal.metadata) {
                            meal.metadata.ability = res;
                        }
                    });
                    return {address: account.address, meal: meal};
                }
                return null;
            }))).filter(async (meal) => {
                if(meal === null){
                    return false;
                }

                // 所有チェック
                const holdMosaicIds = await payload.nftService.getHoldMosaicIds(meal.address);
                return !holdMosaicIds.every((mosaicId: MosaicId) => {
                    //持ってないことをtrue
                    return !mosaicId.equals(meal.meal.mosaicId);
                });
            }) as {address: Address, meal:Meal}[];

            if (accountMeals.length !== 0) {
                // 装備情報メタデータ取得
                gameAccounts = await Promise.all(accountMeals.map(async (accountMeal: {address: Address, meal: Meal}) => {
                    let tmp = { address: accountMeal.address, meal: accountMeal.meal}
                    const equipMetadata = await payload.nftService.getAccountMetadataByAddress('equipments', accountMeal.address, myAddress);
                    try {
                        if (equipMetadata?.metadataEntry.value) {
                            const eq = YamlUtils.fromYaml(equipMetadata?.metadataEntry.value) as
                                    {left_hand: string|null, right_hand: string|null, head: string|null, shoes: string|null, glasses: string|null};
                            // 実際に所有しているmosaicのみ抽出
                            const eqMosaicIds: EquipmentMosaicId = await payload.nftService.filterEquipmentMosaicIds(accountMeal.address, eq);
                            const equipment: Equipment = {};
                            const mealServices = new MealService(accountMeal.meal, payload.nftService.getTransactionRepository(), payload.servicePublicKey, payload.networkType);
                            if(eqMosaicIds.left_hand?.id) {
                                equipment.left_hand = await mealServices.getWearables(eqMosaicIds.left_hand, payload.nftService);
                            }
                            if(eqMosaicIds.right_hand?.id) {
                                equipment.right_hand = await mealServices.getWearables(eqMosaicIds.right_hand, payload.nftService);
                            }
                            if(eqMosaicIds.head?.id) {
                                equipment.head = await mealServices.getWearables(eqMosaicIds.head, payload.nftService);
                            }
                            if(eqMosaicIds.shoes?.id) {
                                equipment.shoes = await mealServices.getWearables(eqMosaicIds.shoes, payload.nftService);
                            }
                            if(eqMosaicIds.glasses?.id) {
                                equipment.glasses = await mealServices.getWearables(eqMosaicIds.glasses, payload.nftService);
                            }
                            if(tmp.meal.metadata) {
                                tmp.meal.metadata.equipment = equipment
                            }
                        }
                    } catch (e) {
                        console.log(e);
                    }
                    console.log('gameAccount');
                    console.log(tmp);
                    return tmp
                }));

                this.setMyGameAccount(gameAccounts);
            }
        }
    }
}