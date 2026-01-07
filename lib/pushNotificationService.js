/**
 * Push Notification Service (Server-side)
 * Uses Firebase Admin SDK to send push notifications
 */

import admin from "firebase-admin";

// Initialize Firebase Admin SDK (only once)
const initializeFirebaseAdmin = () => {
    if (admin.apps.length > 0) {
        return admin.apps[0];
    }

    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
        console.error("Firebase Admin SDK credentials not configured");
        return null;
    }

    try {
        return admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
    } catch (error) {
        console.error("Error initializing Firebase Admin:", error);
        return null;
    }
};

/**
 * Send push notification to a user device
 * @param {string} fcmToken - The user's FCM token
 * @param {object} notification - Notification data (title, body)
 * @param {object} data - Additional data to send with the notification
 */
export const sendPushNotification = async (fcmToken, notification, data = {}) => {
    if (!fcmToken) {
        console.log("No FCM token provided, skipping push notification");
        return { success: false, error: "No FCM token" };
    }

    const app = initializeFirebaseAdmin();
    if (!app) {
        return { success: false, error: "Firebase Admin not initialized" };
    }

    const message = {
        token: fcmToken,
        notification: {
            title: notification.title || "Sabri Jewellery",
            body: notification.body || "You have a new notification",
        },
        data: {
            ...data,
            click_action: "FLUTTER_NOTIFICATION_CLICK",
        },
        webpush: {
            notification: {
                icon: "/sabrilogo.png",
                badge: "/sabrilogo.png",
                requireInteraction: true,
            },
            fcmOptions: {
                link: data.link || "/profile?tab=orders",
            },
        },
    };

    try {
        const response = await admin.messaging().send(message);
        console.log("✅ Push notification sent successfully:", response);
        return { success: true, messageId: response };
    } catch (error) {
        console.error("❌ Error sending push notification:", error);

        // Handle specific errors
        if (error.code === "messaging/invalid-registration-token" ||
            error.code === "messaging/registration-token-not-registered") {
            return { success: false, error: "Invalid token", shouldRemoveToken: true };
        }

        return { success: false, error: error.message };
    }
};

/**
 * Send order status update notification
 * @param {string} fcmToken - User's FCM token
 * @param {string} orderId - Order ID
 * @param {string} status - New order status
 */
export const sendOrderStatusNotification = async (fcmToken, orderId, status) => {
    const statusMessages = {
        pending: { emoji: "⏳", text: "Your order is pending confirmation." },
        confirmed: { emoji: "✅", text: "Your order has been confirmed!" },
        processing: { emoji: "🔄", text: "Your order is being processed." },
        shipped: { emoji: "🚚", text: "Your order has been shipped!" },
        "out-for-delivery": { emoji: "📦", text: "Your order is out for delivery!" },
        delivered: { emoji: "🎉", text: "Your order has been delivered!" },
        cancelled: { emoji: "❌", text: "Your order has been cancelled." },
    };

    const statusInfo = statusMessages[status] || { emoji: "📋", text: `Order status updated to: ${status}` };

    const notification = {
        title: `${statusInfo.emoji} Order #${orderId} Update`,
        body: statusInfo.text,
    };

    const data = {
        orderId: orderId,
        type: "order_status",
        status: status,
        link: `/profile?tab=orders`,
    };

    return sendPushNotification(fcmToken, notification, data);
};
