import {repository} from '@loopback/repository'
import {ServiceKeys as keys} from '../keys/services-keys';
import {PasswordKeys as passKeys} from '../keys/password-keys';
import {generate as passGenerator} from 'generate-password';

import {AuthenticatedUser, User} from '../models';
import {ShoppingCartRepository, UserRepository} from '../repositories'
import {EncryptDecrypt} from './encrypt-decrypt.service';

import {generate as generator } from 'generate-password'
const jwt = require('jsonwebtoken');
export class AuthService{
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(ShoppingCartRepository)
    public cartRepository: ShoppingCartRepository
  ){

  }
  /**
   *
   * @param username
   * @param password
   */
  async Identity(username:string,password:string): Promise<AuthenticatedUser | false>{
    //console.log('username: ${username} - password: ${password}');
    let user = await this.userRepository.findOne({where: {username: username}});
    if(user){
      let cryptPass = new EncryptDecrypt(keys.LOGIN_CRYPT_METHOD).Encrypt(password);
      if (user.password == cryptPass) {
        let cart = await this.cartRepository.findOne({where: {customerId: user.customerId}})
        return new AuthenticatedUser({
          id: user.id,
          cartId: cart?.id,
          customerId: user.customerId,
          role: user.role,
          username: user.username
        });
      }
    }
    return false;
  }
  async VerifyUserToChangePassword(id: string, currentPassword: string): Promise<User | false> {
    let user = await this.userRepository.findById(id);
    if (user) {
      let encryptPass = new EncryptDecrypt(keys.LOGIN_CRYPT_METHOD).Encrypt(currentPassword);
      if (user.password == encryptPass) {
        return user;
      }
    }
    return false;
  }
  /**
   * Realizamos los cambios de contraseña
   * @param user
   * @param newPassword
   * @returns
   */
  async ChangePassword(user: User, newPassword: string): Promise<boolean> {
    try {
      let encryptPass = new EncryptDecrypt(keys.LOGIN_CRYPT_METHOD).Encrypt(newPassword);
      user.password = encryptPass;
      await this.userRepository.updateById(user.id, user);
      return true;
    } catch (_) {
      return false;
    }
  }

  async GenerateRandomPassword() {
    let randomPassword = passGenerator({
      length: passKeys.LENGTH,
      numbers: passKeys.NUMBERS,
      uppercase: passKeys.UPPERCASE,
      lowercase: passKeys.LOWERCASE
    });
    return randomPassword;
  }
  /**
   *
   * @param user
   */
  async GenerateToken(user:AuthenticatedUser){

    let secretKey = keys.JWT_SECRET_KEY;
    return jwt.sign({
      exp: keys.TOKEN_EXPIRATION_TIME,
      data: {
        _id: user.id,
        username: user.username,
        role: user.role,
        paternId: user.customerId,
        cartId: user.cartId
      }
    },
      secretKey);
  }
  /**
   *
   * @param token
   */
  async VerifyToken(token:string){
    try {
      console.log("Token in verify token" + token);

      let data = jwt.verify(token,keys.JWT_SECRET_KEY);
      console.log("data verification");
      console.log(data);
      return data;
    } catch (error) {
      //console.log("error");
      return false;
    }
  }
  /**
   *
   * RESET THE USER PASSWORD IT IS MISSING
   * @param username
   */
  //METHODO PARA RESETEAR LA CONTRASEÑA
  async ResetPassword(username:string): Promise<string | false> {
    let user = await this.userRepository.findOne({where: {username:username}});
    if (user){
      let randomPassword = generator({
        length: passKeys.LENGTH,
        numbers: passKeys.NUMBERS,
        lowercase: passKeys.LOWERCASE,
        uppercase: passKeys.UPPERCASE,

      });
      let crypter = new EncryptDecrypt(keys.LOGIN_CRYPT_METHOD);
      let password = crypter.Encrypt(crypter.Encrypt(randomPassword));
      user.password = password;
      this.userRepository.replaceById(user.id, user);
      return randomPassword;
    }
    return false;
  }
  /**
   *
   * @param id PARA REALIZAR LA VERIFICACION PARA CHANGE OF PASSWOORD
   * @param currentPassword
   */
  /*
   async VerifyUserToChangePassword(id: string, currentPassword: string): Promise<User | false> {
    let user = await this.userRepository.findById(id);
    if (user) {
      let encryptPass = new EncryptDecrypt(keys.LOGIN_CRYPT_METHOD).Encrypt(currentPassword);
      if (user.password == encryptPass) {
        return user;
      }
    }
    return false;
  }

  async ChangePassword(user: User, newPassword: String): Promise<boolean> {
    try {
      let encryptPass = new EncryptDecrypt(keys.LOGIN_CRYPT_METHOD).Encrypt(newPassword);
      user.password = encryptPass;
      await this.userRepository.updateById(user.id, user);
      return true;
    } catch (_) {
      return false;
    }
  }
  */

}
