//npm install nodemailer
const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
    constructor(user, url){
        this.to = user.email
        this.firstName = user.name.split(' ')[0]
        this.url = url
        this.from = `Yanis <${process.env.EMAIL_FROM}>`
    }

    newTransport(){
        if (process.env.NODE_ENV === 'production'){
            return nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD
                }
            })
        }
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user:process.env.EMAIL_USERNAME,    //using trapMail
                pass:process.env.EMAIL_PASSWORD
            }
            //activate the less secure app in gmail config !!
        });

    }

    async send(template, subject){
        
        const html = pug.renderFiles(`${__dirname}/../views/emails/${template}.pug`, {
            firstName:this.firstName,
            url:this.url,
            subject
        });

        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.fromString(html)
            //html: options.,
        }
        //send the email
        await this.newTransport().sendMail(mailOptions);  
    }

    async sendWelcome(){
        await this.send('welcome', 'Welcome to the natours Family')
    }

    async sendPasswordReset(){
        await this.send('passwordReset', 'This is valid for 10 mins only !')
    }
}

