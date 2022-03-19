import {Address} from "symbol-sdk";
import {Equipment, Meal} from "~/models/Meal";

export type GameAccount = {
    address: Address,

    meal: Meal,
    meal_name?: string,
    equipment?: Equipment,
}