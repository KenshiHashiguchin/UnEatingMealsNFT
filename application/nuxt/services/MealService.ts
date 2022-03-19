import {
    Address,
    AggregateTransaction,
    Convert,
    InnerTransaction,
    KeyGenerator,
    Metadata,
    MetadataType,
    MosaicId,
    NetworkType,
    RepositoryFactory,
    Transaction,
    TransactionGroup,
    TransferTransaction
} from "symbol-sdk";
import {Ability, Equipment, Meal, MealDisplay, Svg, SvgHeader, Wearable} from "../models/Meal";
import {YamlUtils} from "../services/storage";
import {NFTServiceInterface} from "~/services/NFTService";

export interface MealServiceInterface {
    getAbility(): Promise<Ability | null>

    getSVGStruct(): Promise<Svg | undefined>

    getSVG(display: MealDisplay): Promise<string | null>

    // createMealsByMosaicIds(): Promise<Meal[]>
}

export class MealService implements MealServiceInterface {
    public meal: Meal;
    private networkType: NetworkType;
    private repositoryFactory: RepositoryFactory;
    private servicePubKey: string;
    private serviceAccount: Address;

    constructor(private readonly _meal: Meal, private _repositoryFactory: RepositoryFactory, private readonly _servicePublicKey: string, private readonly _networkType: NetworkType) {
        this.meal = _meal;
        this.networkType = _networkType;
        this.repositoryFactory = _repositoryFactory;
        this.servicePubKey = _servicePublicKey;
        this.serviceAccount = Address.createFromPublicKey(_servicePublicKey, _networkType);
    }

    // メタデータからability取得
    public async getAbility(): Promise<Ability | null> {
        if (this.meal.metadata?.ability) {
            return this.meal.metadata.ability;
        }

        //セットされていない場合は取得
        const searchCriteria = {
            targetId: this.meal.mosaicId,
            metadataType: MetadataType.Mosaic,
        };

        const metadataHttp = this.repositoryFactory.createMetadataRepository();
        const metadataResult = await metadataHttp.search(searchCriteria).toPromise();

        const abilityMetadata: Metadata | undefined = metadataResult.data.find((meta: Metadata) => {
            if (meta.metadataEntry.targetId instanceof MosaicId) {
                return meta.metadataEntry.scopedMetadataKey.toHex() === KeyGenerator.generateUInt64Key('ability').toHex();
            } else {
                return false;
            }
        });
        if (!abilityMetadata) {
            return null;
        }

        let ability = abilityMetadata.metadataEntry.value;
        if (Convert.isHexString(abilityMetadata.metadataEntry.value)) {
            let ability = Buffer.from(abilityMetadata.metadataEntry.value, 'hex').toString('utf-8');
        }

        const abilityResult = YamlUtils.fromYaml(ability) as Ability;
        if (abilityResult) {
            return abilityResult;
        }
        return null;
    }

    /**
     * SVG取得
     * aggTxの１つ目にSVGヘッダーを定義
     * aggTxの２つ目の転送トランザクションがsvgの構造を定義
     */
    public async getSVGStruct(): Promise<Svg | undefined> {
        if (this.meal.svg) {
            return this.meal.svg;
        }
        const headerTx = this.meal.aggregateTransaction.innerTransactions[0] as TransferTransaction;

        type Header = {
            header: SvgHeader
        };
        const header = YamlUtils.fromYaml(headerTx.message.payload) as Header;
        if (!header.header.viewBox || !header.header.xmlns) {
            return undefined;
        }
        const svgHeader: SvgHeader = {viewBox: header.header.viewBox, xmlns: header.header.xmlns};

        const contentStructTx = this.meal.aggregateTransaction.innerTransactions[1] as TransferTransaction;
        const contentStructUintArray = Uint8Array.from(Buffer.from(contentStructTx.message.payload, "hex"));

        type Content = {
            body: string[],
            style: string[],
            script: string[],
        }
        const contentStruct = YamlUtils.fromYaml(new TextDecoder().decode(contentStructUintArray)) as Content;
        if (!contentStruct.body || !contentStruct.style || !contentStruct.script) {
            return undefined;
        }
        return {
            header: svgHeader,
            body: contentStruct.body,
            style: contentStruct.style,
            script: contentStruct.script,
        }
    }

    /**
     * SVG取得
     *
     * @param display
     */
    public async getSVG(display: MealDisplay): Promise<string | null> {
        if (!this.meal?.svg) {
            return null;
        }

        // meals本体取得
        let body: string = "";
        if (this.meal.svg.body.length === 0) {
            return null;
        }
        body = await this.getSvgContentByTransactionIds(this.meal.svg.body);
        let style: string = "";
        if (this.meal.svg.style && this.meal.svg.style.length > 0) {
            style = await this.getSvgContentByTransactionIds(this.meal.svg.style);
        }
        let script: string = "";
        if (this.meal.svg.script && this.meal.svg.script.length > 0) {
            style = await this.getSvgContentByTransactionIds(this.meal.svg.script);
        }

        // wearable表示
        if(display.wearable && this.meal.metadata?.equipment) {
            const wearable = await this.getSVGWearable(this.meal.metadata.equipment);
            body += wearable.body;
            style += wearable.style;
        }

        if(!display.background) {
            style += `<style>.background{display: none} .background_color{display: none}</style>`;
        }
        return `<svg xmlns="${this.meal.svg.header.xmlns}" viewBox="${this.meal.svg.header.viewBox}">${body}${style}</svg>`;
    }

    private async getSVGWearable(eq: Equipment): Promise<{body: string, style: string}> {
        let body = "";
        let style = "";
        if (eq.head && eq.head.svg?.body && eq.head.svg.body.length > 0){
            body += await this.getSvgContentByTransactionIds(eq.head.svg.body)
        }
        if (eq.head && eq.head.svg?.style && eq.head.svg.style.length > 0){
            style += await this.getSvgContentByTransactionIds(eq.head.svg.style)
        }
        if (eq.shoes && eq.shoes.svg?.body && eq.shoes.svg.body.length > 0){
            body += await this.getSvgContentByTransactionIds(eq.shoes.svg.body)
        }
        if (eq.shoes && eq.shoes.svg?.style && eq.shoes.svg.style.length > 0){
            style += await this.getSvgContentByTransactionIds(eq.shoes.svg.style)
        }
        if (eq.glasses && eq.glasses.svg?.body && eq.glasses.svg.body.length > 0){
            body += await this.getSvgContentByTransactionIds(eq.glasses.svg.body)
        }
        if (eq.glasses && eq.glasses.svg?.style && eq.glasses.svg.style.length > 0){
            style += await this.getSvgContentByTransactionIds(eq.glasses.svg.style)
        }
        if (eq.left_hand && eq.left_hand.svg?.body && eq.left_hand.svg.body.length > 0){
            body += await this.getSvgContentByTransactionIds(eq.left_hand.svg.body)
        }
        if (eq.left_hand && eq.left_hand.svg?.style && eq.left_hand.svg.style.length > 0){
            style += await this.getSvgContentByTransactionIds(eq.left_hand.svg.style)
        }
        if (eq.right_hand && eq.right_hand.svg?.body && eq.right_hand.svg.body.length > 0){
            body += await this.getSvgContentByTransactionIds(eq.right_hand.svg.body)
        }
        if (eq.right_hand && eq.right_hand.svg?.style && eq.right_hand.svg.style.length > 0){
            style += await this.getSvgContentByTransactionIds(eq.right_hand.svg.style)
        }
        return {body: body, style: style};
    }

    private async getSvgContentByTransactionIds(transactionIds: string[]): Promise<string> {
        let result: string = "";
        const transactionRepo = this.repositoryFactory.createTransactionRepository();
        const txs = await transactionRepo.getTransactionsById(transactionIds, TransactionGroup.Confirmed).toPromise();

        transactionIds.forEach((txId: string) => {
            const txInners = txs.find((tx: Transaction) => {
                if (tx instanceof AggregateTransaction) {
                    return txId == tx.transactionInfo?.hash
                }
            }) as AggregateTransaction;

            if (txInners) {
                txInners.innerTransactions.forEach((innerTx: InnerTransaction) => {
                    if (innerTx instanceof TransferTransaction) {
                        result += new TextDecoder().decode(Uint8Array.from(Buffer.from(innerTx.message.payload, "hex")));
                    }
                })
            }
        })

        return result;
    }

    public async getWearables(wearableMosaicId: MosaicId, nftService: NFTServiceInterface): Promise<Wearable|undefined> {
        const eqAgg = await nftService.getAggregateTransactionByMosaicId(wearableMosaicId);
        if (eqAgg) {
            const wearable: Wearable = {
                mosaicId: wearableMosaicId,
                aggregateTransaction: eqAgg,
                metadata: {
                    type: 'wearable',
                }
            }
            const ability = await this.getWearableAbility(wearable);
            if(ability) {
                wearable.metadata.ability = ability;
            }

            const svgStruct = await this.getWearableSVGStruct(wearable);
            if (svgStruct) {
                wearable.svg = svgStruct;
            }

            return wearable;
        }
    }

    private async getWearableAbility(wearable: Wearable): Promise<Ability | null> {
        if (wearable.metadata.ability) {
            return wearable.metadata.ability;
        }

        //セットされていない場合は取得
        const searchCriteria = {
            targetId: wearable.mosaicId,
            metadataType: MetadataType.Mosaic,
        };

        const metadataHttp = this.repositoryFactory.createMetadataRepository();
        const metadataResult = await metadataHttp.search(searchCriteria).toPromise();

        const abilityMetadata: Metadata | undefined = metadataResult.data.find((meta: Metadata) => {
            if (meta.metadataEntry.targetId instanceof MosaicId) {
                return meta.metadataEntry.scopedMetadataKey.toHex() === KeyGenerator.generateUInt64Key('ability').toHex();
            } else {
                return false;
            }
        });
        if (!abilityMetadata) {
            return null;
        }

        let ability = abilityMetadata.metadataEntry.value;
        if (Convert.isHexString(abilityMetadata.metadataEntry.value)) {
            let ability = Buffer.from(abilityMetadata.metadataEntry.value, 'hex').toString('utf-8');
        }

        const abilityResult = YamlUtils.fromYaml(ability) as Ability;
        if (abilityResult) {
            return abilityResult;
        }
        return null;
    }

    public async getWearableSVGStruct(wearable: Wearable): Promise<Svg | undefined> {
        if (wearable.svg) {
            return wearable.svg;
        }
        const headerTx = wearable.aggregateTransaction.innerTransactions[0] as TransferTransaction;

        type Header = {
            header: SvgHeader
        };
        const header = YamlUtils.fromYaml(headerTx.message.payload) as Header;
        if (!header.header.viewBox || !header.header.xmlns) {
            return undefined;
        }
        const svgHeader: SvgHeader = {viewBox: header.header.viewBox, xmlns: header.header.xmlns};

        const contentStructTx = wearable.aggregateTransaction.innerTransactions[1] as TransferTransaction;
        const contentStructUintArray = Uint8Array.from(Buffer.from(contentStructTx.message.payload, "hex"));

        type Content = {
            body: string[],
            style: string[],
            script: string[],
        }
        const contentStruct = YamlUtils.fromYaml(new TextDecoder().decode(contentStructUintArray)) as Content;
        if (!contentStruct.body || !contentStruct.style || !contentStruct.script) {
            return undefined;
        }
        return {
            header: svgHeader,
            body: contentStruct.body,
            style: contentStruct.style,
            script: contentStruct.script,
        }
    }

}