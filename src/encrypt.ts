const { JSEncrypt } = require("./wxapp-jsencrpt.js");

export const encryptFunction = async (plainText: string, publicKey: string) => {
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(publicKey);
  const encStr = encrypt.encrypt(plainText);
  return encStr.toString();
};
