import {
    Account,
    AccountMetadataTransaction,
    Address,
    Deadline,
    KeyGenerator,
    Mosaic,
    MosaicDefinitionTransaction,
    MosaicFlags,
    MosaicId,
    MosaicNonce,
    MosaicSupplyChangeAction,
    MosaicSupplyChangeTransaction,
    MultisigAccountModificationTransaction,
    PlainMessage,
    RepositoryFactory,
    Transaction,
    TransferTransaction,
    UInt64,
} from 'symbol-sdk';

import {
    ConsoleLogger,
    PrivateAccountParam,
    StorageService,
    StoreFileResponse,
    StoreNFTParams,
    StoreSvgParams,
    SvgStruct,
} from './StorageService';

interface CreateSvgParam {
    garushNetwork: boolean;
    brokerPrivateAccount: PrivateAccountParam;
    content: Uint8Array;
    style?: Uint8Array;
    kind? :string;
    name: string;
    description: string;
    mime: string;
    feeMultiplier: number;
    mosaicDuration?: number;
    userData?: Record<string, unknown>;
    logger?: ConsoleLogger;
    nonce?: MosaicNonce;
    extraTransactions?: Transaction[];
    cosignerAccounts?: PrivateAccountParam[];
}

interface CreateNFTParam {
    garushNetwork: boolean;
    brokerPrivateAccount: string;
    supplierPrivateAccount: string;
    struct: SvgStruct;
    kind : 'meal'|'wearable';
    name: string;
    description: string;
    mime: string;
    feeMultiplier: number;
    mosaicDuration?: number;
    userData?: Record<string, unknown>;
    logger?: ConsoleLogger;
    nonce?: MosaicNonce;
    extraTransactions?: Transaction[];
    cosignerAccounts?: PrivateAccountParam[];
    supplierAddress: Address;
}

export class NFTService {
    constructor(private readonly symbolRepositoryFactory: RepositoryFactory, private readonly garushRepositoryFactory: RepositoryFactory) {}

    public async createSvg(params: CreateSvgParam): Promise<StoreFileResponse> {
        console.log(`createSvg!`)
        console.log(params.content)

        const repositoryFactory = params.garushNetwork ? this.garushRepositoryFactory : this.symbolRepositoryFactory;
        const epochAdjustment = await repositoryFactory.getEpochAdjustment().toPromise();
        const deadline = Deadline.create(epochAdjustment);
        const networkType = await repositoryFactory.getNetworkType().toPromise();
        const brokerAccount = StorageService.getAccount(params.brokerPrivateAccount, networkType);
        const flags = MosaicFlags.create(false, true, false);
        const storageService = new StorageService(repositoryFactory);
        const storeFileParams: StoreSvgParams = {
            ...params,
            signerPrivateAccount: brokerAccount.privateKey,
            recipientPublicAccount: brokerAccount.publicAccount,
            extraTransactions: [],
            cosignerAccounts: [],
            userData: { description: params.description },
        };
        const mosaicDuration = params.mosaicDuration;
        if (storeFileParams.extraTransactions == undefined) {
            throw new Error('storeFileParams.extraTransactions must not be undefined!');
        }
        if (storeFileParams.cosignerAccounts == undefined) {
            throw new Error('storeFileParams.cosignerAccounts must not be undefined!');
        }
        if (mosaicDuration !== undefined) {
            const nonce = params.nonce || MosaicNonce.createRandom();
            const mosaicId = MosaicId.createFromNonce(nonce, brokerAccount.address);
            const maxMosaicDuration = UInt64.fromUint(mosaicDuration);
            const mosaicDefinitionTransaction = MosaicDefinitionTransaction.create(
                deadline,
                nonce,
                mosaicId,
                flags,
                0,
                maxMosaicDuration,
                networkType,
            ).toAggregate(brokerAccount.publicAccount);

            const mosaicSupplyTransaction = MosaicSupplyChangeTransaction.create(
                deadline,
                mosaicId,
                MosaicSupplyChangeAction.Increase,
                UInt64.fromUint(1),
                networkType,
            ).toAggregate(brokerAccount.publicAccount);

            storeFileParams.extraTransactions.push(mosaicDefinitionTransaction, mosaicSupplyTransaction);
            storeFileParams.userData = { ...storeFileParams.userData, mosaicId: mosaicId.toHex() };
        }
        if (params.extraTransactions) {
            storeFileParams.extraTransactions.push(...params.extraTransactions);
        }
        if (params.cosignerAccounts) {
            storeFileParams.cosignerAccounts.push(...params.cosignerAccounts);
        }
        return storageService.storeSvg(storeFileParams);
    }

    public async createNFT(params: CreateNFTParam): Promise<StoreFileResponse> {
        console.log(params.struct)

        const repositoryFactory = params.garushNetwork ? this.garushRepositoryFactory : this.symbolRepositoryFactory;
        const epochAdjustment = await repositoryFactory.getEpochAdjustment().toPromise();
        const deadline = Deadline.create(epochAdjustment);
        const networkType = await repositoryFactory.getNetworkType().toPromise();
        const supplierAccount = Account.createFromPrivateKey(params.supplierPrivateAccount, networkType);
        const brokerAccount = Account.createFromPrivateKey(params.brokerPrivateAccount, networkType);
        const flags = MosaicFlags.create(false, true, false);
        const storageService = new StorageService(repositoryFactory);
        const storeFileParams: StoreNFTParams = {
            ...params,
            signerPrivateAccount: brokerAccount.privateKey,
            recipientPublicAccount: supplierAccount.privateKey,
            extraTransactions: [],
            cosignerAccounts: [],
            userData: { description: params.description },
        };
        const mosaicDuration = params.mosaicDuration;
        if (storeFileParams.extraTransactions == undefined) {
            throw new Error('storeFileParams.extraTransactions must not be undefined!');
        }
        if (storeFileParams.cosignerAccounts == undefined) {
            throw new Error('storeFileParams.cosignerAccounts must not be undefined!');
        }
        if (mosaicDuration !== undefined) {
            const nonce = params.nonce || MosaicNonce.createRandom();
            const mosaicId = MosaicId.createFromNonce(nonce, brokerAccount.address);
            const maxMosaicDuration = UInt64.fromUint(mosaicDuration);
            const mosaicDefinitionTransaction = MosaicDefinitionTransaction.create(
                deadline,
                nonce,
                mosaicId,
                flags,
                0,
                maxMosaicDuration,
                networkType,
            ).toAggregate(brokerAccount.publicAccount);

            let delta = UInt64.fromUint(1); // meal
            if(params.kind === 'wearable') {
                delta = UInt64.fromUint(5); // wearable
            }
            const mosaicSupplyTransaction = MosaicSupplyChangeTransaction.create(
                deadline,
                mosaicId,
                MosaicSupplyChangeAction.Increase,
                delta,
                networkType,
            ).toAggregate(brokerAccount.publicAccount);

            console.log('マルチシグアカウント生成');
            // マルチシグアカウント生成
            const account = Account.generateNewAccount(networkType);
            console.log('generateNewAccount=========');
            console.log(account.privateKey);
            console.log('===========================');

            // マルチシグ化
            const multisigAccountModificationTransaction = MultisigAccountModificationTransaction.create(
                Deadline.create(epochAdjustment),
                1,
                1,
                [supplierAccount.address],
                [],
                networkType,
            ).toAggregate(account.publicAccount);

            // wearableの場合はsupplierAddress
            // mealの場合はゲームアカウントアドレス
            let transferAddress = account.address;
            if(params.kind === 'wearable') {
                transferAddress = params.supplierAddress;
            }
            let mosaicTransferTransaction = TransferTransaction.create(
                deadline,
                transferAddress,
                [new Mosaic(new MosaicId(mosaicId.toHex()), UInt64.fromUint(1)),],
                PlainMessage.create(""),
                networkType,
            ).toAggregate(brokerAccount.publicAccount);

            // ゲームアカウントにメタデータ（meal情報、名前)を付与!
            const accountMetadataTransaction = AccountMetadataTransaction.create(
                deadline,
                account.address,
                KeyGenerator.generateUInt64Key('meal_id'),
                mosaicId.toHex().length,
                mosaicId.toHex(),
                networkType
            ).toAggregate(brokerAccount.publicAccount);

            const mealName = 'Unknown';
            const accountMetadataTransaction2 = AccountMetadataTransaction.create(
                deadline,
                account.address,
                KeyGenerator.generateUInt64Key('meal_name'),
                mealName.length,
                mealName,
                networkType
            ).toAggregate(brokerAccount.publicAccount);

            // wearable
            if (params.kind === 'wearable') {
                storeFileParams.extraTransactions.push(mosaicDefinitionTransaction, mosaicSupplyTransaction, mosaicTransferTransaction);
            }
            // meal
            if (params.kind === 'meal') {
                storeFileParams.extraTransactions.push(mosaicDefinitionTransaction, mosaicSupplyTransaction, mosaicTransferTransaction, multisigAccountModificationTransaction, accountMetadataTransaction, accountMetadataTransaction2);
            }
            storeFileParams.userData = { ...storeFileParams.userData, mosaicId: mosaicId.toHex() };
            storeFileParams.mosaicId = mosaicId;
        }
        if (params.extraTransactions) {
            storeFileParams.extraTransactions.push(...params.extraTransactions);
        }
        if (params.cosignerAccounts) {
            storeFileParams.cosignerAccounts.push(...params.cosignerAccounts);
        }

        return storageService.storeNFT(storeFileParams);
    }
}
