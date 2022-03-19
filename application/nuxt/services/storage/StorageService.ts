import * as _ from 'lodash';
import {
    Account,
    Address,
    AggregateTransaction,
    Convert,
    Deadline,
    HashLockTransaction,
    KeyGenerator,
    Mosaic,
    MosaicId,
    MosaicMetadataTransaction,
    NetworkType,
    PlainMessage,
    PublicAccount,
    RawMessage,
    RepositoryFactory,
    SignedTransaction,
    Transaction,
    TransactionGroup,
    TransactionService,
    TransactionType,
    TransferTransaction,
    UInt64,
} from 'symbol-sdk';
import {HeaderType} from './HeaderType';
import {FileParser, FileParserManager, SplitResult} from './parser';
import {Utils} from './Utils';
import {YamlUtils} from './YamlUtils';

export type SvgStruct = {
    body: string[];
    style: string[];
    script: string[];
}

export interface FileMetadata {
    service?: string;
    kind?: string;
    type?: string;
    version: number;
    name: string;
    parser: string;
    size?: number;
    mime: string;
    hashes: string[];
    struct: SvgStruct;
    header?: Record<string, HeaderType>;
    userData?: Record<string, HeaderType>;
}

export interface NFTMetadata {
    service?: string;
    kind?: string;
    type?: string;
    version: number;
    name: string;
    parser: string;
    size?: number;
    mime: string;
    struct: SvgStruct;
    header?: Record<string, HeaderType>;
    userData?: Record<string, HeaderType>;
    mosaicId?: MosaicId;
}

export interface Logger {
    log(message: string): void;
}

export class ConsoleLogger implements Logger {
    log(message: string): void {
        console.log(message);
    }
}

type Ability = {
    fat: number;
    carb: number;
    protein: number;
    vitamin: number;
    mineral: number;
}

export type PublicAddressParam = string | PublicAccount | Address;
export type PublicAccountParam = string | PublicAccount;
export type PrivateAccountParam = string | Account;

export interface StoreSvgParams {
    signerPrivateAccount: PrivateAccountParam;
    recipientPublicAccount: PublicAccountParam;
    cosignerAccounts?: PrivateAccountParam[];
    content: Uint8Array;
    style?: Uint8Array;
    name: string;
    mime: string;
    userData?: Record<string, HeaderType>;
    feeMultiplier: number;
    logger?: ConsoleLogger;
    extraTransactions?: Transaction[];
}

export interface StoreNFTParams {
    signerPrivateAccount: PrivateAccountParam;
    recipientPublicAccount: PublicAccountParam;
    cosignerAccounts?: PrivateAccountParam[];
    kind?: string;
    struct: SvgStruct;
    name: string;
    mime: string;
    userData?: Record<string, HeaderType>;
    feeMultiplier: number;
    logger?: ConsoleLogger;
    extraTransactions?: Transaction[];
    mosaicId?: MosaicId;
}

export interface StoreFileResponse {
    metadata: FileMetadata | NFTMetadata;
    rootTransactionHash: string;
    logger?: ConsoleLogger;
}

export class StorageService {
    private readonly fileParserManager = new FileParserManager();

    constructor(private readonly repositoryFactory: RepositoryFactory) {}

    public async storeSvg({
                               signerPrivateAccount,
                               recipientPublicAccount,
                               content,
                               name,
                               mime,
                               feeMultiplier,
                               userData,
                               cosignerAccounts = [],
                               extraTransactions = [],
                               logger = new ConsoleLogger(),
                           }: StoreSvgParams): Promise<StoreFileResponse> {
        const epochAdjustment = await this.repositoryFactory.getEpochAdjustment().toPromise();
        const deadline = Deadline.create(epochAdjustment);
        const generationHash = await this.repositoryFactory.getGenerationHash().toPromise();
        const networkType = await this.repositoryFactory.getNetworkType().toPromise();
        logger?.log(`Splitting file size ${content.length}`);
        const fileMimeType = mime;
        const { parser, multiLevelChunks, header } = await this.split(content, mime, logger);
        const signerAccount = StorageService.getAccount(signerPrivateAccount, networkType);
        const recipientAddress = StorageService.getAddress(recipientPublicAccount, networkType);
        const dataRecipientAddress = signerAccount.address;
        const aggregates = multiLevelChunks.map((chunks) => {
            console.log(`${chunks}`);
            const innerTransactions: TransferTransaction[] = chunks.map((chunk) => {
                const payload = chunk;
                return TransferTransaction.create(deadline, dataRecipientAddress, [], RawMessage.create(payload), networkType);
            });
            const aggregate = AggregateTransaction.createComplete(
                deadline,
                innerTransactions.map((t) => t.toAggregate(signerAccount.publicAccount)),
                networkType,
                [],
            );
            logger?.log(`Created aggregate with ${innerTransactions.length} transfer transactions`);
            return aggregate.setMaxFeeForAggregate(feeMultiplier, 0);
        });
        logger?.log(`Created ${aggregates.length} data aggregate transactions`);

        const aggregateContent = await this.getContent(aggregates, parser);
        if (!Utils.arraysEqual(aggregateContent, content)) {
            console.log(aggregateContent)
            console.log(content)
            //sanity check
            throw new Error('Invalid aggregate content!');
        }

        const signedTransactions = aggregates.map((aggregate) => signerAccount.sign(aggregate, generationHash));

        const fileMetadata: FileMetadata = {
            service: 'unEatingMeals',
            kind: 'meals',
            version: 1,
            name: name,
            parser: parser.name,
            mime: fileMimeType,
            hashes: signedTransactions.map((t) => t.hash),
            struct: {body: signedTransactions.map((t) => t.hash), style: [], script: []},
            header: header,
            userData: userData,
        };
        const metadataTransaction = this.createRootTransaction(
            fileMetadata,
            deadline,
            signerAccount.publicAccount,
            recipientAddress,
            dataRecipientAddress,
            networkType,
            feeMultiplier,
            extraTransactions,
            cosignerAccounts?.length,
            logger,
        );
        const rootTransaction = signerAccount.signTransactionWithCosignatories(
            metadataTransaction,
            cosignerAccounts.map((c) => StorageService.getAccount(c, networkType)),
            generationHash,
        );
        logger?.log(`Root transaction ${rootTransaction.hash} signed`);
        if (true) {
            // For speed, all in parallel
            // await this.announceAll([...signedTransactions, rootTransaction], true, logger);
            await this.announceAll(signedTransactions, true, logger);
        } else {
            await this.announceAll(signedTransactions, true, logger);
            await this.announceAll([rootTransaction], false, logger);
        }

        logger?.log(`All transactidon have been confirmed. Use root transaction hash ${rootTransaction.hash} as the file id`);
        return { metadata: fileMetadata, rootTransactionHash: rootTransaction.hash };
    }

    public async storeNFT({
                               signerPrivateAccount,
                               recipientPublicAccount,
                               kind,
                               name,
                               mime,
                               struct,
                               mosaicId,
                               feeMultiplier,
                               userData,
                               cosignerAccounts = [],
                               extraTransactions = [],
                               logger = new ConsoleLogger(),
                           }: StoreNFTParams): Promise<StoreFileResponse> {
        const epochAdjustment = await this.repositoryFactory.getEpochAdjustment().toPromise();
        const deadline = Deadline.create(epochAdjustment);
        const generationHash = await this.repositoryFactory.getGenerationHash().toPromise();
        const networkType = await this.repositoryFactory.getNetworkType().toPromise();
        const fileMimeType = mime;
        const signerAccount = StorageService.getAccount(signerPrivateAccount, networkType);
        const recipientAddress = StorageService.getAddress(recipientPublicAccount, networkType);
        const dataRecipientAddress = signerAccount.address;

        const fileMetadata: NFTMetadata = {
            service: 'UnEatingMeals',
            kind: kind,
            version: 1,
            name: name,
            parser: 'svg',
            mime: fileMimeType,
            struct: struct,
            header: {viewBox: "0 0 64 64", xmlns: "http://www.w3.org/2000/svg"},
            userData: userData,
            mosaicId: mosaicId,
        };
        const metadataTransaction = this.createRootNFTTransaction(
            fileMetadata,
            deadline,
            signerAccount.publicAccount,
            recipientAddress,
            dataRecipientAddress,
            networkType,
            feeMultiplier,
            extraTransactions,
            cosignerAccounts?.length,
            logger,
            mosaicId,
        );
        const rootTransaction = signerAccount.signTransactionWithCosignatories(
            metadataTransaction,
            cosignerAccounts.map((c) => StorageService.getAccount(c, networkType)),
            generationHash,
        );

        let networkCurrencyMosaicId = new MosaicId('3A8416DB2D53B6C8');
        if (networkType === NetworkType.MAIN_NET) {
            let networkCurrencyMosaicId = new MosaicId('6BED913FA20223F8');
        }
        const networkCurrencyDivisibility = 6;

        const hashLockTransaction = HashLockTransaction.create(
            Deadline.create(epochAdjustment),
            new Mosaic(
                networkCurrencyMosaicId,
                UInt64.fromUint(10 * Math.pow(10, networkCurrencyDivisibility)),
            ),
            UInt64.fromUint(480),
            rootTransaction,
            networkType,
            UInt64.fromUint(2000000),
        );

        const signedHashLockTransaction = signerAccount.sign(
            hashLockTransaction,
            generationHash,
        );
        await this.announceBonded([rootTransaction], signedHashLockTransaction, true, logger);

        logger?.log(`All transaction have been confirmed. Use root transaction hash ${rootTransaction.hash} as the file id`);
        return { metadata: fileMetadata, rootTransactionHash: rootTransaction.hash };
    }

    private async split(content: Uint8Array, mime: string, logger?: Logger): Promise<{ parser: FileParser } & SplitResult> {
        const parser = this.fileParserManager.getFileParserFromMimeType(mime);
        try {
            logger?.log(`Parser ${parser.name} resolved from mime type ${mime}`);
            const result = await parser.split(content);
            return { parser, ...result };
        } catch (e) {
            logger?.log(`Parser ${parser.name} failed to split. Falling back to default parser. Error: ${Utils.getMessageFromError(e)}`);
            const fallbackParser = this.fileParserManager.getFileParser(undefined);
            logger?.log(`Parser ${fallbackParser.name} resolved`);
            const result = await fallbackParser.split(content);
            return { parser: fallbackParser, ...result };
        }
    }

    private createRootTransaction(
        fileMetadata: FileMetadata,
        deadline: Deadline,
        signerAccount: PublicAccount,
        recipientAddress: Address,
        dataRecipientAddress: Address,
        networkType: NetworkType,
        feeMultiplier: number,
        extraTransactions: Transaction[],
        requiredCosignatures: number,
        logger?: Logger,
    ): AggregateTransaction {
        const { hashes, struct, ...rest } = fileMetadata;
        console.log(fileMetadata);
        logger?.log(`${fileMetadata}`);
        logger?.log(`${hashes}`);
        console.log(struct);
        const metadataWithoutHashes = YamlUtils.toYaml(rest);
        const metadataMessageWithoutHashes = PlainMessage.create(metadataWithoutHashes);

        const structYaml = YamlUtils.toYaml(struct);
        const structYamlSplit = _.chunk(Convert.utf8ToUint8(structYaml), 1024);

        const hashesSplit = _.chunk(Convert.hexToUint8(hashes.join('')), 1024);
        const transferTransaction = TransferTransaction.create(deadline, recipientAddress, [], metadataMessageWithoutHashes, networkType);
        const innerTransactions = [
            transferTransaction,
            ...structYamlSplit.map((struct) => {
                return TransferTransaction.create(
                    deadline,
                    dataRecipientAddress,
                    [],
                    RawMessage.create(Uint8Array.from(struct)),
                    networkType,
                );
            }),
        ];
        extraTransactions.forEach((t) => {
            logger?.log(`Adding ${t.constructor.name} type ${t.type} added to aggregate transactions`);
        });
        const aggregate = AggregateTransaction.createComplete(
            deadline,
            [...innerTransactions.map((t) => t.toAggregate(signerAccount)), ...extraTransactions],
            networkType,
            [],
        );

        logger?.log(`Created aggregate root transaction transaction with ${aggregate.innerTransactions.length} inner transactions`);
        return aggregate.setMaxFeeForAggregate(feeMultiplier, requiredCosignatures);
    }

    private createRootNFTTransaction(
        fileMetadata: NFTMetadata,
        deadline: Deadline,
        signerAccount: PublicAccount,
        recipientAddress: Address,
        dataRecipientAddress: Address,
        networkType: NetworkType,
        feeMultiplier: number,
        extraTransactions: Transaction[],
        requiredCosignatures: number,
        logger?: Logger,
        mosaicId?: MosaicId,
    ): AggregateTransaction {
        const { struct, ...rest } = fileMetadata;
        console.log(fileMetadata);
        logger?.log(`${fileMetadata}`);
        console.log(struct);
        const metadataWithoutHashes = YamlUtils.toYaml(rest);
        const metadataMessageWithoutHashes = PlainMessage.create(metadataWithoutHashes);

        const structYaml = YamlUtils.toYaml(struct);
        const structYamlSplit = _.chunk(Convert.utf8ToUint8(structYaml), 1024);
        const transferTransaction = TransferTransaction.create(deadline, recipientAddress, [], metadataMessageWithoutHashes, networkType);
        let innerTransactions = [
            transferTransaction,
            ...structYamlSplit.map((struct) => {
                return TransferTransaction.create(
                    deadline,
                    dataRecipientAddress,
                    [],
                    RawMessage.create(Uint8Array.from(struct)),
                    networkType,
                );
            }),
        ];
        if (mosaicId) {
            console.log();
            const value = this.generateAbility();
            console.log(value);
            const mosaicMetadataTransaction = MosaicMetadataTransaction.create(
                deadline,
                dataRecipientAddress,
                KeyGenerator.generateUInt64Key('ability'),
                mosaicId,
                value.length,
                value,
                networkType,
            ).toAggregate(signerAccount);
            extraTransactions.push(mosaicMetadataTransaction)

            //serviceメタタグ
            //type　meals, wearables（とpart(部位キーも含める)））
            let typeName = 'meals';
            if(fileMetadata.kind == 'wearable'){
                typeName = "wearables";
            }

            console.log(typeName);
            const mosaicMetadataTransaction2 = MosaicMetadataTransaction.create(
                deadline,
                dataRecipientAddress,
                KeyGenerator.generateUInt64Key('type'),
                mosaicId,
                typeName.length,
                typeName,
                networkType,
            ).toAggregate(signerAccount);
            extraTransactions.push(mosaicMetadataTransaction2)
        }

        extraTransactions.forEach((t) => {
            logger?.log(`Adding ${t.constructor.name} type ${t.type} added to aggregate transactions`);
        });

        const aggregate = AggregateTransaction.createBonded(
            deadline,
            [...innerTransactions.map((t) => t.toAggregate(signerAccount)), ...extraTransactions],
            networkType,
            [],
        );

        logger?.log(`Created aggregate root transaction transaction with ${aggregate.innerTransactions.length} inner transactions`);
        return aggregate.setMaxFeeForAggregate(feeMultiplier, requiredCosignatures);
    }

    private getContent(aggregateTransactions: AggregateTransaction[], fileParser: FileParser): Promise<Uint8Array> {
        const chunks = _.map(aggregateTransactions, (aggregate) =>
            (aggregate.innerTransactions as TransferTransaction[]).map((t) => {
                return t.message.toBuffer();
            }),
        );
        return fileParser.join(chunks);
    }


    public generateAbility(): string {
        let ability = {
            fat: Math.floor(Math.random() * 100),
            carb: Math.floor(Math.random() * 100),
            protein: Math.floor(Math.random() * 100),
            vitamin: Math.floor(Math.random() * 100),
            mineral: Math.floor(Math.random() * 100),
        }
        return YamlUtils.toYaml(ability);
    }

    public async announceBonded(allSignedTransactions: SignedTransaction[], bondedTransaction: SignedTransaction, parallel = false, logger = new ConsoleLogger()): Promise<void> {
        const listener = this.repositoryFactory.createListener();
        const transactionService = new TransactionService(
            this.repositoryFactory.createTransactionRepository(),
            this.repositoryFactory.createReceiptRepository(),
        );
        const basicAnnounce = async (signedTransaction: SignedTransaction) => {
            try {
                listener
                    .status(PublicAccount.createFromPublicKey(signedTransaction.signerPublicKey, signedTransaction.networkType).address)
                    .subscribe((t) => {
                        logger.log(`There has been an error ${JSON.stringify(t, null, 2)}`);
                    });
                logger.log(`Announcing transaction ${signedTransaction.hash}`);
                await transactionService.announceHashLockAggregateBonded(bondedTransaction, signedTransaction, listener).toPromise();
                logger.log(`Transaction ${signedTransaction.hash} confirmed`);
            } catch (e) {
                console.error(e);
                throw new Error(`Transaction ${signedTransaction.hash} error: ${e}`);
            }
        };
        try {
            await listener.open();
            if (parallel) {
                await Promise.all(allSignedTransactions.map(basicAnnounce));
            } else {
                for (const signedTransaction of allSignedTransactions) {
                    await basicAnnounce(signedTransaction);
                }
            }
        } finally {
            listener.close();
        }
    }


    public async announceAll(allSignedTransactions: SignedTransaction[], parallel = false, logger = new ConsoleLogger()): Promise<void> {
        const listener = this.repositoryFactory.createListener();
        const transactionService = new TransactionService(
            this.repositoryFactory.createTransactionRepository(),
            this.repositoryFactory.createReceiptRepository(),
        );
        const basicAnnounce = async (signedTransaction: SignedTransaction) => {
            try {
                listener
                    .status(PublicAccount.createFromPublicKey(signedTransaction.signerPublicKey, signedTransaction.networkType).address)
                    .subscribe((t) => {
                        logger.log(`There has been an error ${JSON.stringify(t, null, 2)}`);
                    });
                logger.log(`Announcing transaction ${signedTransaction.hash}`);
                await transactionService.announce(signedTransaction, listener).toPromise();
                logger.log(`Transaction ${signedTransaction.hash} confirmed`);
            } catch (e) {
                console.error(e);
                throw new Error(`Transaction ${signedTransaction.hash} error: ${e}`);
            }
        };
        try {
            await listener.open();
            if (parallel) {
                await Promise.all(allSignedTransactions.map(basicAnnounce));
            } else {
                for (const signedTransaction of allSignedTransactions) {
                    await basicAnnounce(signedTransaction);
                }
            }
        } finally {
            listener.close();
        }
    }

    public static getAddress(publicAccountParam: PublicAddressParam, networkType: NetworkType): Address {
        if (typeof publicAccountParam === 'string')
            return Convert.isHexString(publicAccountParam, 64)
                ? PublicAccount.createFromPublicKey(publicAccountParam, networkType).address
                : Address.createFromRawAddress(publicAccountParam);
        const address = (publicAccountParam as PublicAccount).address || (publicAccountParam as Address);
        return Address.createFromRawAddress(address.plain());
    }

    public static getPublicAccount(publicAccountParam: PublicAccountParam, networkType: NetworkType): PublicAccount {
        if (typeof publicAccountParam === 'string') return PublicAccount.createFromPublicKey(publicAccountParam, networkType);
        return publicAccountParam;
    }
    public static getAccount(privateAccountParam: PrivateAccountParam, networkType: NetworkType): Account {
        if (typeof privateAccountParam === 'string') return Account.createFromPrivateKey(privateAccountParam, networkType);
        return privateAccountParam;
    }
}
