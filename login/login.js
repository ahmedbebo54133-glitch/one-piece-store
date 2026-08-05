// ===============================
// ONE PIECE STORE LOGIN (Firebase + Local Storage)
// ===============================

const form = document.getElementById("loginForm");

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // نأخذ القيمة سواء كانت الخانة تسجل باسم email أو phone
    const phoneInput = document.getElementById("email") || document.getElementById("phone");
    const phone = phoneInput ? phoneInput.value.trim() : "";
    const password = document.getElementById("password").value.trim();

    if (phone === "" || password === "") {
        alert("يرجى إدخال جميع البيانات.");
        return;
    }

    const loginBtn = form.querySelector("button[type='submit']") || form.querySelector("button");
    if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.innerText = "جاري تسجيل الدخول... ⏳";
    }

    try {
        let currentUser = null;

        // 1. الفحص محلياً في الـ LocalStorage أولاً
        const localUser = JSON.parse(localStorage.getItem("user"));
        if (localUser && localUser.phone === phone) {
            currentUser = localUser;
        } 
        // 2. إذا لم نجده محلياً، نفحص قاعدة بيانات Firebase
        else if (typeof db !== "undefined") {
            const userDoc = await db.collection("users").doc(phone).get();
            if (userDoc.exists) {
                currentUser = userDoc.data();
            }
        }

        if (!currentUser) {
            alert("❌ لا يوجد حساب بهذا الرقم، قم بإنشاء حساب أولاً.");
            resetLoginBtn(loginBtn);
            return;
        }

        // التحقق من صحة كلمة المرور
        if (currentUser.password === password) {
            // حفظ بيانات المستخدم وجلسة الدخول في الـ LocalStorage
            localStorage.setItem("user", JSON.stringify(currentUser));
            localStorage.setItem("loggedIn", "true");

            alert("✅ تم تسجيل الدخول بنجاح!");
            window.location.href = "../index.html";
        } else {
            alert("❌ رقم الهاتف أو كلمة المرور غير صحيحة.");
            resetLoginBtn(loginBtn);
        }

    } catch (error) {
        console.error("خطأ في تسجيل الدخول:", error);
        alert("❌ حدث خطأ أثناء الاتصال بالشبكة.");
        resetLoginBtn(loginBtn);
    }
});

function resetLoginBtn(btn) {
    if (btn) {
        btn.disabled = false;
        btn.innerText = "تسجيل الدخول";
    }
}

// ===============================
// FORGOT PASSWORD (استعادة كلمة المرور)
// ===============================

const forgotPassword = document.getElementById("forgotPassword");
const forgotBox = document.getElementById("forgotBox");

if (forgotPassword && forgotBox) {
    forgotPassword.onclick = function () {
        forgotBox.style.display = "flex";
    };
}

const closeForgot = document.getElementById("closeForgot");
if (closeForgot && forgotBox) {
    closeForgot.onclick = function () {
        forgotBox.style.display = "none";
    };
}

let resetUserData = null;

// البحث عن الرقم
const checkPhoneBtn = document.getElementById("checkPhone");
if (checkPhoneBtn) {
    checkPhoneBtn.onclick = async function () {
        const phone = document.getElementById("forgotPhone").value.trim();

        if (phone === "") {
            alert("يرجى كتابة رقم الهاتف");
            return;
        }

        const localUser = JSON.parse(localStorage.getItem("user"));
        if (localUser && localUser.phone === phone) {
            resetUserData = localUser;
        } else if (typeof db !== "undefined") {
            const userDoc = await db.collection("users").doc(phone).get();
            if (userDoc.exists) {
                resetUserData = userDoc.data();
            }
        }

        if (!resetUserData) {
            alert("❌ رقم الهاتف غير موجود.");
            return;
        }

        document.getElementById("securityQuestion").innerHTML = "❓ " + (resetUserData.securityQuestion || "سؤال الأمان");
        document.getElementById("securityArea").style.display = "block";
    };
}

// التحقق من السؤال الأمني
const checkAnswerBtn = document.getElementById("checkAnswer");
if (checkAnswerBtn) {
    checkAnswerBtn.onclick = function () {
        const answer = document.getElementById("securityAnswer").value.trim();

        if (!resetUserData || answer !== resetUserData.securityAnswer) {
            alert("❌ إجابة السؤال الأمني غير صحيحة.");
            return;
        }

        document.getElementById("newPasswordArea").style.display = "block";
    };
}

// حفظ كلمة المرور الجديدة
const savePasswordBtn = document.getElementById("savePassword");
if (savePasswordBtn) {
    savePasswordBtn.onclick = async function () {
        const newPassword = document.getElementById("newPassword").value.trim();

        if (newPassword.length < 6) {
            alert("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
            return;
        }

        resetUserData.password = newPassword;

        // تحديث محلي وفي Firebase
        localStorage.setItem("user", JSON.stringify(resetUserData));

        if (typeof db !== "undefined" && resetUserData.phone) {
            try {
                await db.collection("users").doc(resetUserData.phone).update({
                    password: newPassword
                });
            } catch (err) {
                console.error("خطأ أثناء تحديث كلمة المرور في Firebase:", err);
            }
        }

        alert("✅ تم تغيير كلمة المرور بنجاح");
        location.reload();
    };
}
