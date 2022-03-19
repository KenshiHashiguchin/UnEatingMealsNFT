import express from 'express'
import {NFTService, NFTServiceInterface} from "../services/NFTService";
import {MosaicId, NetworkType} from "symbol-sdk";
import {Meal} from "~/models/Meal";
import {MealService} from "../services/MealService";

const app = express();

app.get("/get/meal", async function (req: express.Request, res: express.Response) {
    if (req.query.meal_id) {
        const mosaicId = new MosaicId(req.query.meal_id as string);

        let nftService: NFTServiceInterface;
        let networkType = NetworkType.TEST_NET;

        if (process.env.NETWORK_TYPE === '104') {
            networkType = NetworkType.MAIN_NET;
        }
        let servicePubKey = '5060164132F7CD142D483AE2B5A10FD723F699AC86E58982E86ED04F8C3372A5';
        if (process.env.NODE_URL && process.env.SERVICE_PUBLIC_KEY) {
            nftService = new NFTService(process.env.NODE_URL, process.env.SERVICE_PUBLIC_KEY, networkType);
            servicePubKey = process.env.SERVICE_PUBLIC_KEY;
        } else {
            nftService = new NFTService('https://001-joey-dual.symboltest.net:3001', '91E17F50B6864293D3E3BD9A667D38DC11773D16A89EE13FA93DB06998B12416', networkType);
        }
        // // meal構築
        // console.log(nftService.getNetworkType());
        const agg = await nftService.getAggregateTransactionByMosaicId(mosaicId);

        if (agg) {
            let meal: Meal = {
                mosaicId: mosaicId,
                aggregateTransaction: agg,
            }
            const mealService = new MealService(meal, nftService.getRepositoryFactoryHttp(), servicePubKey, networkType);
            const svg = await mealService.getSVGStruct();
            meal.svg = svg;
            let mealSvg = await mealService.getSVG({background: false, wearable: true});

            // 方向
            let directionStyle: string = '';
            if (req.query.direction as string === 'left') {
                directionStyle = `<style>.front{display: none} .right{display: none} .left{display: inline} .back{display: none}</style>`;
            } else if (req.query.direction as string === 'right') {
                directionStyle = `<style>.front{display: none} .right{display: inline} .left{display: none} .back{display: none}</style>`;
            } else if (req.query.direction as string === 'back') {
                directionStyle = `<style>.front{display: none} .right{display: none} .left{display: none} .back{display: inline}</style>`;
            } else {
                directionStyle = `<style>.front{display: inline} .right{display: none} .left{display: none} .back{display: none}</style>`;
            }

            // </svg>
            mealSvg = mealSvg?.slice(0, mealSvg?.length - 6) + directionStyle + `</svg>`;

            res.header("Content-Type", "application/xml");
            res.status(200).send(mealSvg);
        }
    }
});

// module.exports = {
//     path: "/server/",
//     handler: app
// };

module.exports = app;