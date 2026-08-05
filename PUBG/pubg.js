// =====================================
// ONE PIECE STORE - PUBG (Firebase + Telegram Inline Buttons)
// =====================================

// بيانات بوت التليجرام
const TELEGRAM_TOKEN = "8914195758:AAEYWSsm39cGnn28ZwG0biDCmxdgAuHF2pw";
const TELEGRAM_CHAT_ID = "8022694361";

let cart = [];

// =====================================
// التعبئة التلقائية لرقم الحساب المسجل إن وجد
// =====================================
document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const phoneInput = document.getElementById("phone");

    if (user && user.phone && phoneInput && !phoneInput.value) {
        phoneInput.value = user.phone;
    }
});

// جميع الباقات
const packages = document.querySelectorAll(".package-card");

packages.forEach(card => {

    const plus = card.querySelector(".plus");
    const minus = card.querySelector(".minus");

    if (!plus || !minus) return;

    const name = plus.dataset.name;
    const price = Number(plus.dataset.price);
    const uc = plus.dataset.uc;

    plus.addEventListener("click", () => {

        let item = cart.find(product => product.name === name);

        if (item) {
            item.qty++;
        } else {
            cart.push({
                name: name,
                uc: uc,
                price: price,
                qty: 1
            });
        }

        updateCard(card);
        updateCart();

    });

    minus.addEventListener("click", () => {

        let item = cart.find(product => product.name === name);

        if (!item) return;

        item.qty--;

        if (item.qty <= 0) {
            cart = cart.filter(product => product.name !== name);
        }

        updateCard(card);
        updateCart();

    });

});

// تحديث الكمية
function updateCard(card) {

    const name = card.querySelector(".plus").dataset.name;
    const item = cart.find(product => product.name === name);

    card.querySelector(".qty").textContent = item ? item.qty : "0";

}

// تحديث السلة
function updateCart() {

    const cartBox = document.getElementById("cart");
    const totalBox = document.getElementById("total");

    cartBox.innerHTML = "";

    let total = 0;

    if (cart.length === 0) {
        cartBox.innerHTML = "🛒 لا توجد باقات مختارة";
        totalBox.textContent = "0";
        return;
    }

    cart.forEach((item, index) => {

        let itemTotal = item.price * item.qty;
        total += itemTotal;

        cartBox.innerHTML += `
        <div class="cart-item">
            <div>
                <strong>${item.name}</strong> (${item.uc}) × ${item.qty}
            </div>
            <div>
                <span>${itemTotal} ج.م </span>
                <button onclick="removeItem(${index})">🗑 حذف</button>
            </div>
        </div>
        `;

    });

    totalBox.textContent = total;

}

// حذف من السلة
function removeItem(index) {

    const name = cart[index].name;

    cart.splice(index, 1);

    document.querySelectorAll(".package-card").forEach(card => {
        if (card.querySelector(".plus").dataset.name === name) {
            card.querySelector(".qty").textContent = "0";
        }
    });

    updateCart();

}

// =====================================
// ⚡ دالة تبديل طريقة الدفع الديناميكية
// =====================================
function switchPayment(type) {
    const tabInsta = document.getElementById("tabInsta");
    const tabCash = document.getElementById("tabCash");
    const instaBox = document.getElementById("instaBox");
    const cashBox = document.getElementById("cashBox");

    if (type === 'insta') {
        tabInsta.classList.add("active");
        tabCash.classList.remove("active");
        instaBox.classList.remove("hidden");
        cashBox.classList.add("hidden");
    } else {
        tabCash.classList.add("active");
        tabInsta.classList.remove("active");
        cashBox.classList.remove("hidden");
        instaBox.classList.add("hidden");
    }
}

// دالة النسخ التفاعلية
function copyDynamic(inputId, btnElement) {
    const input = document.getElementById(inputId);
    if (!input) return;

    input.select();
    input.setSelectionRange(0, 99999);

    navigator.clipboard.writeText(input.value).then(() => {
        const originalText = btnElement.innerText;
        btnElement.innerText = "تم النسخ! ✓";
        btnElement.style.background = "#10b981";
        btnElement.style.color = "#000";

        setTimeout(() => {
            btnElement.innerText = originalText;
            btnElement.style.background = "";
            btnElement.style.color = "";
        }, 1500);
    }).catch(err => console.error("فشل النسخ: ", err));
}

function copyCashNumber() {
    copyDynamic("cashNumber", document.getElementById("copyBtn"));
}

// =====================================
// إرسال الطلب والحفظ في Firebase وتليجرام
// =====================================
document.getElementById("sendOrder").addEventListener("click", async () => {

    const playerId = document.getElementById("playerId").value.trim();
    const phoneInput = document.getElementById("phone").value.trim();
    const image = document.getElementById("paymentImage").files[0];
    const sendBtn = document.getElementById("sendOrder");

    // معرفة بيانات الحساب المسجل حالياً في الجهاز
    const loggedUser = JSON.parse(localStorage.getItem("user"));
    
    // ربط الطلب برقم الحساب المسجل لضمان ظهوره في البروفايل فوراً
    const accountPhone = loggedUser ? loggedUser.phone : phoneInput;

    // معرفة طريقة الدفع المختارة حالياً
    const activeTab = document.querySelector(".pay-tab.active");
    const selectedPaymentMethod = activeTab ? activeTab.innerText.trim() : "غير محدد";

    if (cart.length === 0) {
        alert("⚠️ اختر باقة واحدة على الأقل");
        return;
    }

    if (playerId === "") {
        alert("⚠️ أدخل ID اللاعب");
        return;
    }

    if (phoneInput === "" && !accountPhone) {
        alert("⚠️ أدخل رقم الهاتف");
        return;
    }

    if (!image) {
        alert("⚠️ أرفق صورة إثبات الدفع");
        return;
    }

    sendBtn.disabled = true;
    sendBtn.innerText = "جاري إرسال الطلب... ⏳";

    let itemsText = "";
    cart.forEach(item => {
        itemsText += `• ${item.name} ${item.uc} × ${item.qty} = ${item.price * item.qty} ج.م\n`;
    });

    const total = document.getElementById("total").textContent;
    const orderId = "OP" + Date.now();

    // 1. بيانات الطلب للحفظ في Firebase وفي LocalStorage كنسخة احتياطية
    const orderData = {
        orderId: orderId,
        userPhone: accountPhone, // لضمان التطابق مع البروفايل
        contactPhone: phoneInput, // رقم التواصل المكتوب
        game: "PUBG MOBILE",
        playerId: playerId,
        paymentMethod: selectedPaymentMethod,
        packages: cart.map(item => ({
            name: item.name,
            uc: item.uc,
            qty: item.qty,
            price: item.price
        })),
        price: total,
        date: new Date().toLocaleDateString("ar-EG"),
        timestamp: new Date().getTime(),
        status: "pending" // الحالات: pending (قيد المراجعة) | approved (تم الشحن) | rejected (مرفوض)
    };

    try {
        // حفظ الطلب في Firestore إن كان متصلاً
        if (typeof db !== "undefined") {
            await db.collection("orders").doc(orderId).set(orderData);
        }

        // حفظ محلي أيضاً
        let localOrders = JSON.parse(localStorage.getItem("orders")) || [];
        localOrders.push(orderData);
        localStorage.setItem("orders", JSON.stringify(localOrders));

        // 2. تجهيز الرسالة للتليجرام مع أزرار التحكم (Inline Keyboard)
        const captionText =
`🏴‍☠️ *طلب شحن جديد - PUBG Mobile* 🏴‍☠️

🆔 *رقم الطلب:* \`${orderId}\`
🎮 *ID اللاعب:* \`${playerId}\`
📱 *رقم الحساب:* \`${accountPhone}\`
📞 *رقم التواصل:* \`${phoneInput}\`
💳 *طريقة الدفع:* \`${selectedPaymentMethod}\`

📦 *الباقات المطلوبة:*
${itemsText}
💰 *الإجمالي:* *${total} ج.م*

📌 *الحالة الحالية:* ⏳ قيد المراجعة

----------------------------------
🏴‍☠️ ONE PIECE STORE`;

        // إضافة أزرار الموافقة والرفض
        const replyMarkup = {
            inline_keyboard: [
                [
                    { text: "✅ قبول الشحنة", callback_data: `approve_${orderId}` },
                    { text: "❌ رفض الشحنة", callback_data: `reject_${orderId}` }
                ]
            ]
        };

        const formData = new FormData();
        formData.append("chat_id", TELEGRAM_CHAT_ID);
        formData.append("photo", image);
        formData.append("caption", captionText);
        formData.append("parse_mode", "Markdown");
        formData.append("reply_markup", JSON.stringify(replyMarkup));

        const response = await fetch(
            `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`,
            {
                method: "POST",
                body: formData
            }
        );

        if (response.ok) {
            alert("✅ تم إرسال الطلب بنجاح!\n\nحالة الطلب حالياً: ⏳ قيد المراجعة.");
            location.reload();
        } else {
            alert("❌ حدث خطأ أثناء إرسال الصورة للتلجرام");
            sendBtn.disabled = false;
            sendBtn.innerText = "🚀 إرسال الطلب";
        }

    } catch (error) {
        console.error(error);
        alert("❌ مشكلة في الاتصال بالشبكة");
        sendBtn.disabled = false;
        sendBtn.innerText = "🚀 إرسال الطلب";
    }

});
