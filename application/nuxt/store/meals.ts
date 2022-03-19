import {Action, Module, Mutation, VuexModule} from 'vuex-module-decorators'
import {Meal, Svg} from "~/models/Meal";
import {MosaicId} from "symbol-sdk";
import Vue from "vue";

@Module({
    name: 'meals',
    stateFactory: true,
    namespaced: true,
})
export default class MealsModule extends VuexModule {
    private meals: Meal[] = []

    public get getMeals(): Meal[] {
        return this.meals
    }

    public get getMealByMosaicId() {
        return (mosaicId: MosaicId) => {
            return this.meals.find((meal: Meal) => {
                return meal.mosaicId.equals(mosaicId);
            });
        }
    }


    @Mutation
    private _setMeals(meals: Meal[]) {
        this.meals = meals
    }
    @Mutation
    private _pushMeal(meals: Meal) {
        this.meals.push(meals);
    }
    @Mutation
    private _updateMeal(meal: Meal) {
        this.meals.forEach((item: Meal, index) => {
           if(item.mosaicId.equals(meal.mosaicId)){
               Vue.set(this.meals, index, meal);
           }
        });
    }

    @Action
    public setMeals(value: Meal[]) {
        this._setMeals(value);
    }
    @Action
    public pushMeal(value: Meal) {
        this._pushMeal(value);
    }
    @Action
    public updateMeal(value: Meal) {
        this._updateMeal(value);
    }
}