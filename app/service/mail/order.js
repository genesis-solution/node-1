const transporter = require("../../config/mailer");

module.exports = {
  async sendEmailOrderConfirmation({
    email,
    hostName,
    booking,
    eventDate,
    spot,
    userDetails,
    checkInDate,
    checkInTime,
    checkOutDate,
    checkOutTime,
    totalRespot,
    guestName,
    guestEmail,
    supportEmail
  }) {
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
         <div class="header">AppiSpot</div>
         <div class="content">
           <h2>Dear ${hostName},</h2>
           <p>
             Congratulations! You have a confirmed booking on AppiSpot for the
             following event:
           </p>
           
           <p>
             <span><strong>Booking ID:</strong> ${booking.id}</span>
             <span><strong>Event Date:</strong> ${eventDate}</span>
             <span><strong>Event Name:</strong> ${spot?.name}</span>
             <span><strong>Guest:</strong> ${userDetails.name}</span>
             <span><strong>Guest's Contact:</strong> ${userDetails.email}</span>
           </p>
           <p>
             <span><strong>Spot:</strong> ${spot.name}</span>
             <span><strong>Spot Address:</strong> ${spot.location.address}</span>
           </p>
   
           <p>
             <span><strong>Booking Details:</strong></span>
             <span>
               <strong>Check-in Date and Time:</strong> ${checkInDate} ${checkInTime}
             </span>
             <span>
               <strong>Check-out Date and Time:</strong> ${checkOutDate}
               ${checkOutTime}
             </span>
           </p>
           <p><strong>Total Booking Respot:</strong> ${totalRespot}</p>
           <p>
             Please review the above information to ensure its accuracy. Your
             guest, ${guestName}, has successfully booked your space for their
             special occasion.
           </p>
           <p>
             Here are some important reminders:
             <br />
             1. Prepare the spot: Make sure the spot is clean, well-maintained, and
             ready for the event according to the check-in time.
             <br />
             2. Contact the guest: Reach out to ${guestName} at ${guestEmail} to
             discuss any specific details, arrangements, or special requests they
             may have.
             <br />
             3. Host responsibly: Be available during the event for any questions
             or assistance the guest may need.
           </p>
           <br />
           <p>
             We trust you'll provide a wonderful experience for ${guestName} and
             their guests. If you have any questions or need assistance, please
             don't hesitate to contact our support team at ${supportEmail}.
           </p>
           <br />
           <p>
             Thank you for being a part of the AppiSpot community and for sharing
             your space. We hope this booking is a success and leads to more great
             experiences.
           </p>
           <p>Best regards, <br>The AppiSpot Support Team</p>
   
           <br />
         </div>
         <div class="footer">Sent by appispot</div>
       </div>
     </body>`;

    const mailOptions = {

      to: email,
      subject: 'Congratulations! You have a confirmed booking on AppiSpot',
      html,
    };
    return await transporter.support.sendMail(mailOptions);
  },

  async sendInvolvedEmail({
    buffer,
    email,
  }) {
    const mailOptions = {

      to: email,
      subject: 'Involve',
      attachments: [
        {
          filename: 'involve.pdf',
          content: buffer,
        },
      ],
    };
    return await transporter.support.sendMail(mailOptions);
  }
};