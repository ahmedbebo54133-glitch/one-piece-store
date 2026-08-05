// ===============================
// ONE PIECE STORE PROFILE (Firebase Real-time)
// ===============================

// جلب بيانات المستخدم
const user = JSON.parse(localStorage.getItem("user"));

// التأكد من تسجيل الدخول
if (!user || localStorage.getItem("loggedIn") !== "true") {
    alert("يرجى تسجيل الدخول أولاً");
    window.location.href = "../login/login.html";
}

// عرض بيانات الحساب
document.getElementById("userName").innerText = user.name || "مستخدم";
document.getElementById("userPhone").innerText = user.phone || "غير محدد";

const ordersList = document.getElementById("ordersList");

// ===============================
// دالة تنسيق وتحديد شكل حالة الطلب
// ===============================
function getStatusBadge(status) {
    if (status === "approved" || status === "تم الشحن" || status === "✅ تم الشحن") {
        return `<span style="color: #10b981; font-weight: bold;">✅ تم الشحن</span>`;
    } else if (status === "rejected" || status === "مرفوض" || status === "❌ طلب مرفوض") {
        return `<span style="color: #ef4444; font-weight: bold;">❌ طلب مرفوض</span>`;
    } else {
        return `<span style="color: #f59e0b; font-weight: bold;">⏳ قيد المراجعة</span>`;
    }
}

// ===============================
// دالة عرض الطلبات في الصفحة
// ===============================
function renderOrders(ordersData) {
    ordersList.innerHTML = "";

    if (!ordersData || ordersData.length === 0) {
        ordersList.innerHTML = `
        <div class="order-empty">
            لا يوجد طلبات حالياً
        </div>
        `;
        return;
    }

    ordersData.forEach(order => {
        let packagesHTML = "";

        if (Array.isArray(order.packages)) {
            order.packages.forEach(item => {
                packagesHTML += `
                <div class="package-item">
                    ⚔️ ${item.name || ""}
                    <br>
                    💎 ${item.diamond || item.uc || item.gems || ""}
                    <br>
                    📦 العدد: ${item.qty || 1}
                </div>
                <hr>
                `;
            });
        } else {
            packagesHTML = order.packages || "غير محدد";
        }

        const statusDisplay = getStatusBadge(order.status);

        ordersList.innerHTML += `
        <details class="order-card">
            <summary class="order-summary">
                <div>🎮 ${order.game || "لعبة"}</div>
                <div>💰 ${order.price} ج.م</div>
                <div>📅 ${order.date || ""}</div>
            </summary>

            <div class="order-details">
                <p>
                    🧾 رقم الطلب: <strong>${order.orderId || order.orderNumber || "قديم"}</strong>
                </p>

                <p>
                    📦 الباقات:
                    <br>
                    <strong>${packagesHTML}</strong>
                </p>

                <p>
                    🎮 ID اللاعب: <strong>${order.playerId || "غير موجود"}</strong>
                </p>

                ${order.zoneId ? `<p>🌐 Server ID: <strong>${order.zoneId}</strong></p>` : ""}

                <p>
                    💳 طريقة الدفع: <strong>${order.paymentMethod || "غير محدد"}</strong>
                </p>

                <p>
                    💰 الإجمالي: <strong>${order.price} ج.م</strong>
                </p>

                <p>
                    📅 تاريخ الطلب: <strong>${order.date || ""}</strong>
                </p>

                <p>
                    📌 حالة الطلب: ${statusDisplay}
                </p>
            </div>
        </details>
        `;
    });
}

// ===============================
// جلب الشحنات الخاصة بالرقم (Firebase + LocalStorage fallback)
// ===============================
function loadUserOrders() {
    if (typeof db !== "undefined" && user.phone) {
        // الاستماع اللحظي للتغييرات من Firebase Firestore
        db.collection("orders")
            .where("userPhone", "==", user.phone)
            .onSnapshot(
                (snapshot) => {
                    let firebaseOrders = [];
                    snapshot.forEach((doc) => {
                        firebaseOrders.push(doc.data());
                    });

                    // ترتيب الطلبات من الأحدث للأقدم
                    firebaseOrders.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

                    renderOrders(firebaseOrders);
                },
                (error) => {
                    console.error("خطأ جلب البيانات من Firebase:", error);
                    loadLocalOrders();
                }
            );
    } else {
        loadLocalOrders();
    }
}

function loadLocalOrders() {
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    const myOrders = orders.filter(order => order.userPhone === user.phone);
    renderOrders(myOrders);
}

// تشغيل جلب الطلبات
loadUserOrders();

// ===============================
// حذف سجل الشحنات
// ===============================
document.getElementById("deleteOrders").onclick = async function () {
    const confirmDelete = confirm("هل أنت متأكد من حذف سجل الشحنات؟");

    if (confirmDelete) {
        // حذف المحلي
        let allOrders = JSON.parse(localStorage.getItem("orders")) || [];
        allOrders = allOrders.filter(order => order.userPhone !== user.phone);
        localStorage.setItem("orders", JSON.stringify(allOrders));

        // حذف من Firebase إن أمكن
        if (typeof db !== "undefined" && user.phone) {
            try {
                const snapshot = await db.collection("orders").where("userPhone", "==", user.phone).get();
                const batch = db.batch();
                snapshot.forEach(doc => {
                    batch.delete(doc.ref);
                });
                await batch.commit();
            } catch (err) {
                console.error("خطأ الحذف من السيرفر:", err);
            }
        }

        alert("✅ تم حذف سجل الشحنات");
        location.reload();
    }
};

// ===============================
// تغيير كلمة المرور
// ===============================
const passwordBox = document.getElementById("passwordBox");

document.getElementById("changePassword").onclick = function () {
    passwordBox.style.display = "flex";
};

document.getElementById("closePassword").onclick = function () {
    passwordBox.style.display = "none";
};

document.getElementById("savePassword").onclick = function () {
    const newPassword = document.getElementById("newPassword").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    if (newPassword === "" || confirmPassword === "") {
        alert("يرجى كتابة كلمة المرور");
        return;
    }

    if (newPassword.length < 6) {
        alert("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
        return;
    }

    if (newPassword !== confirmPassword) {
        alert("كلمتا المرور غير متطابقتين");
        return;
    }

    user.password = newPassword;
    localStorage.setItem("user", JSON.stringify(user));

    alert("✅ تم تغيير كلمة المرور بنجاح");

    document.getElementById("newPassword").value = "";
    document.getElementById("confirmPassword").value = "";
    passwordBox.style.display = "none";
};

// ===============================
// تسجيل الخروج
// ===============================
document.getElementById("logout").onclick = function () {
    const confirmLogout = confirm("هل أنت متأكد أنك تريد تسجيل الخروج؟");

    if (confirmLogout) {
        localStorage.removeItem("loggedIn");
        alert("✅ تم تسجيل الخروج بنجاح");
        window.location.href = "../login/login.html";
    }
};
