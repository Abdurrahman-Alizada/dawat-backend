import { createTransport } from "nodemailer";

export function sendVerificationEmail (email, subject, text)  {
  try {
    const transporter = createTransport({
      host: process.env.HOST,
      service: process.env.SERVICE,
      port: Number(process.env.EMAIL_PORT),
      secure: Boolean(process.env.SECURE),
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
      },
    });

    const mail_configs = {
      from: process.env.EMAIL,
      to: email,
      subject: "Account verification - Event planner app",
      html: `
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <div style="font-family:Helvetica,Arial,sans-serif;overflow:auto;line-height:2">
            <div style="margin:50px auto;width:70%;padding:20px 0">
              <div style="border-bottom:1px solid #eee">
                <tr width="100%">
                  <td align="left" bgcolor="#ffffff" style="padding:36px 24px 0;font-family:'Source Sans Pro',Helvetica,Arial,sans-serif;border-top:3px solid #d4dadf">
                    <h1 style="margin:0;font-size:32px;font-weight:700;letter-spacing:-1px;line-height:48px">Confirm Your Email Address</h1>
                  </td>
                </tr>
              </div>
              <tr>
                <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
                  <p style="margin: 0;">Tap the button below to confirm your email address. <br /> If you didn't create an account with <a href="https://play.google.com/store/apps/details?id=com.softcodes.eventplanner">Event planner app</a>, you can safely delete this email. </p>
                </td>
              </tr>
              <table border="0" style="margin-top:20px;margin-bottom:20px; " cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" bgcolor="#1a82e2" style="border-radius: 6px;">
                    <a href=${text} target="_blank" style="display: block; padding: 16px 36px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px;">Verify</a>
                  </td>
                </tr>
              </table>
              <p style="font-size:.9em">Regards, <br>
              </p>
              <a href="https://play.google.com/store/apps/details?id=com.softcodes.eventplanner" style="font-size:1em;color:#00466a;text-decoration:none;font-weight:600">Event planner app team</a>
              <hr style="border:none;border-top:1px solid #eee">
            </div>
          </div>
        </body>
      </html>
            `,
    };

    transporter.sendMail(mail_configs, function (error, info) {
      if (error) {
        console.log(error);
        return reject({ message: `An error has occured` });
      }
      return resolve({ message: "Email sent succesfuly" });
    });
    console.log("email sent successfully");
  } catch (error) {
    console.log("email not sent!");
    // console.log(error);
    return error;
  }
};

export function sendRecoveryEmail({ recipient_email, OTP }) {
  try {
    const transporter = createTransport({
      service: process.env.SERVICE,
      host: process.env.HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: Boolean(process.env.SECURE),
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
      },
    });

    const mail_configs = {
      from: process.env.EMAIL,
      to: recipient_email,
      subject: "Password recovery - Event planner app",
      html: `
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <!-- partial:index.partial.html -->
          <div style="font-family: Helvetica,Arial,sans-serif;overflow:auto;line-height:2">
            <div style="margin:50px auto;width:70%;padding:20px 0">
              <p style="font-size:1.1em">Hi,</p>
              <p>Forgot your password. <br /> We received a request to reset password for your account. To reset your password use the following code to complete your Password Recovery Procedure. </p>
              <p style="margin-bottom:20px">The code will expire in 10 minutes.</p>
              <h2 style="background: #00466a;margin: 30 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${OTP}</h2>
              <p style="font-size:.9em;margin-top:30px">Regards, <br>
              </p>
              <a href="https://play.google.com/store/apps/details?id=com.softcodes.eventplanner" style="font-size:1em;color:#665a6f;text-decoration:none;font-weight:600">Event planner app team</a>
              <hr style="border:none;border-top:1px solid #eee">
              <p style="margin-bottom:30px">*Note: If you didn't request OTP for password recovery in <a href="https://play.google.com/store/apps/details?id=com.softcodes.eventplanner">Event planner app</a>, you can safely delete this email.. </p>
            </div>
          </div>
          <!-- partial -->
        </body>
      </html>
      `,
    };

    transporter.sendMail(mail_configs, function (error, info) {
      if (error) {
        console.log(error);
        return reject({ message: `An error has occured` });
      }
      return resolve({ message: "Email sent succesfuly" });
    });
  } catch (error) {
    console.log("email not sent!");
    // console.log(error);
    return error;
  }
}

export function sendPasswordResetSuccessfullyEmail({ recipient_email }) {
  try {
    const transporter = createTransport({
      service: process.env.SERVICE,
      host: process.env.HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: Boolean(process.env.SECURE),
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
      },
    });

    const mail_configs = {
      from: process.env.EMAIL,
      to: recipient_email,
      subject: "Password reset successfully - Event planner app",
      html: `
      <!DOCTYPE html>
        <html lang="en">
          <body>
            <!-- partial:index.partial.html -->
            <div style="font-family: Helvetica,Arial,sans-serif;overflow:auto;line-height:2">
              <div style="margin:50px auto;width:70%;padding:20px 0">
                <p style="font-size:1.1em">Hi,</p>
                <p> Your password has been reset. <br />If you did not request for password reset, please let us know immediately by replying to this email. Or change your password in <a href="https://play.google.com/store/apps/details?id=com.softcodes.eventplanner">Event planner app</a>
                </p>
                <p style="font-size:.9em;margin-top:30px">Regards, <br>
                </p>
                <a href="https://play.google.com/store/apps/details?id=com.softcodes.eventplanner" style="font-size:1em;color:#665a6f;text-decoration:none;font-weight:600">Event planner app team</a>
                <hr style="border:none;border-top:1px solid #eee">
              </div>
            </div>
            <!-- partial -->
          </body>
        </html>

      `,
    };

    transporter.sendMail(mail_configs, function (error, info) {
      if (error) {
        console.log(error);
        return reject({ message: `An error has occured` });
      }
      return resolve({ message: "Email sent succesfuly" });
    });
  } catch (error) {
    console.log("email not sent!");
    // console.log(error);
    return error;
  }
}