import { db, collection, addDoc } from "./firebase-config.js";

// متغير حفظ الباقات المختارة
let selectedCart = {};

// دالة تحديث عرض السلة والأسعار
function renderCartUI() {
    const listElement = document.getElementById('selectedList');
    const totalElement = document.getElementById('totalPrice');

    if (!listElement || !totalElement) return;

    const keys = Object.keys(selectedCart);

    if (keys.length === 0) {
        listElement.innerHTML = '<li>لم يتم اختيار أي باقة بعد</li>';
        totalElement.innerText = '0 ج.م';
        return;
    }

    let listHtml = '';
    let grandTotal = 0;

    keys.forEach(key => {
        const item = selectedCart[key];
        const itemTotal = item.price * item.count;
        grandTotal += itemTotal;
        listHtml += `<li><span>${item.name} (x${item.count})</span> <strong>${itemTotal} ج.م</strong></li>`;
    });

    listElement.innerHTML = listHtml;
    totalElement.innerText = `${grandTotal} ج.م`;
}

// دالة زيادة وتقليل الكمية (ربط مباشر بالنافذة window)
window.updateQty = function(id, name, price, change) {
    if (!selectedCart[id]) {
        selectedCart[id] = { name: name, price: price, count: 0 };
    }

    selectedCart[id].count += change;
    const qtyElement = document.getElementById(`qty-${id}`);

    if (selectedCart[id].count <= 0) {
        delete selectedCart[id];
        if (qtyElement) qtyElement.innerText = "0";
    } else {
        if (qtyElement) qtyElement.innerText = selectedCart[id].count;
    }

    renderCartUI();
};

// دالة نسخ رقم المحفظة
window.copyNumber = function(num) {
    navigator.clipboard.writeText(num).then(() => {
        alert("تم نسخ رقم التحويل: " + num);
    }).catch(() => {
        alert("رقم التحويل: " + num);
    });
};

// دالة إرسال الطلب وحفظه في Firebase وإرساله لتيليجرام بالأزرار
window.handleOrderSubmit = async function(e, gameName) {
    e.preventDefault();

    const keys = Object.keys(selectedCart);

    if (keys.length === 0) {
        alert("يرجى اختيار باقة واحدة على الأقل بالضغط على زر (+)");
        return;
    }

    const playerId = document.getElementById('playerId').value.trim();
    const phone = document.getElementById('userPhone').value.trim();
    const fileInput = document.getElementById('receiptFile');

    if (!fileInput.files || fileInput.files.length === 0) {
        alert("يرجى إرفاق صورة الإيصال!");
        return;
    }

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerText = "⏳ جاري إرسال الطلب والحفظ...";

    try {
        let pkgsText = "";
        let totalPrice = 0;

        keys.forEach(key => {
            const item = selectedCart[key];
            const subTotal = item.price * item.count;
            totalPrice += subTotal;
            pkgsText += `• ${item.name} (عدد ${item.count}) = ${subTotal} ج.م\n`;
        });

        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const phoneToSave = currentUser ? currentUser.phone : phone;

        // 1. حفظ الطلب في Firebase السحابي
        const docRef = await addDoc(collection(db, "orders"), {
            game: gameName,
            totalPrice: totalPrice,
            userPhone: phoneToSave,
            playerId: playerId,
            status: "قيد المراجعة ⏳",
            date: new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' }),
            createdAt: new Date()
        });

        // 2. إرسال الإيصال لتيليجرام مع زرارين (موافقة ✅ / رفض ❌)
        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append("chat_id", CONFIG.TELEGRAM_ADMIN_CHAT_ID);
        formData.append("photo", file);
        
        const captionText = `
🏴‍☠️ <b>طلب شحن جديد (#${docRef.id.slice(-5)})</b>

🎮 <b>اللعبة:</b> ${gameName}
💎 <b>الباقات:</b>
${pkgsText}
💰 <b>الإجمالي:</b> ${totalPrice} ج.م
🆔 <b>آيدي اللاعب:</b> <code>${playerId}</code>
📞 <b>الموبايل:</b> ${phoneToSave}
        `;
        formData.append("caption", captionText);
        formData.append("parse_mode", "HTML");

        // إضافة أزرار القبول والرفض التفاعلية
        const replyMarkup = {
            inline_keyboard: [
                [
                    { text: "موافقة ✅", callback_data: `approve_${docRef.id}` },
                    { text: "رفض ❌", callback_data: `reject_${docRef.id}` }
                ]
            ]
        };
        formData.append("reply_markup", JSON.stringify(replyMarkup));

        const telegramUrl = `https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendPhoto`;
        const response = await fetch(telegramUrl, { method: "POST", body: formData });
        const result = await response.json();

        if (result.ok) {
            alert("✅ تم إرسال طلبك بنجاح وهو الآن قيد المراجعة!");
            window.location.href = "Profile.html";
        } else {
            throw new Error("فشل إرسال الطلب لتيليجرام");
        }

    } catch (error) {
        console.error(error);
        alert("حدث خطأ أثناء إرسال الطلب، تأكد من الاتصال بالإنترنت ومحاولة الإرسال مجدداً.");
        submitBtn.disabled = false;
        submitBtn.innerText = "تأكيد وإرسال الطلب عبر تيليجرام 🚀";
    }
};

// تشغيل عرض السلة عند تحميل الصفحة فوراً
document.addEventListener('DOMContentLoaded', () => {
    renderCartUI();
});
