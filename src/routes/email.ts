import { Router } from "express";
import Mailgun from "mailgun-js";

// Load environment variables
const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY || "";
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || "";

const router = Router();

// Initialize Mailgun client
const mg = Mailgun({ apiKey: MAILGUN_API_KEY, domain: MAILGUN_DOMAIN });

// Example route to send an email
router.post("/send-email", (req, res) => {
  const data = {
    from: "Excited User <mailgun@sandboxa9b8d1905183490bbe0d2209af8a60a0.mailgun.org>",
    to: ["kksm05@proton.me", "praveenap2402@gmail.com"],
    subject: "Hello",
    text: "Testing some Mailgun awesomeness!",
    html: "<h1>Testing some Mailgun awesomenessSSS!</h1>",
  };

  mg.messages().send(data, (error, body) => {
    if (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send email" });
    } else {
      console.log("Email sent:", body);
      res.json({ message: "Email sent successfully" });
    }
  });
});

// export default router;
