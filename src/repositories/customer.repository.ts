import {DefaultCrudRepository, repository, HasManyRepositoryFactory, HasOneRepositoryFactory} from '@loopback/repository';
import {Customer, CustomerRelations, ShoppingCart, User} from '../models';
import {MongoDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {ShoppingCartRepository} from './shopping-cart.repository';
import {UserRepository} from './user.repository';

export class CustomerRepository extends DefaultCrudRepository<
  Customer,
  typeof Customer.prototype.id,
  CustomerRelations
> {

  public readonly shoppingCarts: HasManyRepositoryFactory<ShoppingCart, typeof Customer.prototype.id>;

  public readonly user: HasOneRepositoryFactory<User, typeof Customer.prototype.id>;

  constructor(
    @inject('datasources.mongo') dataSource: MongoDataSource, @repository.getter('ShoppingCartRepository') protected shoppingCartRepositoryGetter: Getter<ShoppingCartRepository>, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(Customer, dataSource);
    this.user = this.createHasOneRepositoryFactoryFor('user', userRepositoryGetter);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
    this.shoppingCarts = this.createHasManyRepositoryFactoryFor('shoppingCarts', shoppingCartRepositoryGetter,);
    this.registerInclusionResolver('shoppingCarts', this.shoppingCarts.inclusionResolver);
  }
}
