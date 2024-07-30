import SibApiV3Sdk from '@getbrevo/brevo';

function sendEmailForVerificationCode(to, code) {
    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let apiKey = apiInstance.authentications['apiKey'];
    apiKey.apiKey = process.env.BREVO_API_KEY;
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = "{{params.subject}}";
    sendSmtpEmail.htmlContent = `<html><body><h1>Your verification code is {{params.parameter}}</h1></body></html>`;
    sendSmtpEmail.sender = { "name": process.env.BREVO_NAME + process.env.BREVO_SURNAME, "email": process.env.BREVO_EMAIL };
    sendSmtpEmail.to = [{ "email": to }];
    sendSmtpEmail.headers = { "Some-Custom-Name": "unique-id-1234" };
    sendSmtpEmail.params = { "parameter": code, "subject": "Verification code for B" };

    apiInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
    }, function (error) {
        console.error(error);
    });
};

function sendEmailForResetPassword(to, token) {
    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let apiKey = apiInstance.authentications['apiKey'];
    apiKey.apiKey = process.env.BREVO_API_KEY;
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = "{{params.subject}}";
    sendSmtpEmail.htmlContent = `<html><body><h1>Your reset password link is <a href="{{params.parameter}}">Click here</a></h1></body></html>`;
    sendSmtpEmail.sender = { "name": process.env.BREVO_NAME + process.env.BREVO_SURNAME, "email": process.env.BREVO_EMAIL };
    sendSmtpEmail.to = [{ "email": to }];
    sendSmtpEmail.headers = { "Some-Custom-Name": "unique-id-1234" };
    sendSmtpEmail.params = { "parameter": `/reset-password/${token}`, "subject": "Verification code for B" };

    apiInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
    }, function (error) {
        console.error(error);
    });
};

export {
    sendEmailForVerificationCode,
    sendEmailForResetPassword
};