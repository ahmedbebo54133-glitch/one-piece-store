// =====================================
// ONE PIECE STORE - MOBILE LEGENDS (Firebase + Telegram Inline Buttons)
// =====================================

// بيانات بوت التليجرام
const TELEGRAM_TOKEN = "8914195758:AAEYWSsm39cGnn28ZwG0biDCmxdgAuHF2pw";
const TELEGRAM_CHAT_ID = "8022694361";

let cart = [];

const cards = document.querySelectorAll(".package-card");

cards.forEach(card => {
    const plus = card.querySelector(".plus");
    const minus = card.querySelector(".minus");

    if (!plus || !minus) return;

    const name = plus.dataset.name;
    const price = Number(plus.dataset.price);

    plus.addEventListener("click", () => {
        let item = cart.find(p => p.name === name);

        if (item) {
            item.qty++;
        } else {
            cart.push({
                name: name,
                price: price,
                qty: 1
            });
        }

        updateCard(card);
        updateCart();
    });

    minus.addEventListener("click", () => {
        let item = cart.find(p => p.name === name);

        if (!item) return;

        item.qty--;

        if (item.qty <= 0) {
            cart = cart.filter(p => p.name !== name);
        }

        updateCard(card);
        updateCart();
    });
});

function updateCard(card) {
    const plusBtn = card.querySelector(".plus");
    if (!plusBtn) return;
    const name = plusBtn.dataset.name;
    const item = cart.find(p => p.name === name);

    const qtySpan = card.querySelector(".qty");
    if (qtySpan) {
        qtySpan.textContent = item ? item.qty : "0";
    }
}

function updateCart() {
    const cartBox = document.getElementById("cart");
    const totalBox = document.getElementById("total");

    if (!cartBox || !totalBox) return;

    cartBox.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
        cartBox.innerHTML = "🛒 لا توجد منتجات مختارة";
        totalBox.textContent = "0";
        return;
    }

    cart.forEach((item, index) => {
        let itemTotal = item.price * item.qty;
        total += itemTotal;

        cartBox.innerHTML += `
        <div class="cart-item">
            <div>
                <h4>💎 ${item.name}</h4>
                <p>العدد: ${item.qty} × ${item.price} ج.م = <strong>${itemTotal} ج.م</strong></p>
            </div>
            <button class="delete-btn" onclick="removeItem(${index})">🗑 حذف</button>
        </div>
        `;
    });

    totalBox.textContent = total;
}

function removeItem(index) {
    cart.splice(index, 1);

    document.querySelectorAll(".package-card").forEach(card => {
        updateCard(card);
    });

    updateCart();
}

function switchPayment(type) {
    const tabInsta = document.getElementById("tabInsta");
    const tabCash = document.getElementById("tabCash");
    const instaBox = document.getElementById("instaBox");
    const cashBox = document.getElementById("cashBox");

    if (!tabInsta || !tabCash || !instaBox || !cashBox) return;

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

function copyDynamic(inputId, btnElement) {
    const input = document.getElementById(inputId);
    if (!input) return;

    input.select();
    input.setSelectionRange(0, 99999);

    const successEffect = () => {
        if (btnElement) {
            const originalText = btnElement.innerText;
            btnElement.innerText = "تم النسخ! ✓";
            btnElement.style.background = "#00ff88";
            btnElement.style.color = "#000";

            setTimeout(() => {
                btnElement.innerText = originalText;
                btnElement.style.background = "";
                btnElement.style.color = "";
            }, 1500);
        }
    };

    try {
        if (document.execCommand('copy')) {
            successEffect();
            return;
        }
    } catch (err) {
        console.log("ExecCommand failed");
    }

    if (navigator.clipboard) {
        navigator.clipboard.writeText(input.value)
            .then(successEffect)
            .catch(() => alert("⚠️ يرجى نسخ الرقم يدوياً: " + input.value));
    } else {
        alert("⚠️ يرجى نسخ الرقم يدوياً: " + input.value);
    }
}

function copyCashNumber() {
    copyDynamic("cashNumber", document.getElementById("copyBtn"));
}

// =====================================
// إرسال الطلب وحفظه في Firebase وتليجرام
// =====================================
const sendOrderBtn = document.getElementById("sendOrder");
if (sendOrderBtn) {
    sendOrderBtn.addEventListener("click", async () => {
        const playerId = document.getElementById("playerId").value.trim();
        const zoneId = document.getElementById("zoneId").value.trim();
        const phoneInput = document.getElementById("phone").value.trim();
        const paymentImageInput = document.getElementById("paymentImage");
        const payment = paymentImageInput ? paymentImageInput.files[0] : null;

        // معرفة بيانات الحساب المسجل حالياً في الجهاز
        const loggedUser = JSON.parse(localStorage.getItem("user"));
        
        // ربط الطلب برقم الحساب المسجل لضمان ظهوره في البروفايل فوراً
        const accountPhone = loggedUser ? loggedUser.phone : phoneInput;

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

        if (zoneId === "") {
            alert("⚠️ أدخل Server ID");
            return;
        }

        if (phoneInput === "" && !accountPhone) {
            alert("⚠️ أدخل رقم الهاتف");
            return;
        }

        if (!payment) {
            alert("⚠️ أرفق إثبات الدفع");
            return;
        }

        sendOrderBtn.disabled = true;
        sendOrderBtn.innerText = "جاري إرسال الطلب... ⏳";

        let itemsText = "";
        let packagesData = [];

        cart.forEach(item => {
            itemsText += `• ${item.name} × ${item.qty} = ${item.price * item.qty} ج.م\n`;
            packagesData.push({
                name: item.name,
                qty: item.qty,
                price: item.price
            });
        });

        const total = document.getElementById("total").textContent;
        const orderId = "OP" + Date.now();

        // 1. كائن بيانات الطلب
        const orderData = {
            orderId: orderId,
            userPhone: accountPhone, // لضمان التطابق مع البروفايل
            contactPhone: phoneInput, // رقم التواصل المكتوب
            game: "MOBILE LEGENDS",
            playerId: playerId,
            zoneId: zoneId,
            paymentMethod: selectedPaymentMethod,
            packages: packagesData,
            price: total,
            date: new Date().toLocaleDateString("ar-EG"),
            timestamp: new Date().getTime(),
            status: "pending" // pending (قيد المراجعة) | approved (تم الشحن) | rejected (مرفوض)
        };

        try {
            // حفظ الطلب في Firestore
            if (typeof db !== "undefined") {
                await db.collection("orders").doc(orderId).set(orderData);
            }

            // حفظ محلي في LocalStorage كنسخة احتياطية
            let localOrders = JSON.parse(localStorage.getItem("orders")) || [];
            localOrders.push(orderData);
            localStorage.setItem("orders", JSON.stringify(localOrders));

            // 2. تجهيز الرسالة للتليجرام
            const captionText =
`🏴‍☠️ *طلب شحن جديد - Mobile Legends* 🏴‍☠️

🆔 *رقم الطلب:* \`${orderId}\`
🎮 *ID اللاعب:* \`${playerId}\`
🌐 *Server ID:* \`${zoneId}\`
📱 *رقم الحساب:* \`${accountPhone}\`
📞 *رقم التواصل:* \`${phoneInput}\`
💳 *طريقة الدفع:* \`${selectedPaymentMethod}\`

📦 *الباقات المطلوبة:*
${itemsText}
💰 *الإجمالي:* *${total} ج.م*

📌 *الحالة الحالية:* ⏳ قيد المراجعة

----------------------------------
🏴‍☠️ ONE PIECE STORE`;

            // أزرار التحكم الفورية في التليجرام
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
            formData.append("photo", payment);
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
                alert(`✅ تم إرسال الطلب بنجاح!\n\n🧾 رقم الطلب: ${orderId}\n📌 حالة الطلب: ⏳ قيد المراجعة.`);
                location.reload();
            } else {
                alert("❌ حدث خطأ أثناء الإرسال");
                sendOrderBtn.disabled = false;
                sendOrderBtn.innerText = "🚀 إرسال الطلب";
            }
        } catch (error) {
            console.error(error);
            alert("❌ مشكلة في الاتصال بالشبكة");
            sendOrderBtn.disabled = false;
            sendOrderBtn.innerText = "🚀 إرسال الطلب";
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    // التعبئة التلقائية لرقم الهاتف إن وجد حساب مسجل
    const loggedUser = JSON.parse(localStorage.getItem("user"));
    const phoneInput = document.getElementById("phone");
    if (loggedUser && loggedUser.phone && phoneInput && !phoneInput.value) {
        phoneInput.value = loggedUser.phone;
    }

    updateCart();
    const copyBtn = document.getElementById("copyBtn");
    if (copyBtn) {
        copyBtn.addEventListener("click", copyCashNumber);
    }
});
