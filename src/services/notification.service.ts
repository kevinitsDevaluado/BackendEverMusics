import {NotificationDatasource} from '../datasources/notification.datasource';
import {SmsNotification} from '../models';
import {EmailNotification} from '../models/email-notification.model';


const twilio = require('twilio');
const sgMail = require('@sendgrid/mail');

export class NotificationService{
  async SmsNotification(notification: SmsNotification): Promise<boolean>{
    try {
      const client = twilio(NotificationDatasource.accountSid, NotificationDatasource.authToken);
      await client.messages.create({
        body: notification.body,
        to: notification.to,
        from: NotificationDatasource.fromSMS
      }).then((res: any) => {
        console.log(res);
      });
      return true;
    } catch (error) {
      return false;
    }

  }

  async MailNotification(notification: EmailNotification): Promise<boolean>{

    try {
      sgMail.setApiKey(NotificationDatasource.SENDGRID_API_KEY);
      const msg = {
        to: notification.to, // Change to your recipient
        from: NotificationDatasource.SENDGRID_FROM, // Change to your verified sender
        subject: notification.subject,
        text: notification.textbody,
        html: notification.htmlbody,
      };
      await sgMail.send(msg).then((data:any) => {
        console.log(data);
        return true;
      }, function(error : any){
        console.log(error);
        return false;
      });
      return true;
    } catch (err) {
      return false;
    }
  }
}
