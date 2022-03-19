import {NuxtAxiosInstance} from '@nuxtjs/axios';
import {NuxtCookies} from "cookie-universal-nuxt";
import {AuthStore} from "~/utils/store-accessor";

let $axios: NuxtAxiosInstance;

export function initializeAxios(axiosInstance: NuxtAxiosInstance, $cookies: NuxtCookies) {
    $axios = axiosInstance
    $axios.onRequest((config) => {
        if (typeof $cookies.get('token') !== 'undefined') {
            config.headers.common.Authorization = 'Bearer ' + $cookies.get('token')
        }
        config.headers.common.Accept = 'application/json'
        if (process.env.name === 'local') {
            console.log('Making request to ' + config.url)
        }
        return config
    })

    $axios.onError((err) => {
        console.log(`Error`, err.message)
        if (err.response?.status === 401) {
          // tokenが無効になっている場合、storeをログアウト状態にしてTOPにリダレクト
          if (AuthStore.getIsAuthenticated()) {
              AuthStore.logout();
            // return redirect('/login?token=invalid')
          }
        }
        // TODO
        // if (err.response?.status === 500 || err.response?.status === 503) {
        //     // 500 と 503エラーの場合 エラーベージを表示
        //     return error({
        //         statusCode: err.response.status,
        //         message: err.response.statusText,
        //     })
        // }
    })
}

export {$axios}