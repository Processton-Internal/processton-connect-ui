import axios from 'axios';
import AuthorizationService, {Config} from './AuthorizationService';

const apiGateway = axios.create({
    baseURL: `${Config.cenitHost}/api/v3`,
    timeout: Config.timeoutSpan
});

//const ApiCache = {};

export const ApiResource = function () {

    let args = Array.prototype.slice.call(arguments).flat(), params = args[args.length - 1], headers, size;

    if (params && params.constructor === Object) {
        params = args.pop();
        headers = params.headers;
        if (headers &&
            headers.constructor === Object &&
            ((size = Object.keys(params).length) === 1 || (size === 2 && params.params && params.params.constructor === Object))) {
            params = params.params || {}
        } else {
            headers = {}
        }
    } else {
        headers = params = {};
    }

    this.path = '/' + args.join('/');

    this.get = () => {
        return new Promise(
            (resolve, reject) => {
                AuthorizationService.getAccessToken()
                    .then(
                        access_token => {
                            apiGateway.get(this.path, {
                                headers: { 'Authorization': 'Bearer ' + access_token, ...headers },
                                params: params
                            })
                                .then(response => resolve(response.data))
                                .catch(error => reject(error))
                        }
                    )
                    .catch(error => reject(error))
            }
        );
    };

    this.post = (data) => {
        return new Promise(
            (resolve, reject) => {
                AuthorizationService.getAccessToken()
                    .then(
                        access_token => {
                            apiGateway.post(this.path, data, {
                                headers: { 'Authorization': 'Bearer ' + access_token, ...headers },
                                parameters: params
                            })
                                .then(response => resolve(response.data))
                                .catch(error => reject(error))
                        }
                    )
                    .catch(error => reject(error))
            }
        );
    };
};

const ErrorCallbacks = [];

const API = {
    get: async (...args) => {
        try {
            return await (new ApiResource(...args)).get()
        } catch (e) {
            ErrorCallbacks.forEach(callback => callback(e));
        }
    },

    post: async (...args) => {
        try {
            const data = args.pop();
            return await (new ApiResource(...args)).post(data);
        } catch (e) {
            ErrorCallbacks.forEach(callback => callback(e));
        }
    },

    onError: callback => ErrorCallbacks.push(callback)
}
;

export default API;