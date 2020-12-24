import {repository} from '@loopback/repository'
import {ServiceKeys as keys} from '../keys/services-keys';
import {PasswordKeys as passKeys} from '../keys/password-keys';

import {User} from '../models';
import {UserRepository} from '../repositories'
import {EncryptDecrypt} from './encrypt-decrypt.service';

import {generate as generator } from 'generate-password'
const jwt = require('jsonwebtoken');
export class AuthService{
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository
  ){

  }
  /**
   *
   * @param username
   * @param password
   */
  async Identity(username:string,password:string): Promise<User | false>{
    //console.log('username: ${username} - password: ${password}');
    let user = await this.userRepository.findOne({where: {username: username}});
    if(user){
      let cryptPass = new EncryptDecrypt(keys.LOGIN_CRYPT_METHOD).Encrypt(password);
      if (user.password == cryptPass) {
        return user;
      }
    }
    return false;
  }
  /**
   *
   * @param user
   */
  async GenerateToken(user:User){
    user.password = '';
    let token = jwt.sign({
      exp: keys.TOKEN_EXPIRATION_TIME,
      data:{
        _id: user.id,
        username: user.username,
        role: user.role,
        paterntId: user.customerId
      }
    },
    keys.JWT_SECRET_KEY);
    return token;
  }
  /**
   *
   * @param token
   */
  async VerifyToken(token:string){
    try {
      let data = jwt.verify(token,keys.JWT_SECRET_KEY);
      console.log(data);
      return data;
    } catch (error) {
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

}
