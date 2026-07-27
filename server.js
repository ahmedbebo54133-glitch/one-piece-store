const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');
const admin = require('firebase-admin');

// ربط المفتاح السري لقاعدة بيانات الفايربيس
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// توكن بوت تيليجرام
const TELEGRAM_BOT_TOKEN = 8914195758:AAEYWSsm39cGnn28ZwG0biDCmxdgAuHF2pw;
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

const app = express();
app.use(cors());
app.use(express.json());

// استقبال ضغطات الأزرار (موافقة / رفض) من تيليجرام
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const data = query.data; // هيرجع مثلاً: approve_ID أو reject_ID

    const [action, orderId] = data.split('_');

    try {
        const orderRef = db.collection('orders').doc(orderId);

        if (action === 'approve') {
            // تحديث الحالة في الفايربيس لـ تم الشحن
            await orderRef.update({ status: 'تم الشحن بنجاح ✅' });
            
            bot.editMessageCaption(`${query.message.caption}\n\n<b>النتيجة:</b> تم القبول والشحن بنجاح ✅`, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'HTML'
            });
            bot.answerCallbackQuery(query.id, { text: "✅ تم شحن الطلب وتحديث بروفايل العميل!" });

        } else if (action === 'reject') {
            // تحديث الحالة في الفايربيس لـ مرفوض
            await orderRef.update({ status: 'طلب مرفوض ❌' });

            bot.editMessageCaption(`${query.message.caption}\n\n<b>النتيجة:</b> تم رفض الطلب ❌`, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'HTML'
            });
            bot.answerCallbackQuery(query.id, { text: "❌ تم رفض الطلب وتحديث بروفايل العميل!" });
        }
    } catch (error) {
        console.error("Error updating order:", error);
        bot.answerCallbackQuery(query.id, { text: "حدث خطأ أثناء تحديث حالة الطلب!" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 السيرفر شغال بنجاح على المنفذ ${PORT}`);
});
