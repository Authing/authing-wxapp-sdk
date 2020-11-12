import { AuthenticationClientOptions, User } from "authing-js-sdk";

const tokenKey = "_authing_token";
const userKey = "_authing_user";

export class MiniprogramTokenProvider {
  options: AuthenticationClientOptions;

  constructor(options: AuthenticationClientOptions) {
    this.options = options;
  }

  setToken(token: string) {
    wx.setStorageSync(tokenKey, token);
  }

  getToken() {
    return wx.getStorageSync(tokenKey);
  }

  getUser(): User | null {
    return wx.getStorageSync(userKey);
  }

  setUser(user: User) {
    wx.setStorageSync(userKey, user);
    wx.setStorageSync(tokenKey, user.token as string);
  }

  clearUser() {
    wx.removeStorageSync(userKey);
    wx.removeStorageSync(tokenKey);
  }
}
