// =========================
// ONE PIECE STORE
// Mobile Legends
// =========================


// بيانات بوت التليجرام

const TELEGRAM_TOKEN = "8914195758:AAEYWSsm39cGnn28ZwG0biDCmxdgAuHF2pw";
const TELEGRAM_CHAT_ID = "8022694361";


let cart = [];


// =========================
// اختيار الباقات
// =========================

const cards = document.querySelectorAll(".package-card");


cards.forEach(card => {


    const plus = card.querySelector(".plus");
    const minus = card.querySelector(".minus");


    const name = plus.dataset.name;
    const diamond = plus.dataset.diamond || "";
    const price = Number(plus.dataset.price);



    plus.addEventListener("click",()=>{


        let item = cart.find(p => p.name === name);



        if(item){

            item.qty++;

        }else{


            cart.push({

                name:name,

                diamond:diamond,

                price:price,

                qty:1

            });


        }



        updateCard(card);

        updateCart();


    });






    minus.addEventListener("click",()=>{


        let item = cart.find(p => p.name === name);



        if(!item) return;



        item.qty--;



        if(item.qty <= 0){

            cart = cart.filter(p => p.name !== name);

        }



        updateCard(card);

        updateCart();


    });



});






// =========================
// تحديث الكمية
// =========================


function updateCard(card){


    const name = card.querySelector(".plus").dataset.name;


    const item = cart.find(p => p.name === name);



    card.querySelector(".qty").textContent =
    item ? item.qty : "0";


}








// =========================
// تحديث السلة
// =========================


function updateCart(){


    const cartBox = document.getElementById("cart");

    const totalBox = document.getElementById("total");



    cartBox.innerHTML = "";



    let total = 0;



    if(cart.length === 0){


        cartBox.innerHTML =
        "🛒 لا توجد منتجات مختارة";


        totalBox.textContent="0";


        return;


    }







    cart.forEach((item,index)=>{


        let itemTotal = item.price * item.qty;


        total += itemTotal;



        cartBox.innerHTML += `


        <div class="cart-item">


        <h4>
        💎 ${item.name}
        </h4>


        <p>
        ${item.diamond}
        </p>


        <p>
        العدد: ${item.qty}
        </p>


        <p>
        السعر: ${itemTotal} ج.م
        </p>



        <button class="delete-btn"
        onclick="removeItem(${index})">

        🗑 حذف

        </button>


        </div>


        `;


    });



    totalBox.textContent = total;


}









// =========================
// حذف من السلة
// =========================


function removeItem(index){


    cart.splice(index,1);



    document.querySelectorAll(".package-card")
    .forEach(card=>{


        updateCard(card);


    });



    updateCart();


}









// =========================
// إرسال الطلب
// =========================


document.getElementById("sendOrder")
.addEventListener("click", async ()=>{



const playerId =
document.getElementById("playerId").value.trim();



const zoneId =
document.getElementById("zoneId").value.trim();



const phone =
document.getElementById("phone").value.trim();



const payment =
document.getElementById("paymentImage").files[0];



const sendBtn =
document.getElementById("sendOrder");





if(cart.length===0){

alert("⚠️ اختر باقة واحدة على الأقل");

return;

}



if(playerId===""){

alert("⚠️ أدخل ID اللاعب");

return;

}



if(zoneId===""){

alert("⚠️ أدخل Server ID");

return;

}



if(phone===""){

alert("⚠️ أدخل رقم الهاتف");

return;

}



if(!payment){

alert("⚠️ أرفق إثبات الدفع");

return;

}






let itemsText="";



let packagesData=[];



cart.forEach(item=>{


itemsText +=
`• ${item.name} (${item.diamond}) × ${item.qty} = ${item.price * item.qty} ج.م\n`;



packagesData.push({

name:item.name,

diamond:item.diamond,

qty:item.qty


});


});







const total =
document.getElementById("total").textContent;



const orderNumber =
"OP-" + Date.now();







const captionText =

`🏴‍☠️ *طلب شحن جديد - Mobile Legends* 🏴‍☠️


🎮 *ID اللاعب:* \`${playerId}\`

🌐 *Server ID:* \`${zoneId}\`

📱 *الهاتف:* \`${phone}\`



📦 *الباقات المطلوبة:*

${itemsText}


💰 *الإجمالي:* *${total} ج.م*



🧾 رقم الطلب:
${orderNumber}


----------------------------------

🏴‍☠️ ONE PIECE STORE`;







sendBtn.disabled=true;

sendBtn.innerText=
"جاري إرسال الطلب... ⏳";






const formData = new FormData();


formData.append("chat_id",TELEGRAM_CHAT_ID);

formData.append("photo",payment);

formData.append("caption",captionText);

formData.append("parse_mode","Markdown");








try{


const response = await fetch(

`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`,

{

method:"POST",

body:formData

}

);







if(response.ok){



let orders =
JSON.parse(localStorage.getItem("orders")) || [];



const user =
JSON.parse(localStorage.getItem("user"));






orders.push({

orderId:orderNumber,

userPhone:user ? user.phone : phone,

game:"MOBILE LEGENDS",

playerId:playerId,

zoneId:zoneId,

packages:packagesData,

price:total,

date:new Date().toLocaleDateString("ar-EG"),

status:
"✅ تم الطلب بنجاح\n\n⏳ بانتظار إضافة شحنتك\n\n⚠️ في حالة التأخير كلم خدمة العملاء"


});







localStorage.setItem(

"orders",

JSON.stringify(orders)

);







alert(

`✅ تم إرسال الطلب بنجاح

🧾 رقم الطلب:
${orderNumber}

🏴‍☠️ ONE PIECE STORE`

);



location.reload();



}else{


alert("❌ حدث خطأ أثناء الإرسال");


sendBtn.disabled=false;


}



}catch(error){


console.log(error);


alert("❌ مشكلة في الاتصال");


sendBtn.disabled=false;


}



});







// تشغيل أولي

updateCart();


// =========================
// دالة نسخ رقم الكاش (المحدثة والشاملة)
// =========================

function copyCashNumber() {
    const cashInput = document.getElementById("cashNumber");
    const copyBtn = document.getElementById("copyBtn");

    if (!cashInput) return;

    cashInput.select();
    cashInput.setSelectionRange(0, 99999);

    function successEffect() {
        if (copyBtn) {
            const originalText = copyBtn.innerText;
            copyBtn.innerText = "تم النسخ! ✓";
            copyBtn.style.background = "#00ff88";
            copyBtn.style.color = "#000";

            setTimeout(() => {
                copyBtn.innerText = originalText;
                copyBtn.style.background = "";
                copyBtn.style.color = "";
            }, 1500);
        }
    }

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            successEffect();
            return;
        }
    } catch (err) {
        console.log("ExecCommand failed, trying Clipboard API...");
    }

    if (navigator.clipboard) {
        navigator.clipboard.writeText(cashInput.value)
            .then(() => {
                successEffect();
            })
            .catch(() => {
                alert("⚠️ يرجى نسخ الرقم يدوياً: " + cashInput.value);
            });
    } else {
        alert("⚠️ يرجى نسخ الرقم يدوياً: " + cashInput.value);
    }
}

// تفعيل حدث الضغط على زر النسخ تلقائياً
document.addEventListener("DOMContentLoaded", () => {
    const copyBtn = document.getElementById("copyBtn");
    if (copyBtn) {
        copyBtn.addEventListener("click", copyCashNumber);
    }
});
