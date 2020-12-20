// Uncomment these imports to begin using these cool features!

import {repository} from '@loopback/repository';
import {HttpErrors, post, requestBody} from '@loopback/rest';
import {UserRepository} from '../repositories';
import {AuthService} from '../services/auth.service';

// import {inject} from '@loopback/core';

class Credentials{
  username: string;
  password: string;
}

class PasswordResetData{
  username: string;
  type: number;
}

export class UserController {

  AuthService: AuthService;

  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository
  ) {
    this.AuthService = new AuthService(this.userRepository);
  }

  @post('/login',{
    responses:{
      '200':{
        description: 'Login for user'
      }
    }
  })
  async login(
    @requestBody() credentials: Credentials
  ): Promise<object> {
    let user = await this.AuthService.Identity(credentials.username,credentials.password);
    if (user){
      let tk = await this.AuthService.GenerateToken(user);
      return {
        data: user,
        token: tk
      }
    }else{
      throw new HttpErrors[401]("User or password invalid");

    }
  }


  @post('/password-reset',{
    responses:{
      '200':{
        description: 'Login for user'
      }
    }
  })
  async reset(
    @requestBody() passwordResetData: PasswordResetData
  ): Promise<boolean> {
    let randomPassword = await this.AuthService.ResetPassword(passwordResetData.username);
    if (randomPassword) {
      // enviamos un mensaje con el password
      // 1.SMS
      // 2. MAIL
      switch (passwordResetData.type) {
        case 1:
          //ENVIAR MENSAJE
          console.log("Sending sms: "+ randomPassword);
          return true;

        case 2:
        //ENVIAR MAIL
        console.log("Sending email: "+ randomPassword);
        return true;

        default:
          throw new HttpErrors[401]("this notification is not supported");
          break;
      }
    }
    throw new HttpErrors[401]("User not Fount");
  }



}
