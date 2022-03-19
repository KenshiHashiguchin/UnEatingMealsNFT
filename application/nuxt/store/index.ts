import { ActionTree, Store } from 'vuex'
import { ActionContext } from 'vuex/types'
import { initialiseStores } from '~/utils/store-accessor'

export const state = () => ({})
export type RootState = ReturnType<typeof state>

const initializer = (store: Store<any>) => initialiseStores(store)

export const actions: ActionTree<any, any> = {
    nuxtServerInit: async (context: ActionContext<RootState, RootState>) => {
        await context.dispatch('auth/checkAuthenticated', null, {root: true})
    },
}

export const plugins = [initializer]
export * from '~/utils/store-accessor'
