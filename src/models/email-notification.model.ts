import {Model, model, property} from '@loopback/repository';

@model()
export class EmailNotification extends Model {
  @property({
    type: 'string',
    required: true,
  })
  to: string;

  @property({
    type: 'string',
    required: true,
  })
  subject: string;

  @property({
    type: 'string',
    required: true,
  })
  htmlbody: string;

  @property({
    type: 'string',
    required: true,
  })
  textbody: string;


  constructor(data?: Partial<EmailNotification>) {
    super(data);
  }
}

export interface EmailNotificationRelations {
  // describe navigational properties here
}

export type EmailNotificationWithRelations = EmailNotification & EmailNotificationRelations;
