import {
    Address,
    AggregateTransaction,
    Convert,
    KeyGenerator,
    Metadata,
    MetadataType,
    Mosaic,
    MosaicDefinitionTransaction,
    MosaicId,
    NetworkType,
    Order,
    Page,
    RepositoryFactoryHttp,
    Transaction,
    TransactionGroup,
    TransactionSearchCriteria,
    TransactionType
} from "symbol-sdk";
import {isServiceMetadataKey} from "../utils/serviceMetadata";
import {EquipmentMosaicId} from "~/models/Meal";

export interface NFTServiceInterface {
    getRepositoryFactoryHttp(): RepositoryFactoryHttp

    getTransactionRepository(): RepositoryFactoryHttp

    getServiceAddress(): Address

    getItemAll(): Promise<Page<any>>

    getTransactionConfirmed(transactionId: string): Promise<Transaction>

    getNetworkType(): NetworkType

    // getMosaicOwnerAddress(mosaicId: MosaicId): void
    getHoldMosaicIds(address: Address): Promise<MosaicId[]>

    getAggregateTransactionByMosaicId(mosaicId: MosaicId): Promise<AggregateTransaction | null>

    getGameMultiSigAccount(sourceAddress: Address): Promise<{ metadata: Metadata, address: Address }[]>

    getCosignatoryAddresses(sourceAddress: Address): Promise<Address[]>

    getAccountMetadataByAddress(key: string, targetAddress: Address, sourceAddress: Address): Promise<Metadata | null>

    getAccountMetadataByMosaic(key: string, targetAddress: Address, sourceAddress: Address): Promise<Metadata | null>

    filterEquipmentMosaicIds(
        address: Address,
        eq: {left_hand: string|null, right_hand: string|null, head: string|null, shoes: string|null, glasses: string|null}
    ): Promise<EquipmentMosaicId>
}

export class NFTService implements NFTServiceInterface {

    public repositoryFactory;
    private serviceAddress: Address;
    private servicePubKey: string;
    private networkType: NetworkType;

    constructor(private readonly nodeUrl: string, private readonly servicePublicKey: string, private readonly _networkType: NetworkType) {
        this.repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
        this.servicePubKey = servicePublicKey;
        this.networkType = _networkType;
        this.serviceAddress = Address.createFromPublicKey(servicePublicKey, _networkType);
    }

    public getTransactionRepository(): RepositoryFactoryHttp {
        return this.repositoryFactory;
    }

    public getNetworkType(): NetworkType {
        return this.networkType;
    }

    public getServiceAddress(): Address {
        return this.serviceAddress;
    }


    /**
     * 該当アドレスが生成した全てのアイテムを取得する
     */
    public getItemAll(): Promise<Page<any>> {
        const transactionHttp = this.repositoryFactory.createTransactionRepository();
        const searchCriteria = {
            group: TransactionGroup.Confirmed,
            type: [TransactionType.AGGREGATE_COMPLETE],
            signerPublicKey: this.servicePubKey,
            pageNumber: 1,
            pageSize: 100,
        };
        return transactionHttp.search(searchCriteria).toPromise();
    }

    async getTransactionConfirmed(transactionId: string): Promise<Transaction> {
        const transactionRepo = this.repositoryFactory.createTransactionRepository();
        return transactionRepo.getTransaction(transactionId, TransactionGroup.Confirmed).toPromise();
    }

    public getRepositoryFactoryHttp(): RepositoryFactoryHttp {
        return this.repositoryFactory;
    }

    /**
     * UnEatingMealsのMosaicのみ取得
     *
     * @param address
     */
    public async getHoldMosaicIds(address: Address): Promise<MosaicId[]> {
        const accountRepo = this.repositoryFactory.createAccountRepository();
        const accountInfo = await accountRepo.getAccountInfo(address).toPromise();
        let mosaicIds: MosaicId[] = accountInfo.mosaics.map((item: Mosaic) => {
            return item.id as MosaicId
        });
        // filter
        const metadataRepo = this.repositoryFactory.createMetadataRepository();
        const mosaicDetails = await Promise.all(mosaicIds.map(async (mosaicId: MosaicId) => {
            const searchCriteria = {
                targetId: mosaicId,
                metadataType: MetadataType.Mosaic,
                sourceAddress: this.serviceAddress,
                targetAddress: this.serviceAddress,
                order: Order.Desc,
            };
            return metadataRepo.search(searchCriteria).toPromise();
        }));

        // 最新のメタデータをチェック
        const result = mosaicDetails.map((page: Page<Metadata>) => {
            if (page.data.length == 0) {
                return null;
            }
            const metadataEntry = page.data[0].metadataEntry;
            let metadataValue = metadataEntry.value;
            if (isServiceMetadataKey(metadataEntry.scopedMetadataKey, metadataValue, null)) {
                return page.data[0].metadataEntry.targetId as MosaicId;
            }

            let targetId: MosaicId | null = null;
            page.data.forEach((item: Metadata) => {
                if(!targetId) {
                    let metadataEntry = item.metadataEntry;
                    let metadataValue = item.metadataEntry.value;
                    if (isServiceMetadataKey(metadataEntry.scopedMetadataKey, metadataValue, null)) {
                        targetId = metadataEntry.targetId as MosaicId;
                    }
                }
            });

            return targetId;
        }).filter((item) => {
            return item != null;
        });
        return result as MosaicId[];
    }

    public async getAggregateTransactionByMosaicId(mosaicId: MosaicId): Promise<AggregateTransaction | null> {
        // mosaicInfoから発行したblockHeightを入手
        const metadataRepo = this.repositoryFactory.createMosaicRepository();
        const mosaicInfo = await metadataRepo.getMosaic(mosaicId).toPromise();
        const transactionHttp = this.repositoryFactory.createTransactionRepository();
        const searchCriteria: TransactionSearchCriteria = {
            group: TransactionGroup.Confirmed,
            height: mosaicInfo.startHeight,
            signerPublicKey: this.servicePubKey,
        }
        const transactions = await transactionHttp.search(searchCriteria).toPromise();

        const aggTxs = transactions.data.filter((tx: Transaction) => {
            return tx instanceof AggregateTransaction;
        }) as AggregateTransaction[];

        const aggTx = (await Promise.all(aggTxs.map(async (tx: AggregateTransaction) => {
            // innerTransactionsを取得する
            if (tx.transactionInfo?.hash) {
                const aggTx = await this.getTransactionConfirmed(tx.transactionInfo.hash);
                if (aggTx instanceof AggregateTransaction) {
                    const definitionTransaction = aggTx.innerTransactions.find((innerTx) => {
                        return innerTx instanceof MosaicDefinitionTransaction && innerTx.mosaicId.equals(mosaicId);
                    });
                    if (definitionTransaction) {
                        return aggTx as AggregateTransaction;
                    }
                }
            }
            return null;
        }))).filter((item) => {
            return item !== null;
        }) as AggregateTransaction[];
        if (aggTx.length > 0) {
            return aggTx[0];
        }
        return null;
    }


    /**
     *  ゲームアカウント用のマルチシグアカウントを取得する
     *  check meal_id(mosaicId)を持っていること
     */
    public async getGameMultiSigAccount(sourceAddress: Address): Promise<{ metadata: Metadata, address: Address }[]> {
        const multisigRepo = this.repositoryFactory.createMultisigRepository();
        const metadataRepo = this.repositoryFactory.createMetadataRepository();
        try {
            const multisigAccountInfo = await multisigRepo.getMultisigAccountInfo(sourceAddress).toPromise();
            const gameAccount = (await Promise.all(multisigAccountInfo.multisigAddresses.map(async (address: Address) => {
                const searchCriteria = {
                    targetAddress: address,
                    sourceAddress: this.serviceAddress,
                    metadataType: MetadataType.Account,
                    scopedMetadataKey: KeyGenerator.generateUInt64Key('meal_id').toHex(),
                    order: Order.Desc,
                };
                return {address: address, metadata_page: await metadataRepo.search(searchCriteria).toPromise().catch()};
            }))).filter((item: { address: Address, metadata_page: Page<Metadata> }) => {
                return item.metadata_page.data.length !== 0;
            }).map((item: { address: Address, metadata_page: Page<Metadata> }) => {
                return {address: item.address, metadata: item.metadata_page.data[0]}
            });
            return gameAccount;
        } catch {
            return [];
        }

    }

    public async getAccountMetadataByAddress(key: string, targetAddress: Address, sourceAddress: Address): Promise<Metadata | null> {
        const metadataRepo = this.repositoryFactory.createMetadataRepository();
        const searchCriteria = {
            targetAddress: targetAddress,
            sourceAddress: sourceAddress,
            metadataType: MetadataType.Account,
            scopedMetadataKey: KeyGenerator.generateUInt64Key(key).toHex(),
            order: Order.Desc,
        };

        const searchResult = await metadataRepo.search(searchCriteria).toPromise();
        if (searchResult.data.length === 0) {
            return null;
        }

        return searchResult.data[0];
    }

    public async getAccountMetadataValueByAddress(key: string, targetAddress: Address, sourceAddress: Address): Promise<string | null> {
        const metadataRepo = this.repositoryFactory.createMetadataRepository();
        const searchCriteria = {
            targetAddress: targetAddress,
            sourceAddress: sourceAddress,
            metadataType: MetadataType.Account,
            scopedMetadataKey: KeyGenerator.generateUInt64Key(key).toHex(),
            order: Order.Desc,
        };

        const searchResult = await metadataRepo.search(searchCriteria).toPromise();
        if (searchResult.data.length === 0) {
            return null;
        }

        // meal_idは除外
        if (key !== 'meal_id' && Convert.isHexString(searchResult.data[0].metadataEntry.value)) {
            return Buffer.from(searchResult.data[0].metadataEntry.value, 'hex').toString('utf-8');
        }
        return searchResult.data[0].metadataEntry.value;
    }

    public async getAccountMetadataByMosaic(key: string, targetAddress: Address, sourceAddress: Address): Promise<Metadata | null> {
        const metadataRepo = this.repositoryFactory.createMetadataRepository();
        const searchCriteria = {
            targetAddress: targetAddress,
            sourceAddress: sourceAddress,
            metadataType: MetadataType.Mosaic,
            scopedMetadataKey: KeyGenerator.generateUInt64Key(key).toHex(),
            order: Order.Desc,
        };

        const searchResult = await metadataRepo.search(searchCriteria).toPromise();
        if (searchResult.data.length === 0) {
            return null;
        }

        return searchResult.data[0];
    }

    public async filterEquipmentMosaicIds(
        address: Address,
        eq: {left_hand: string|null, right_hand: string|null, head: string|null, shoes: string|null, glasses: string|null}
    ): Promise<EquipmentMosaicId>
    {
        try {
            const mosaicIds = await this.getHoldMosaicIds(address);
            let result: EquipmentMosaicId = {};
            let filter: MosaicId[] | null = null;
            if (eq.left_hand) {
                let eqMosaicId = new MosaicId(eq.left_hand);
                filter = mosaicIds.filter((mosaicId) => {
                    return mosaicId.equals(eqMosaicId);
                })

                if (filter.length > 0) {
                    result.left_hand = eqMosaicId;
                }
            }
            if (eq.right_hand) {
                let eqMosaicId = new MosaicId(eq.right_hand);
                filter = mosaicIds.filter((mosaicId) => {
                    return mosaicId.equals(eqMosaicId);
                })

                if (filter.length > 0) {
                    result.right_hand = eqMosaicId;
                }
            }
            if (eq.head) {
                let eqMosaicId = new MosaicId(eq.head);
                filter = mosaicIds.filter((mosaicId) => {
                    return mosaicId.equals(eqMosaicId);
                })

                if (filter.length > 0) {
                    result.head = eqMosaicId;
                }
            }
            if (eq.shoes) {
                let eqMosaicId = new MosaicId(eq.shoes);
                filter = mosaicIds.filter((mosaicId) => {
                    return mosaicId.equals(eqMosaicId);
                })

                if (filter.length > 0) {
                    result.shoes = eqMosaicId;
                }
            }
            if (eq.glasses) {
                let eqMosaicId = new MosaicId(eq.glasses);
                filter = mosaicIds.filter((mosaicId) => {
                    return mosaicId.equals(eqMosaicId);
                })

                if (filter.length > 0) {
                    result.glasses = eqMosaicId;
                }
            }
            return result;
        } catch {
            return {left_hand: undefined, right_hand: undefined, head: undefined, shoes: undefined, glasses: undefined}
        }
    }

    public async getCosignatoryAddresses(sourceAddress: Address): Promise<Address[]>
    {
        console.log('getcosig');
        const multisigRepo = this.repositoryFactory.createMultisigRepository()
        const multisigAccountInfo = await multisigRepo.getMultisigAccountInfo(sourceAddress).toPromise();
        console.log(multisigAccountInfo);
        return multisigAccountInfo.cosignatoryAddresses
    }


}
