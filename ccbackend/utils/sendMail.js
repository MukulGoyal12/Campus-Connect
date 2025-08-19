import nodemailer from "nodemailer";

async function sendMail({ mailToken, email }) {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "mukulgoyal756@gmail.com",
        pass: "zrhf plqt olne hxgx",
      },
    });

    let info = await transporter.sendMail({
      from: '"Mukul Goyal" <mukulgoyal756@gmail.com>',
      to: email,
      subject: "Verify Your Email",
      html: `
        <h3>Email Verification</h3>
        <p>Click the button below to verify your email:</p>
        <a href="https://campus-connect-6bkk.onrender.com/api/verify-email?token=${mailToken}&email=${email}"
            style="padding: 10px 20px; background-color: #4CAF50; color: white; 
                    text-decoration: none; border-radius: 5px;">
            Verify Email
        </a>
      `,
    });

    return true;
  } catch (err) {
    console.error("Mail sending error:", err);
    return false;
  }
}

export default sendMail;
