export const NotificationDatasource = {
  /*TWILIO_FROM: process.env.TWILIO_FROM,
  TWILIO_SID: process.env.TWILIO_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  SENDGRID_FROM: process.env.SENDGRID_FROM,
  */
  fromSMS: process.env.TWILIO_FROM,
  accountSid: process.env.TWILIO_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  SENDGRID_FROM: process.env.SENDGRID_FROM,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
}
