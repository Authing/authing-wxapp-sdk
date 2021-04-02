import { AuthenticationClientOptions } from "authing-js-sdk";
import Axios from "wx-axios";
import { VERSION } from "./version";

export class GraphqlClient {
  endpoint: string;
  options: AuthenticationClientOptions;
  axios: any;

  constructor(endpoint: string, options: AuthenticationClientOptions) {
    this.endpoint = endpoint;
    this.options = options;
    this.axios = Axios.create();
  }

  async request(options: { query: string; variables?: any; token?: string }) {
    const { query, token, variables } = options;
    let headers: any = {
      "content-type": "application/json",
      "x-authing-sdk-version": `wxapp:${VERSION}`,
      "x-authing-request-from": "wxapp",
      "x-authing-app-id": this.options.appId || "",
    };
    token && (headers.Authorization = `Bearer ${token}`);
    let data = null;
    let errors = null;
    try {
      let { data: responseData } = await this.axios({
        url: this.endpoint,
        data: {
          query,
          variables,
        },
        method: "post",
        headers,
        timeout: this.options.timeout,
      });
      data = responseData.data;
      errors = responseData.errors;
    } catch (error) {
      this.options.onError && this.options.onError(500, "网络请求错误", null);
      throw { code: 500, message: "网络请求错误", data: null };
    }

    if (errors?.length > 0) {
      let errmsg = null;
      let errcode = null;
      let data = null;
      errors.map((err: any) => {
        const { message: msg } = err;
        const { code, message, data: _data } = msg;
        errcode = code;
        errmsg = message;
        data = _data;
        this.options.onError && this.options.onError(code, message, data);
      });
      throw { code: errcode, message: errmsg, data };
    }

    return data;
  }
}
