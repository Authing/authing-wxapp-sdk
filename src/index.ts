import {
  AuthenticationClient as BaseAuthenticationClient,
  AuthenticationClientOptions,
} from "authing-js-sdk";
import { encryptFunction } from "./encrypt";
import { GraphqlClient } from "./GraphqlClient";
import { HttpClient } from "./HttpClient";
import { MiniprogramTokenProvider } from "./TokenProvider";

export class AuthenticationClient extends BaseAuthenticationClient {
  constructor(options: AuthenticationClientOptions) {
    options.encryptFunction = encryptFunction;
    options.httpClient = HttpClient;
    options.graphqlClient = GraphqlClient;
    options.tokenProvider = MiniprogramTokenProvider;
    super(options);
  }

  /**
   * @description 通过 wx.login 获取到的 code 登录
   *
   */
  async loginByCode(
    code: string,
    options?: {
      iv?: string;
      encryptedData?: string;
      // wx.getUserInfo 返回的 rawData, 里面包含了原始用户数据
      rawData?: string;
    }
  ) {
    const api = `${this.options.host}/connections/social/wechat-miniprogram/auth`;
    options = options || {};
    const { iv, encryptedData, rawData } = options;
    const user = await this.httpClient.request({
      method: "POST",
      url: api,
      data: { code, iv, encryptedData, rawData },
    });
    this.tokenProvider.setUser(user);
    return user;
  }

  /**
   * @description 通过获取手机号开放组件事件登录
   *
   */
  async loginByPhone(code: string, iv: string, encryptedData: string) {
    const api = `${this.options.host}/connections/social/wechat-miniprogram/auth-by-phone`;
    const user = await this.httpClient.request({
      method: "POST",
      url: api,
      data: { code, iv, encryptedData },
    });
    this.tokenProvider.setUser(user);
    return user;
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

  async updateAvatar() {
    this.checkLoggedIn();
    const { tempFilePaths } = await wx.chooseImage({
      count: 1,
    });
    const filePath = tempFilePaths[0];
    const uploadTask = new Promise((resolve, reject) => {
      wx.uploadFile({
        url: `${this.options.host}/api/v2/upload?folder=avatar`,
        name: "file",
        filePath,
        success: (res: any) => {
          const data = JSON.parse(res.data);
          const { url } = data.data;
          resolve(url as string);
        },
        fail: reject,
      });
    });

    let url: string;
    try {
      // @ts-ignore
      url = await uploadTask;
    } catch (error) {
      throw new Error(`上传图片失败: ${error.message}`);
    }
    const user = await this.updateProfile({ photo: url });
    this.setCurrentUser(user);
    return user;
  }
}
