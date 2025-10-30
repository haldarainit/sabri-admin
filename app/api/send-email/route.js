import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const { to, subject, message, userName } = await request.json();

    // Validate inputs
    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, message" },
        { status: 400 }
      );
    }

    // Create transporter using Gmail with explicit SMTP settings
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASSWORD, // Your Gmail app password
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Email options
    const mailOptions = {
      from: `"Sabri Jewelry Admin" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .email-container {
              background-color: #ffffff;
              border-radius: 8px;
              padding: 30px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              padding-bottom: 20px;
              border-bottom: 2px solid #008060;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #008060;
              margin-bottom: 10px;
            }
            .content {
              white-space: pre-wrap;
              font-size: 15px;
              line-height: 1.8;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
              text-align: center;
              font-size: 13px;
              color: #666;
            }
            .footer a {
              color: #008060;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <div class="logo">💎 Sabri Jewelry</div>
              <p style="margin: 0; color: #666;">Exquisite Jewelry for Life's Special Moments</p>
            </div>
            
            <div class="content">
${message}
            </div>
            
            <div class="footer">
              <p style="margin: 0 0 10px 0;"><strong>Sabri Jewelry</strong></p>
              <p style="margin: 0 0 10px 0;">Thank you for being a valued customer!</p>
              <p style="margin: 0;">
                Questions? Contact us at 
                <a href="mailto:${process.env.EMAIL_USER}">${process.env.EMAIL_USER}</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: message, // Plain text version
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent successfully:", info.messageId);

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
      recipient: to,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      {
        error: "Failed to send email",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
