import {Context, Middleware} from '@nuxt/types'
import {AuthStore} from "~/utils/store-accessor";

const checkAuthorize: Middleware = (context: Context) => {
    // 除外URL
    const authNotRequiredPathList = [
        '/',
        '/market',
        '/minigame',
        '/minigame/ranking',

        '/server/get/meal',
        '/get/meal',
        '/debug/setEquipment',
        '/test',
        '/test/setEquipment',
    ];

    const inAuthRequiredPath = authNotRequiredPathList.every(
        (path) => context.route.path !== path
    )

    // if (!AuthStore.getIsAuthenticated) {
    if (!context.store.state.auth.isAuthenticated) {
        if (inAuthRequiredPath) {
            return context.redirect(
                `/?to=${encodeURIComponent(context.route.fullPath)}`
            )
        }
    }
}

export default checkAuthorize
