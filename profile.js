import { db, collection, query, where, onSnapshot } from "./firebase-config.js";

(function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = "login.html";
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        document.getElementById('profileName').innerText = currentUser.pirateName || "قرصان بدون اسم";
        document.getElementById('profilePhone').innerText = "📞 " + currentUser.phone;
        
        // استماع لحظي للطلبات من Firebase
        listenToUserOrders(currentUser.phone);
    }
});

function listenToUserOrders(phone) {
    const historyList = document.getElementById('historyList');
    const totalOrdersCountEl = document.getElementById('totalOrdersCount');
    const totalSpentAmountEl = document.getElementById('totalSpentAmount');
    const pirateRankEl = document.getElementById('pirateRank');

    // الاستعلام عن طلبات هذا رقم الهاتف
    const q = query(collection(db, "orders"), where("userPhone", "==", phone));

    // onSnapshot بتخلي الصفحة تتحدث تلقائياً اول ما أدمن تيليجرام يدوس موافقة أو رفض!
    onSnapshot(q, (snapshot) => {
        let myOrders = [];
        let totalSpent = 0;

        snapshot.forEach((doc) => {
            let data = doc.data();
            myOrders.push(data);
            totalSpent += Number(data.totalPrice || 0);
        });

        totalOrdersCountEl.innerText = myOrders.length;
        totalSpentAmountEl.innerText = `${totalSpent} ج.م`;

        if (myOrders.length >= 10) pirateRankEl.innerText = "👑 ملك القراصنة";
        else if (myOrders.length >= 3) pirateRankEl.innerText = "⚔️ قرصان محترف";
        else pirateRankEl.innerText = "⚓ قرصان جديد";

        if (myOrders.length === 0) {
            historyList.innerHTML = `
                <div style="text-align: center; color: #8c9ba5; padding: 30px 10px; background:#182026; border-radius:12px;">
                    <div style="font-size:40px; margin-bottom:8px;">💎</div>
                    <span>لا توجد لديك شحنات سابقة حتى الآن!</span>
                </div>
            `;
            return;
        }

        let html = '';
        myOrders.reverse().forEach(order => {
            const gameIcon = order.game.includes('PUBG') ? '🎮' : '💎';
            
            // تحديد لون حالة الطلب
            let statusColor = '#ffd54f'; // أصفر لقيد المراجعة
            if (order.status.includes('تم الشحن')) statusColor = '#4caf50'; // أخضر للمقبول
            if (order.status.includes('مرفوض')) statusColor = '#f44336'; // أحمر للمرفوض

            html += `
                <div class="history-card">
                    <div class="game-info">
                        <div class="game-icon">${gameIcon}</div>
                        <div>
                            <div style="font-weight:bold; color:#fff;">${order.game}</div>
                            <span class="order-status" style="color: ${statusColor}; background: rgba(255,255,255,0.08); font-weight: bold;">
                                ${order.status}
                            </span>
                            <div style="font-size: 11px; color: #8c9ba5; margin-top: 4px;">${order.date}</div>
                        </div>
                    </div>
                    <div style="font-weight: bold; color: #ffd54f; font-size: 16px;">
                        ${order.totalPrice} ج.م
                    </div>
                </div>
            `;
        });

        historyList.innerHTML = html;
    });
}
