import {
    Account,
    AccountInfo,
    Address,
    AggregateTransaction,
    Deadline,
    HashLockTransaction,
    Mosaic,
    MosaicId,
    MultisigAccountModificationTransaction,
    NetworkType,
    PlainMessage,
    RepositoryFactoryHttp,
    TransactionService, TransactionStatus,
    TransferTransaction,
    UInt64
} from "symbol-sdk";
import {CURRENCY_MOSAIC_ID_MAIN_NET, CURRENCY_MOSAIC_ID_TEST_NET} from "~/utils/const";
import {types} from "node-sass";
import Error = types.Error;

export interface PurchaseServiceInterface {
    createPurchaseGameAccountTransaction(buyerAccount: Account, targetAddress: Address, amount: number): Promise<{result: boolean, message: string}>
}

export class PurchaseService implements PurchaseServiceInterface {
    public readonly nodeUrl;
    public repositoryFactory;
    private serviceAddress: Address;
    private servicePubKey: string;
    private networkType: NetworkType;
    private purchaseMosaicId: string;
    private feeMultiplier: number = 100;

    constructor(private readonly _nodeUrl: string, private readonly servicePublicKey: string, private readonly _networkType: NetworkType) {
        this.nodeUrl = _nodeUrl;
        this.repositoryFactory = new RepositoryFactoryHttp(_nodeUrl);
        this.servicePubKey = servicePublicKey;
        this.networkType = _networkType;
        this.serviceAddress = Address.createFromPublicKey(servicePublicKey, _networkType);

        if (_networkType === NetworkType.MAIN_NET) {
            this.purchaseMosaicId = CURRENCY_MOSAIC_ID_MAIN_NET;
        } else {
            this.purchaseMosaicId = CURRENCY_MOSAIC_ID_TEST_NET;
        }
    }

    /**
     * buyerAddress: 購入者
     * targetAddress: ゲームアカウントのアドレス
     * amount: xym量
     *
     * @param buyerAccount
     * @param targetAddress
     * @param amount
     */
    public async createPurchaseGameAccountTransaction(buyerAccount: Account, targetAddress: Address, amount: number): Promise<{result: boolean, message: string}> //TODO return type
    {
        const accountRepo = this.repositoryFactory.createAccountRepository();
        const generationHash = await this.repositoryFactory.getGenerationHash().toPromise();
        const epochAdjustment = await this.repositoryFactory.getEpochAdjustment().toPromise();
        const deadline = Deadline.create(epochAdjustment);

        // targetAddress（マルチシグアカウント）から、親アカウントを取得する。
        // 1-of-1チェック
        const cosignatories: Address[] = await this.getCosignatories(targetAddress);
        if (cosignatories.length != 1) {
            return {result: true, message: "ゲームアカウントの連署者は１つである必要があります。"};
        }
        const parentAddress: Address = cosignatories[0];
        const parentAccount: AccountInfo = await accountRepo.getAccountInfo(parentAddress).toPromise();
        const targetAccount: AccountInfo = await accountRepo.getAccountInfo(targetAddress).toPromise();

        // xym転送 buyerAddress -> 親アドレス
        const transferTransaction = TransferTransaction.create(
            deadline,
            parentAddress,
            [new Mosaic(new MosaicId(this.purchaseMosaicId), UInt64.fromUint(0))],
            PlainMessage.create(""),
            this.networkType,
        ).toAggregate(buyerAccount.publicAccount);

        // 親アドレス > targetAddress マルチシグ解除
        const multiSigAccountModificationTransaction = MultisigAccountModificationTransaction.create(
            Deadline.create(epochAdjustment),
            0,
            0,
            [buyerAccount.address],
            [parentAddress],
            this.networkType,
        ).toAggregate(targetAccount.publicAccount);

        // アグリゲートボンデット作成
        const aggregate = AggregateTransaction.createBonded(
            deadline,
            [
                transferTransaction,
                multiSigAccountModificationTransaction,
            ],
            this.networkType,
            [],
        ).setMaxFeeForAggregate(this.feeMultiplier, 1);

        const signedTransaction = buyerAccount.sign(aggregate, generationHash);

        // ハッシュロック作成
        const hashLockTransaction = HashLockTransaction.create(
            deadline,
            new Mosaic(
                new MosaicId(this.purchaseMosaicId),
                UInt64.fromUint(10 * Math.pow(10, 6)),
            ),
            UInt64.fromUint(480),
            signedTransaction,
            this.networkType,
            UInt64.fromUint(2000000),
        );
        const signedHashLockTransaction = buyerAccount.sign(
            hashLockTransaction,
            generationHash,
        );

        // アナウンス
        const repositoryFactory = new RepositoryFactoryHttp(this.nodeUrl, {
            websocketUrl: this.nodeUrl.replace('http', 'ws') + '/ws',
            websocketInjected: WebSocket
        });
        const listener = repositoryFactory.createListener();
        try {
            await listener.open();
            const transactionService = new TransactionService(repositoryFactory.createTransactionRepository(), repositoryFactory.createReceiptRepository());
            const result = await transactionService.announceHashLockAggregateBonded(
                signedHashLockTransaction,
                signedTransaction,
                listener
            ).toPromise();
            console.log(result);
        } catch (e: any) {
            listener.close();
            if (e.message === 'Failure_Core_Insufficient_Balance') {
                return {result: false, message: "アカウントの残高が不足しているため、検証に失敗しました。"}
            } else {
                return {result: false, message: "エラーが発生しました。"}
            }
        }
        listener.close();
        return {result: true, message: "購入トランザクションをネットワークにアナウンスしました。承認までもうしばらくお待ちください。（このサイトでは結果をアナウンスできませんので、各ウォレットを参照してください。）"};
    }

    /**
     * @param address
     * @private
     */
    private async getCosignatories(address: Address): Promise<Address[]> {
        const multiSigHttp = this.repositoryFactory.createMultisigRepository();
        const multiSigAccountInfo = await multiSigHttp.getMultisigAccountInfo(address).toPromise();
        return multiSigAccountInfo.cosignatoryAddresses;
    }
}
