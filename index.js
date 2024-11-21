const sgMail = require("@sendgrid/mail");

// Configure SendGrid API
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async (event) => {
  console.log("Event received:", JSON.stringify(event)); // Log the incoming event

  const baseURL = process.env.baseURL;

  try {
    for (const record of event.Records) {
      console.log("Processing record:", record); // Log the current record being processed

      const snsMessage = JSON.parse(record.Sns.Message);
      console.log("Parsed SNS message:", snsMessage); // Log the parsed SNS message

      const email = snsMessage.email;
      const verificationToken = snsMessage.verificationToken;
      const verificationLink = snsMessage.verificationLink;
      // Construct the verification link
      // const verificationLink = `http://${baseURL}/v1/user/self/verify?token=${verificationToken}`;
      // console.log("Verification link:", verificationLink); // Log the verification link

      // Set up the email content
      const msg = {
        to: email,
        from: `noreply@${baseURL}`,
        subject: "CSYE6225 Webapp - Verify Your Email",
        html: `<p>Dear User,<br>Please verify your email by <a href="${verificationLink}">clicking here</a>. This link expires in 2 minutes.<br><br>Thanks, <br>Nilvi Shah</p>`,
      };

      try {
        console.log("Sending email to:", email); // Log email sending attempt
        await sgMail.send(msg);
        console.log("Email sent successfully"); // Log success
      } catch (error) {
        console.error("Error sending email:", error); // Log specific email sending error
        return {
          statusCode: 500,
          body: "Email sending failed",
        };
      }
    }

    return {
      statusCode: 200,
      body: "Verification email sent successfully",
    };
  } catch (error) {
    console.error("Error processing SNS records:", error); // Log errors related to SNS processing
    return {
      statusCode: 500,
      body: "An error occurred",
    };
  }
};
