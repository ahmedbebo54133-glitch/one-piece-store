// ===============================
// ONE PIECE STORE REGISTER (Firebase + Local Storage)
// ===============================

const form = document.getElementById("registerForm");

form.addEventListener("submit", async function (e) {

    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const securityQuestion = document.getElementById("securityQuestion").value;
    const securityAnswer = document.getElementById("securityAnswer").value.trim();
    const agree = document.getElementById("agree").checked;

    if (
        name === "" ||
        phone === "" ||
        password === "" ||
        confirmPassword === "" ||
        securityQuestion === "" ||
        securityAnswer === ""
    ) {
        alert("يرجى ملء جميع البيانات.");
        return;
    }

    if (!/^01\d{9}$/.test(phone)) {
        alert("رقم الهاتف غير صحيح (يجب أن يبدأ بـ 01 ويكون 11 رقماً).");
        return;
    }

    if (password.length < 6) {
        alert("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
        return;
    }

    if (password !== confirmPassword) {
        alert("كلمتا المرور غير متطابقتين.");
        return;
    }

    if (!agree) {
        alert("يجب الموافقة على الشروط والأحكام.");
        return;
    }

    const submitBtn = form.querySelector("button[type='submit']") || form.querySelector("button");
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "جاري إنشاء الحساب... ⏳";
    }

    // 1. التحقق من وجود حساب سابق محلياً
    const oldUser = JSON.parse(localStorage.getItem("user"));
    if (oldUser && oldUser.phone === phone) {
        alert("يوجد حساب بهذا الرقم بالفعل.");
        resetSubmitBtn(submitBtn);
        return;
    }

    // 2. كائن بيانات المستخدم الجديد
    const userData = {
        name: name,
        phone: phone,
        password: password,
        securityQuestion: securityQuestion,
        securityAnswer: securityAnswer,
        createdAt: new Date().toLocaleDateString("ar-EG"),
        timestamp: new Date().getTime()
    };

    try {
        // 3. التحقق والحفظ في Firebase Firestore إن كان متصلاً
        if (typeof db !== "undefined") {
            const userDoc = await db.collection("users").doc(phone).get();
            if (userDoc.exists) {
                alert("❌ يوجد حساب مسجل برقم الهاتف هذا بالفعل.");
                resetSubmitBtn(submitBtn);
                return;
            }
            // حفظ بيانات المستخدم برقم هاتف كـ ID مستند
            await db.collection("users").doc(phone).set(userData);
        }

        // 4. الحفظ في الذاكرة المحلية LocalStorage
        localStorage.setItem("user", JSON.stringify(userData));

        alert("🎉 تم إنشاء الحساب بنجاح!");
        window.location.href = "../login/login.html";

    } catch (error) {
        console.error("خطأ أثناء إنشاء الحساب:", error);
        alert("❌ حدث خطأ أثناء الاتصال بالسيرفر، يرجى المحاولة مرة أخرى.");
        resetSubmitBtn(submitBtn);
    }
});

function resetSubmitBtn(btn) {
    if (btn) {
        btn.disabled = false;
        btn.innerText = "إنشاء حساب";
    }
}
