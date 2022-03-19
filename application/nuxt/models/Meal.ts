import {AggregateTransaction, MosaicId} from "symbol-sdk";


export type Ability = {
    fat: number,
    carb: number,
    protein: number,
    vitamin: number,
    mineral: number,
}

export type EquipmentMosaicId = {
    left_hand?: MosaicId,
    right_hand?: MosaicId,
    head?: MosaicId,
    shoes?: MosaicId,
    glasses?: MosaicId,
}

export type Equipment = {
    left_hand?: Wearable,
    right_hand?: Wearable,
    head?: Wearable,
    shoes?: Wearable,
    glasses?: Wearable,
}

export type SvgHeader = {
    viewBox: string;
    xmlns: string;
}

export type Svg = {
    header: SvgHeader;
    body: string[],
    style?: string[],
    script?: string[],
}

export type Meal = {
    mosaicId: MosaicId,
    aggregateTransaction: AggregateTransaction,
    metadata?: { // TODO ? del optional
        type: 'meals',
        ability?: Ability,
        equipment?: Equipment,
    },
    // background?: MosaicId, // TODO
    svg?: Svg,
}

export type MealDisplay = {
    background: boolean,
    wearable: boolean,
}

export type Wearable = {
    mosaicId: MosaicId,
    aggregateTransaction: AggregateTransaction,
    metadata: {
        type: 'wearable',
        ability?: Ability,
    },
    svg?: Svg,
}
