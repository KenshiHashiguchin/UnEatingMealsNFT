import {Action, Module, Mutation, VuexModule} from "vuex-module-decorators";
import {$axios} from '~/utils/api';
import moment from "moment";
import Vue from "vue";

@Module({
    name: 'auth',
    stateFactory: true,
    namespaced: true,
})
export default class AuthModule extends VuexModule {
    private authUser: any;
    private authToken: any;
    private isAuthenticated: any;

    public get getAuthUser()
    {
        return this.authUser;
    }

    public get getAuthToken()
    {
        return this.authToken;
    }

    public get getIsAuthenticated()
    {
        console.log(this.isAuthenticated);
        return this.isAuthenticated;
    }

    @Mutation
    private SET_USER(user: any) {
        this.authUser = user
    }

    @Mutation
    private SET_AUTH_TOKEN(token: any) {
        this.authToken = token
    }

    @Mutation
    private SET_AUTHENTICATE(isAuthenticated: any) {
        this.isAuthenticated = isAuthenticated
    }

    @Mutation
    private UPDATE_ADDRESS_ENCRYPTION_PRIVATE_KEY(data: {address: string, encryption_private_key: string}) {
        Vue.set(this.authUser, 'address', data.address);
        Vue.set(this.authUser, 'encryption_private_key', data.encryption_private_key);
    }

    @Action
    public async setAuthConfig(data: any): Promise<string> {
        $axios.setToken(data.jwt, 'Bearer')

        this.SET_AUTH_TOKEN(data.jwt);
        this.SET_USER({id: data.id, email: data.email, name: data.name, exp: data.exp, address: data.address, encryption_private_key: data.encryption_private_key});
        this.SET_AUTHENTICATE(true);
        return data.jwt;
    }

    @Action
    public updateAddressAndEncryptionPrivateKey(data: {address: string, encryption_private_key: string}) {
        this.UPDATE_ADDRESS_ENCRYPTION_PRIVATE_KEY(data);
    }

    @Action
    public async checkAuthenticated(): Promise<boolean> {
        if (this.isAuthenticated) {
            return true;
        }
        return await this.fetchUser();
    }

    @Action
    public async fetchUser(): Promise<boolean> {
        await $axios.get('/api/auth/me').then((res) => {
            // 有効期限検証
            if (moment().isBefore(moment(res.data.exp * 1000))) {
                this.SET_USER(res.data);
                this.SET_AUTHENTICATE(true);
                return true;
            } else {
                this.SET_USER(null);
                this.SET_AUTHENTICATE(false);
                this.SET_AUTH_TOKEN(null);
                return false;
            }
        }).catch(() => {
            this.SET_USER(null);
            this.SET_AUTHENTICATE(false);
            this.SET_AUTH_TOKEN(null);
            return false;
        })
        return false;
    }

    @Action
    public logout() {
        // TODO cookie削除
        // this.$cookies.remove('token')
        this.SET_AUTHENTICATE(false);
        this.SET_USER(null);
        this.SET_AUTH_TOKEN(null);
    }
}
