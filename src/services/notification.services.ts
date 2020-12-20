import {NotificationDatasource} from '../datasources/notification.datasource';
import {SmsNotification} from '../models';
import {Twilio} from 'twilio'

const twilio = require('twilio');
export class NotificationService{
  async SmsNotification(notification: SmsNotification): Promise<boolean>{
    // Download the helper library from https://www.twilio.com/docs/node/install
    // Your Account Sid and Auth Token from twilio.com/console
    // and set the environment variables. See http://twil.io/secure

    try {
      const accountSid = NotificationDatasource.TWILIO_ID;
      const authToken = NotificationDatasource.TWILIO_AUTH_TOKEN;
      const client = twilio(accountSid, authToken);

      await client.messages
        .create({
          body: notification.body,
          from: NotificationDatasource.TWILIO_FROM,
          to: notification.to
        })
        .then((message: any) => {
          console.log(message)
        });
      return true;
    } catch (error) {
      return false;
    }
  }
}
