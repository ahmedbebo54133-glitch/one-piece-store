// ===============================
// ONE PIECE STORE REGISTER
// ===============================

const form = document.getElementById("registerForm");

form.addEventListener("submit", function (e) {

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

        alert("رقم الهاتف غير صحيح.");

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

    // التحقق من وجود حساب بنفس الرقم

    const oldUser = JSON.parse(localStorage.getItem("user"));

    if (oldUser && oldUser.phone === phone) {

        alert("يوجد حساب بهذا الرقم بالفعل.");

        return;

    }

    // حفظ البيانات

    const user = {

        name,

        phone,

        password,

        securityQuestion,

        securityAnswer

    };

    localStorage.setItem("user", JSON.stringify(user));

    alert("🎉 تم إنشاء الحساب بنجاح");

    window.location.href = "../login/login.html";

});