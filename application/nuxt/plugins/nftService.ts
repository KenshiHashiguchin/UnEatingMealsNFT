import {Plugin} from '@nuxt/types'
import {NFTService, NFTServiceInterface} from "~/services/NFTService";
import {NetworkType} from "symbol-sdk";
import {PurchaseService, PurchaseServiceInterface} from "~/services/PurchaseService";

export interface Dependencies {
    // gitGateway: IGitGateway;
    nftService: NFTServiceInterface;
    purchaseService: PurchaseServiceInterface;
}

declare module 'vue/types/vue' {
    interface Vue {
        $service: Dependencies
    }
}

declare module '@nuxt/types' {
    interface Context {
        $service: Dependencies
    }
}

declare module 'vuex/types/index' {
    interface Store<S> {
        $service: Dependencies
    }
}

const myPlugin: Plugin = (context, inject) => {
    let nftService: NFTServiceInterface;
    let purchaseService: PurchaseServiceInterface;
    let networkType = NetworkType.TEST_NET;
    if (process.env.networkType === '104') {
        networkType = NetworkType.MAIN_NET;
    }

    if (process.env.nodeURL && process.env.servicePublicKey) {
        nftService = new NFTService(process.env.nodeURL, process.env.servicePublicKey, networkType);
        purchaseService = new PurchaseService(process.env.nodeURL, process.env.servicePublicKey, networkType);
    } else {
        nftService = new NFTService('https://001-joey-dual.symboltest.net:3001', '91E17F50B6864293D3E3BD9A667D38DC11773D16A89EE13FA93DB06998B12416', networkType);
        purchaseService = new PurchaseService('https://001-joey-dual.symboltest.net:3001', '91E17F50B6864293D3E3BD9A667D38DC11773D16A89EE13FA93DB06998B12416', networkType);
    }

    const service: Dependencies = {
        nftService,
        purchaseService
    }

    inject('service', service);
}

export default myPlugin