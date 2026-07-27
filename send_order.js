// مصفوفة لتخزين الباقات والكميات المختارة
let selectedCart = {};

// دالة تحديث وتغيير الكميات (+ / -)
function updateQty(name, priceNum, change) {
    if (!selectedCart[name]) {
        selectedCart[name] = { price: priceNum, count: 0 };
    }

    selectedCart[name].count += change;

    // لو الكمية بقت صفر أو أقل إزالة الباقة
    if (selectedCart[name].count <= 0) {
        delete selectedCart[name];
        let qtyElem = document.getElementById(`qty-${name}`);
        if (qtyElem) qtyElem.innerText = "0";
    } else {
        let qtyElem = document.getElementById(`qty-${name}`);
        if (qtyElem) qtyElem.innerText = selectedCart[name].count;
    }

    updateSummaryUI();
}

// تحديث الواجهة وحساب السعر الإجمالي
function updateSummaryUI() {
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
    let total = 0;

    keys.forEach(key => {
        const item = selectedCart[key];
        const itemTotal = item.price * item.count;
        total += itemTotal;
        listHtml += `<li><span>${key} (x${item.count})</span> <strong>${itemTotal} ج.م</strong></li>`;
    });

    listElement.innerHTML = listHtml;
    totalElement.innerText = `${total} ج.م`;
}

// نسخ رقم التحويل
function copyNumber(num) {
    navigator.clipboard.writeText(num).then(() => {
        alert("تم نسخ رقم التحويل: " + num);
    }).catch(() => {
        alert("رقم التحويل هو: " + num);
    });
}

// إرسال الطلب للبوت
async function handleOrderSubmit(e, gameName) {
    e.preventDefault();

    const keys = Object.keys(selectedCart);

    if (keys.length === 0) {
        alert("يرجى اختيار باقة واحدة على الأقل بالضغط على (+)");
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
    submitBtn.innerText = "⏳ جاري إرسال الطلب...";

    try {
        const file = fileInput.files[0];
        
        // تجهيز قائمة الباقات المختارة للرسالة
        let pkgsText = "";
        let totalPrice = 0;

        keys.forEach(key => {
            const item = selectedCart[key];
            const subTotal = item.price * item.count;
            totalPrice += subTotal;
            pkgsText += `- ${key} (عدد ${item.count}) -> ${subTotal} ج.م\n`;
        });

        const formData = new FormData();
        formData.append("chat_id", CONFIG.TELEGRAM_ADMIN_CHAT_ID);
        formData.append("photo", file);
        
        const captionText = `
🏴‍☠️ <b>طلب شحن جديد (One Piece Store)</b>

🎮 <b>اللعبة:</b> ${gameName}
💎 <b>الباقات المختارة:</b>
${pkgsText}
💰 <b>الإجمالي:</b> ${totalPrice} ج.م
🆔 <b>الآيدي (ID):</b> <code>${playerId}</code>
📞 <b>الموبايل:</b> ${phone}
        `;
        formData.append("caption", captionText);
        formData.append("parse_mode", "HTML");

        const telegramUrl = `https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendPhoto`;
        
        const response = await fetch(telegramUrl, {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (result.ok) {
            alert("✅ تم إرسال طلبك بنجاح وسيوصلك الشحن قريباً!");
            window.location.href = "index.html";
        } else {
            throw new Error("فشل إرسال الرسالة");
        }

    } catch (error) {
        console.error(error);
        alert("حدث خطأ أثناء الإرسال، حاول مجدداً.");
        submitBtn.disabled = false;
        submitBtn.innerText = "تأكيد وإرسال الطلب 🚀";
    }
}
