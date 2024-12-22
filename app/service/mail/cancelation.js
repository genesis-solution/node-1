const transporter = require("../../config/mailer");

module.exports = {
    async sendEmailCancelationToOwner({ email, hostName, spotName, bookingDate }) {
        const html = `
        <head>
        <style>
          body {
            background: #f9f9f9;
            font-family: "Ubuntu", sans-serif;
          }
    
          .container {
            max-width: 640px;
            margin: 0 auto;
            background: #ffffff;
            box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.1);
            border-radius: 4px;
            overflow: hidden;
          }
    
          .header {
            background: #7289da top center / cover no-repeat;
            text-align: center;
            padding: 47px;
            color: white;
            font-family: "Whitney", sans-serif;
            font-size: 24px;
            font-weight: 600;
            line-height: 36px;
          }
    
          .content {
            padding: 40px 18px;
            text-align: left;
          }
    
          .content h2 {
            font-family: "Whitney", sans-serif;
            font-weight: 500;
            font-size: 20px;
            color: #4f545c;
            letter-spacing: 0.27px;
          }
    
          .content p {
            color: #737f8d;
            font-family: "Whitney", sans-serif;
            font-size: 16px;
            line-height: 24px;
            margin-bottom: 20px;
          }
    
          .content p span {
            display: block;
            text-align: left;
          }
    
          .button {
            text-align: center;
            margin-top: 10px;
          }
    
          .button a {
            text-decoration: none;
            line-height: 100%;
            background: #7289da;
            color: white;
            font-family: "Ubuntu", sans-serif;
            font-size: 15px;
            font-weight: normal;
            text-transform: none;
            padding: 15px 19px;
            border-radius: 3px;
            cursor: pointer;
          }
    
          .footer {
            text-align: center;
            padding: 20px 0px;
            color: #99aab5;
            font-family: "Whitney", sans-serif;
            font-size: 12px;
            line-height: 24px;
          }
        </style>
      </head>
    
      <body>
        <div class="container">
          <div class="header"></div>
          <div class="content">
            <h2>Dear ${hostName},</h2>
            <p>
              We regret to inform you that a guest has canceled their booking for
              ${spotName} on ${bookingDate}.
            </p>
            <p>
              Please log in to your AppiSpot host dashboard for more details and to
              manage the availability of your space accordingly.
            </p>
            <p>
              If you have any questions or need assistance, please reach out to our
              support team.
            </p>
            <p>Thank you for your understanding.</p>
            <p>Best regards, <br>The AppiSpot Support Team</p>
    
    
          </div>
          <div class="footer">Sent by appispot</div>
        </div>
      </body>
      `;

        const mailOptions = {
            
            to: email,
            subject: 'Booking Cancellation',
            html,
        };
        return await transporter.support.sendMail(mailOptions);
    },
    async sendEmailCancelationToGuest({ email, guestName, spotName, bookingDate }) {
        const html = `
        <head>
        <style>
          body {
            background: #f9f9f9;
            font-family: "Ubuntu", sans-serif;
          }
    
          .container {
            max-width: 640px;
            margin: 0 auto;
            background: #ffffff;
            box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.1);
            border-radius: 4px;
            overflow: hidden;
          }
    
          .header {
            background: #7289da top center / cover no-repeat;
            text-align: center;
            padding: 47px;
            color: white;
            font-family: "Whitney", sans-serif;
            font-size: 24px;
            font-weight: 600;
            line-height: 36px;
          }
    
          .content {
            padding: 40px 18px;
            text-align: left;
          }
    
          .content h2 {
            font-family: "Whitney", sans-serif;
            font-weight: 500;
            font-size: 20px;
            color: #4f545c;
            letter-spacing: 0.27px;
          }
    
          .content p {
            color: #737f8d;
            font-family: "Whitney", sans-serif;
            font-size: 16px;
            line-height: 24px;
            margin-bottom: 20px;
          }
    
          .content p span {
            display: block;
            text-align: left;
          }
    
          .button {
            text-align: center;
            margin-top: 10px;
          }
    
          .button a {
            text-decoration: none;
            line-height: 100%;
            background: #7289da;
            color: white;
            font-family: "Ubuntu", sans-serif;
            font-size: 15px;
            font-weight: normal;
            text-transform: none;
            padding: 15px 19px;
            border-radius: 3px;
            cursor: pointer;
          }
    
          .footer {
            text-align: center;
            padding: 20px 0px;
            color: #99aab5;
            font-family: "Whitney", sans-serif;
            font-size: 12px;
            line-height: 24px;
          }
        </style>
      </head>
    
      <body>
        <div class="container">
          <div class="header">Booking Cancellation</div>
          <div class="content">
    
            <h2>Dear ${guestName},</h2>
            <p>Your booking for ${spotName} on ${bookingDate} has been canceled successfully.</p>
            <p>If you have any questions or need further assistance, please don't hesitate to contact our support team.</p>
            <p>Thank you for using AppiSpot.</p>
            <p>Best regards,</p>
            <p>The AppiSpot Team</p>
            
          </div>
          <div class="footer">Sent by appispot</div>
        </div>
      </body>
        `;
        const mailOptions = {
            
            to: email,
            subject: 'Booking Cancellation',
            html,
        };
        return await transporter.support.sendMail(mailOptions);
    }
};