import {
  AuthenticationClient as BaseAuthenticationClient,
  AuthenticationClientOptions,
} from "authing-js-sdk";
import { encryptFunction } from "./encrypt";
import { GraphqlClient } from "./GraphqlClient";
import { HttpClient } from "./HttpClient";

export class AuthenticationClient extends BaseAuthenticationClient {
  constructor(options: AuthenticationClientOptions) {
    options.encryptFunction = encryptFunction;
    options.httpClient = HttpClient;
    options.graphqlClient = GraphqlClient;
    super(options);
  }

  /**
   * @description 通过 wx.login 获取到的 code 登录
   *
   */
  async loginByCode(
    code: string,
    options: {
      iv?: string;
      encryptedData?: string;
      phone?: string;
      // wx.getUserInfo 返回的 rawData, 里面包含了原始用户数据
      rawData?: string;
    }
  ) {
    const api = `${this.options.host}/connections/social/wechat-miniprogram/auth`;
    const { iv, encryptedData, phone, rawData } = options;
    const data = await this.httpClient.request({
      method: "POST",
      url: api,
      data: { code, iv, encryptedData, phone, rawData },
    });
    return data;
  }

  /**
   * @description 通过获取手机号开放组件事件登录
   *
   */
  async loginByPhone(code: string, iv: string, encryptedData: string) {
    const api = `${this.options.host}/connections/social/wechat-miniprogram/auth-by-phone`;
    const data = await this.httpClient.request({
      method: "POST",
      url: api,
      data: { code, iv, encryptedData },
    });
    return data;
  }

  /**
   * @description 获取用户的手机号
   *
   */
  async getPhone(code: string, iv: string, encryptedData: string) {
    const api = `${this.options.host}/connections/social/wechat-miniprogram/getphone`;
    const data = await this.httpClient.request({
      method: "POST",
      url: api,
      data: { code, iv, encryptedData },
    });
    return data;
  }
}
