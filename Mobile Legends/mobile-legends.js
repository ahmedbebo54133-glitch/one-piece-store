// =====================================
// ONE PIECE STORE - MOBILE LEGENDS
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

const sendOrderBtn = document.getElementById("sendOrder");
if (sendOrderBtn) {
    sendOrderBtn.addEventListener("click", async () => {
        const playerId = document.getElementById("playerId").value.trim();
        const zoneId = document.getElementById("zoneId").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const paymentImageInput = document.getElementById("paymentImage");
        const payment = paymentImageInput ? paymentImageInput.files[0] : null;

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

        if (phone === "") {
            alert("⚠️ أدخل رقم الهاتف");
            return;
        }

        if (!payment) {
            alert("⚠️ أرفق إثبات الدفع");
            return;
        }

        let itemsText = "";
        let packagesData = [];

        cart.forEach(item => {
            itemsText += `• ${item.name} × ${item.qty} = ${item.price * item.qty} ج.م\n`;
            packagesData.push({
                name: item.name,
                qty: item.qty
            });
        });

        const total = document.getElementById("total").textContent;
        const orderNumber = "OP-" + Date.now();

        const captionText =
`🏴‍☠️ *طلب شحن جديد - Mobile Legends* 🏴‍☠️

🎮 *ID اللاعب:* \`${playerId}\`
🌐 *Server ID:* \`${zoneId}\`
📱 *الهاتف:* \`${phone}\`
💳 *طريقة الدفع:* \`${selectedPaymentMethod}\`

📦 *الباقات المطلوبة:*
${itemsText}
💰 *الإجمالي:* *${total} ج.م*

🧾 *رقم الطلب:* \`${orderNumber}\`
----------------------------------
🏴‍☠️ ONE PIECE STORE`;

        sendOrderBtn.disabled = true;
        sendOrderBtn.innerText = "جاري إرسال الطلب... ⏳";

        const formData = new FormData();
        formData.append("chat_id", TELEGRAM_CHAT_ID);
        formData.append("photo", payment);
        formData.append("caption", captionText);
        formData.append("parse_mode", "Markdown");

        try {
            const response = await fetch(
                `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`,
                {
                    method: "POST",
                    body: formData
                }
            );

            if (response.ok) {
                let orders = JSON.parse(localStorage.getItem("orders")) || [];
                const user = JSON.parse(localStorage.getItem("user"));

                orders.push({
                    orderId: orderNumber,
                    userPhone: user ? user.phone : phone,
                    game: "MOBILE LEGENDS",
                    playerId: playerId,
                    zoneId: zoneId,
                    paymentMethod: selectedPaymentMethod,
                    packages: packagesData,
                    price: total,
                    date: new Date().toLocaleDateString("ar-EG"),
                    status: "✅ تم الطلب بنجاح\n\n⏳ بانتظار إضافة شحنتك\n\n⚠️ في حالة التأخير كلم خدمة العملاء"
                });

                localStorage.setItem("orders", JSON.stringify(orders));

                alert(`✅ تم إرسال الطلب بنجاح\n\n🧾 رقم الطلب: ${orderNumber}\n\n🏴‍☠️ ONE PIECE STORE`);
                location.reload();
            } else {
                alert("❌ حدث خطأ أثناء الإرسال");
                sendOrderBtn.disabled = false;
                sendOrderBtn.innerText = "🚀 إرسال الطلب";
            }
        } catch (error) {
            console.log(error);
            alert("❌ مشكلة في الاتصال");
            sendOrderBtn.disabled = false;
            sendOrderBtn.innerText = "🚀 إرسال الطلب";
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    updateCart();
    const copyBtn = document.getElementById("copyBtn");
    if (copyBtn) {
        copyBtn.addEventListener("click", copyCashNumber);
    }
});
