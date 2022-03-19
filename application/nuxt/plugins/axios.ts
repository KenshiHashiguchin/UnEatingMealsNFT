import { Plugin } from '@nuxt/types';
import { initializeAxios } from '~/utils/api';

export const accessor: Plugin = ({ $axios, $cookies }): void => {
    initializeAxios($axios, $cookies);
}

export default accessor;