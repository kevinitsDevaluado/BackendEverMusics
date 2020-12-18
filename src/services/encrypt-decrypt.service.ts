import{ServiceKeys as keys} from "../keys/services-keys"
const CryptoJS = require("crypto-js");

export class EncryptDecrypt{
  type: string;
  constructor(type: string){
    this.type = type;
  }

  Encrypt(text: string){
    switch(this.type){
      case keys.MD5:
        return CryptoJS.MD5(text).toString();
        break;
      case keys.AES:
        return CryptoJS.AES.encrypt(text,keys.AES_SECRET_KEY).toString();
        break;
      case 'sha512':
        return CryptoJS.MD5(text).toString();
        break;
      default:
        return "This type of crypt is not supported"
        break;
    }
  }
}
