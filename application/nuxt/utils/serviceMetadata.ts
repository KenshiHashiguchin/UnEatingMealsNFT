import {Convert, KeyGenerator, UInt64} from "symbol-sdk";

export type ServiceMetadataKey = 'meals' | 'wearables' | 'background';

export function isServiceMetadataKey (metadataKey: UInt64, value: string, type = null):boolean {
    if (Convert.isHexString(value)) {
        value = Buffer.from(value, 'hex').toString('utf-8');
    }

    // メタデータキーがtypeでなければfalse
    if(metadataKey.toHex() != KeyGenerator.generateUInt64Key('type').toHex()) {
        return false;
    }

    if (type === null) {
        return value === 'meals' || value === 'wearables' || value === 'background';
    }
    return value === type;
}