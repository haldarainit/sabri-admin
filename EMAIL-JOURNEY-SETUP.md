# Email Journey Setup Guide

## 📧 Email Configuration for Sabri Admin

The Email Journey feature allows you to send personalized emails to your customers using pre-built templates.

---

## ✅ Setup Instructions

### Step 1: Configure Email Credentials

1. **Open `.env` file** in the `sabri-admin` folder
2. **Update the email settings**:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-here
```

### Step 2: Get Gmail App Password (Recommended)

If you're using Gmail, you need to create an **App Password** (not your regular Gmail password):

1. **Go to Google Account Settings**: https://myaccount.google.com/apppasswords
2. **Sign in** to your Google account
3. **Create a new App Password**:
   - App name: `Sabri Admin`
   - Click "Create"
4. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)
5. **Paste it in `.env`** as `EMAIL_PASSWORD` (remove spaces)

### Step 3: Enable Less Secure App Access (Alternative)

If App Passwords don't work, you can enable Less Secure App Access:

1. Go to: https://myaccount.google.com/lesssecureapps
2. Turn ON "Allow less secure apps"
3. Use your regular Gmail password in `.env`

> ⚠️ **Security Note**: App Passwords are more secure than enabling less secure apps.

---

## 🚀 How to Use Email Journey

### Workflow:

1. **Navigate** to `Email Journey` in the admin dashboard
2. **Select a template** (e.g., Welcome Email, Order Shipped, etc.)
3. **User list modal opens** → Search and select a user
4. **Email compose modal opens** → Customize subject and message
5. **Click "Send Email"** → Email sent via Nodemailer!

### Available Templates:

- 👋 **Welcome Email** - Welcome new customers
- 🛒 **Abandoned Cart Reminder** - Remind about cart items
- 📦 **Order Confirmation** - Confirm orders with details
- 🚚 **Order Shipped** - Notify shipping status
- 🎉 **Order Delivered** - Confirm delivery
- ❌ **Order Cancellation** - Notify cancellations
- ⭐ **Review Request** - Request product reviews
- 🆕 **New Product Announcement** - Announce new arrivals
- 💖 **Wishlist Reminder** - Remind about wishlist items
- 🎁 **Special Offer** - Send promotional offers
- 💝 **Thank You Email** - Thank customers
- 🔔 **Back in Stock Alert** - Notify availability

---

## 🔧 Alternative Email Services

### Using SendGrid:

```javascript
const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  auth: {
    user: "apikey",
    pass: process.env.SENDGRID_API_KEY,
  },
});
```

### Using Outlook/Hotmail:

```javascript
const transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

### Using Custom SMTP:

```javascript
const transporter = nodemailer.createTransport({
  host: "smtp.yourdomain.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

---

## 📝 API Endpoint

**Endpoint**: `POST /api/send-email`

**Request Body**:

```json
{
  "to": "customer@example.com",
  "subject": "Welcome to Sabri Jewelry!",
  "message": "Dear Customer,\n\nWelcome to our store...",
  "userName": "John Doe"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "<unique-id@gmail.com>",
  "recipient": "customer@example.com"
}
```

---

## 🐛 Troubleshooting

### Error: "Invalid login"

- **Solution**: Use App Password instead of regular password
- **Check**: Make sure 2-Factor Authentication is enabled on Gmail

### Error: "Connection timeout"

- **Solution**: Check your internet connection
- **Check**: Firewall settings may be blocking SMTP port (587 or 465)

### Error: "Missing credentials"

- **Solution**: Make sure `.env` file has `EMAIL_USER` and `EMAIL_PASSWORD`
- **Check**: Restart the development server after updating `.env`

### Error: "Recipient rejected"

- **Solution**: Verify the recipient email address is valid
- **Check**: Some email providers block automated emails

---

## 📊 Features

✅ **12 Pre-built Templates** - Ready-to-use email templates  
✅ **User Search** - Search users by name or email  
✅ **Customizable Messages** - Edit subject and message before sending  
✅ **HTML Emails** - Beautiful, responsive email design  
✅ **Real-time Sending** - Instant email delivery with loading states  
✅ **Error Handling** - Clear error messages for debugging

---

## 🔐 Security Best Practices

1. **Never commit `.env`** file to Git
2. **Use App Passwords** instead of regular passwords
3. **Rotate credentials** regularly
4. **Monitor email logs** for suspicious activity
5. **Rate limit** email sending to prevent abuse

---

## 💡 Next Steps

Want to add automation? You can extend this feature to:

- **Schedule emails** for specific dates/times
- **Trigger emails** based on user actions (orders, signups, etc.)
- **Track email opens** and click-through rates
- **A/B test** different email content
- **Personalize** with dynamic content (order details, user preferences)

---

**Need Help?** Contact your development team or check the Nodemailer documentation: https://nodemailer.com/
