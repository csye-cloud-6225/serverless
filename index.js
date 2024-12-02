const sgMail = require("@sendgrid/mail");
const AWS = require("aws-sdk");

// Initialize the Secrets Manager client
const secretsManager = new AWS.SecretsManager();

exports.handler = async (event) => {
  console.log("Event received:", JSON.stringify(event)); // Log the incoming event

  const baseURL = process.env.baseURL;

  try {
    // Fetch the SendGrid API key from Secrets Manager
    console.log("Fetching email service credentials...");
    const secretValue = await secretsManager.getSecretValue({
      SecretId: "sendgrid-api-key",
    }).promise();
    

    const credentials = JSON.parse(secretValue.SecretString); // Parse the secret
    const sendGridApiKey = credentials.SENDGRID_API_KEY; // Extract the API key
    

    // Configure SendGrid with the fetched API key
    sgMail.setApiKey(sendGridApiKey);

    for (const record of event.Records) {
      console.log("Processing record:", record); // Log the current record being processed

      const snsMessage = JSON.parse(record.Sns.Message);
      console.log("Parsed SNS message:", snsMessage); // Log the parsed SNS message

      const email = snsMessage.email;
      const verificationToken = snsMessage.verificationToken;
      const verificationLink = snsMessage.verificationLink;

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
    console.error("Error processing the request:", error); // Log errors related to Secrets Manager or SNS processing
    return {
      statusCode: 500,
      body: "An error occurred",
    };
  }
};
