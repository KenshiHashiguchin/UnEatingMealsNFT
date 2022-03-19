import {Action, Module, Mutation, VuexModule} from 'vuex-module-decorators'
import {Meal, Wearable} from "~/models/Meal";
import Vue from "vue";

@Module({
    name: 'myitem',
    stateFactory: true,
    namespaced: true,
})

export default class MyItemModule extends VuexModule {
    private meals: Meal[] = []
    private wearables: Wearable[] = []

    public get getMeals(): Meal[] {
        return this.meals;
    }

    public get myWearables(): Wearable[] {
        return this.wearables;
    }

    @Mutation
    private _updateMeal(meal: Meal) {
        let _this = this;
        this.meals.forEach((item: Meal, index) => {
            if (item.mosaicId.equals(meal.mosaicId)) {
                Vue.set(_this.meals, index, meal);
            }
        });
    }

    @Mutation
    private _setMeals(meals: Meal[]) {
        this.meals = meals;
    }

    @Action
    public setMeals(meals: Meal[]) {
        this._setMeals(meals);
    }

    @Action
    public updateMeal(value: Meal) {
        this._updateMeal(value);
    }
}