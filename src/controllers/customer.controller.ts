import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  HttpErrors,
} from '@loopback/rest';
import {Customer, EmailNotification, ShoppingCart, User} from '../models';
import {CustomerRepository, ShoppingCartRepository, UserRepository} from '../repositories';
import{EncryptDecrypt} from '../services/encrypt-decrypt.service';
import{ServiceKeys as keys} from '../keys/services-keys';
import{generate} from 'generate-password';
import {PasswordKeys} from '../keys/password-keys';
import {NotificationService} from '../services/notification.service';
import {AuthService} from '../services/auth.service';

export class CustomerController {
  authService: AuthService;
  constructor(
    @repository(CustomerRepository)
    public customerRepository : CustomerRepository,

    @repository(UserRepository)
    public UserRepository : UserRepository,

    @repository(ShoppingCartRepository)
    public shoppingCartRepository: ShoppingCartRepository
  ) {

    this.authService = new AuthService(this.UserRepository, shoppingCartRepository);

  }

  @post('/customer', {
    responses: {
      '200': {
        description: 'Customer model instance',
        content: {'application/json': {schema: getModelSchemaRef(Customer)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Customer, {
            title: 'NewCustomer',
            exclude: ['id'],
          }),
        },
      },
    })
    customer: Omit<Customer, 'id'>,
  ): Promise<Customer> {

    let userExits = await this.customerRepository.findOne({where: {document: customer.document}});
    if (userExits) {
      throw new HttpErrors[403];
    }

    let s = await this.customerRepository.create(customer);
    //GENERO LA CONTRASEÑA ALEATORIA
    let randomPassword = generate({
      length: PasswordKeys.LENGTH,
      numbers: PasswordKeys.NUMBERS,
      lowercase: PasswordKeys.LOWERCASE,
      uppercase: PasswordKeys.UPPERCASE,

    });
    //ENCRYPTO LA CONTRASEÑA
    let password1 = new EncryptDecrypt(keys.MD5).Encrypt(randomPassword);
    let password2 = new EncryptDecrypt(keys.MD5).Encrypt(password1);
    //CREAMOS EL USUARIO
    let u = {
      username: s.document,
      password: password2,
      role: 1,
      customerId: s.id
    };
    let user = await this.UserRepository.create(u);

    let shoppingCart = new ShoppingCart({
      code: `${randomPassword}-${Date.now()}`,
      createdDate: new Date(),
      customerId: s.id
    });
    await this.shoppingCartRepository.create(shoppingCart);

    let notification = new EmailNotification({
      //textbody:'loco',
      textbody: `Hola!! ${s.name} ${s.lastname}, Haz creado una cuenta te damos la Bienvenida a nombre de Nuestra Empresa EVERMUSIC, su usuario es su Documento de identidad y su contraseña es: ${randomPassword}`,
      htmlbody: `Hola!! ${s.name} ${s.lastname},  <br/> Haz creado una cuenta te damos la Bienvenida a nombre de Nuestra Empresa EVERMUSIC, su usuario es su Documento de identidad y su contraseña es:  <strong> ${randomPassword}</strong>`,
      to: s.email,
      subject:'Nueva Cuenta'
    });

    await new NotificationService().MailNotification(notification);
    console.log(randomPassword);
    user.password = "",
    s.user = user;
    return s;
  }

  @get('/customer/count', {
    responses: {
      '200': {
        description: 'Customer model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.where(Customer) where?: Where<Customer>,
  ): Promise<Count> {
    return this.customerRepository.count(where);
  }

  @get('/customer', {
    responses: {
      '200': {
        description: 'Array of Customer model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Customer, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(Customer) filter?: Filter<Customer>,
  ): Promise<Customer[]> {
    return this.customerRepository.find(filter);
  }

  @patch('/customer', {
    responses: {
      '200': {
        description: 'Customer PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Customer, {partial: true}),
        },
      },
    })
    customer: Customer,
    @param.where(Customer) where?: Where<Customer>,
  ): Promise<Count> {
    return this.customerRepository.updateAll(customer, where);
  }

  @get('/customer/{id}', {
    responses: {
      '200': {
        description: 'Customer model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Customer, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Customer, {exclude: 'where'}) filter?: FilterExcludingWhere<Customer>
  ): Promise<Customer> {
    return this.customerRepository.findById(id, filter);
  }

  @patch('/customer/{id}', {
    responses: {
      '204': {
        description: 'Customer PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Customer, {partial: true}),
        },
      },
    })
    customer: Customer,
  ): Promise<void> {
    await this.customerRepository.updateById(id, customer);
  }

  @put('/customer/{id}', {
    responses: {
      '204': {
        description: 'Customer PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() customer: Customer,
  ): Promise<void> {
    let u = await this.UserRepository.findOne({where: {customerId: customer.id}});
    if (u) {
      u.username = customer.document;
      await this.UserRepository.replaceById(u.id,u);
    }
    await this.customerRepository.replaceById(id, customer);

  }

  @del('/customer/{id}', {
    responses: {
      '204': {
        description: 'Customer DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.customerRepository.deleteById(id);
  }
}
