import {Provider, inject, ValueOrPromise} from '@loopback/context';
import {Strategy} from 'passport';
import {
  AuthenticationBindings,
  AuthenticationMetadata,

} from '@loopback/authentication';
import {BasicStrategy} from 'passport-http';
import {repository} from '@loopback/repository';
import {AuthService} from '../services/auth.service';
import {UserRepository} from '../repositories';
import {Strategy as BearerStrategy} from 'passport-http-bearer'

export class MyAuthStrategyProvider implements Provider<Strategy | undefined> {
  AuthService: AuthService;
  constructor(
    @inject(AuthenticationBindings.METADATA)
    private metadata: AuthenticationMetadata,
    @repository(UserRepository)
    public userRepository: UserRepository
  ) {
    this.AuthService = new AuthService(userRepository);
  }

  value(): ValueOrPromise<Strategy | undefined> {
    // The function was not decorated, so we shouldn't attempt authentication
    if (!this.metadata) {
      return undefined;
    }

    const name = this.metadata.strategy;
    switch (name) {
    case 'BasicStrategy':
      return new BasicStrategy(this.verifyUser.bind(this));
    case 'TokenAdminStrategy':
      return new BearerStrategy(this.verifyAdminToken.bind(this));
    case 'TokenCustomerStrategy':
    return new BearerStrategy(this.verifyCustomerToken.bind(this));
    default:
      return Promise.reject(`The strategy ${name} is not available.`);
    }
  }

  verifyUser(
    username: string,
    password: string,
    cb: (err: Error | null, user?: object | false) => void,
  ) {

    let user = this.AuthService.Identity(username,password);
    return cb(null, user);
  }
  verifyToken(
    token: string,
    cb: (err: Error | null, user?: object | false) => void,
  ) {

    this.AuthService.VerifyToken(token).then(verification => {
      if (verification) {
        return cb(null, verification);
      }
      return cb(null,false);
    });
  }

  verifyCustomerToken(
    token: string,
    cb: (err: Error | null, user?: object | false) => void,
  ) {

    this.AuthService.VerifyToken(token).then(data => {
      if (data && data.role == 1) {
        return cb(null, data);
      }
      return cb(null,false);
    });
  }

  verifyAdminToken(
    token: string,
    cb: (err: Error | null, user?: object | false) => void,
  ) {

    this.AuthService.VerifyToken(token).then(data => {
      if (data && data.role == 2) {
        return cb(null, data);
      }
      return cb(null,false);
    });
  }
}
