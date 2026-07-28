// =====================================
// ONE PIECE STORE - PUBG
// =====================================


// بيانات بوت التليجرام (لم يتم التعديل)

const TELEGRAM_TOKEN = "8914195758:AAEYWSsm39cGnn28ZwG0biDCmxdgAuHF2pw";

const TELEGRAM_CHAT_ID = "8022694361";



let cart = [];



// جميع الباقات

const packages = document.querySelectorAll(".package-card");



packages.forEach(card => {



    const plus = card.querySelector(".plus");

    const minus = card.querySelector(".minus");



    const name = plus.dataset.name;

    const price = Number(plus.dataset.price);

    const uc = plus.dataset.uc;



    plus.addEventListener("click",()=>{


        let item = cart.find(product=>product.name === name);



        if(item){

            item.qty++;

        }else{


            cart.push({

                name:name,

                uc:uc,

                price:price,

                qty:1

            });


        }



        updateCard(card);

        updateCart();



    });





    minus.addEventListener("click",()=>{



        let item = cart.find(product=>product.name === name);



        if(!item) return;



        item.qty--;



        if(item.qty <=0){

            cart = cart.filter(product=>product.name !== name);

        }



        updateCard(card);

        updateCart();



    });



});







// تحديث الكمية

function updateCard(card){



    const name = card.querySelector(".plus").dataset.name;



    const item = cart.find(product=>product.name === name);



    card.querySelector(".qty").textContent =
    item ? item.qty : "0";



}








// تحديث السلة

function updateCart(){



    const cartBox = document.getElementById("cart");

    const totalBox = document.getElementById("total");



    cartBox.innerHTML="";



    let total = 0;



    if(cart.length === 0){


        cartBox.innerHTML="🛒 لا توجد باقات مختارة";

        totalBox.textContent="0";

        return;


    }





    cart.forEach((item,index)=>{


        let itemTotal = item.price * item.qty;


        total += itemTotal;



        cartBox.innerHTML += `


        <div class="cart-item">


        <h4>${item.name}</h4>


        <p>${item.uc}</p>


        <p>العدد: ${item.qty}</p>


        <p>${itemTotal} ج.م</p>



        <button onclick="removeItem(${index})">

        🗑 حذف

        </button>


        </div>



        `;



    });



    totalBox.textContent = total;



}








// حذف من السلة

function removeItem(index){



    const name = cart[index].name;



    cart.splice(index,1);



    document.querySelectorAll(".package-card").forEach(card=>{


        if(card.querySelector(".plus").dataset.name === name){

            card.querySelector(".qty").textContent="0";

        }


    });



    updateCart();



}









// إرسال الطلب

document.getElementById("sendOrder").addEventListener("click",async()=>{



const playerId =
document.getElementById("playerId").value.trim();



const phone =
document.getElementById("phone").value.trim();



const image =
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



if(phone===""){

alert("⚠️ أدخل رقم الهاتف");

return;

}



if(!image){

alert("⚠️ أرفق صورة إثبات الدفع");

return;

}






let itemsText="";



cart.forEach(item=>{


itemsText +=
`• ${item.name} ${item.uc} × ${item.qty} = ${item.price * item.qty} ج.م\n`;


});




const total =
document.getElementById("total").textContent;





const captionText =

`🏴‍☠️ *طلب شحن جديد - PUBG Mobile* 🏴‍☠️


🎮 *ID اللاعب:* \`${playerId}\`

📱 *الهاتف:* \`${phone}\`


📦 *الباقات المطلوبة:*


${itemsText}


💰 *الإجمالي:* *${total} ج.م*


----------------------------------

🏴‍☠️ ONE PIECE STORE`;






sendBtn.disabled=true;

sendBtn.innerText="جاري إرسال الطلب... ⏳";






const formData = new FormData();



formData.append("chat_id",TELEGRAM_CHAT_ID);

formData.append("photo",image);

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



// حفظ الطلب للبروفايل

let orders =
JSON.parse(localStorage.getItem("orders")) || [];



const user =
JSON.parse(localStorage.getItem("user"));



const orderId =
"OP" + Date.now();




orders.push({



orderId:orderId,


userPhone:user.phone,


game:"PUBG MOBILE",


playerId:playerId,


packages:cart.map(item=>({


name:item.name,


uc:item.uc,


qty:item.qty


})),


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
"✅ تم إرسال الطلب بنجاح\n\nسيتم مراجعة الطلب والشحن قريباً"
);



location.reload();




}else{


alert("❌ حدث خطأ أثناء الإرسال");


sendBtn.disabled=false;


sendBtn.innerText="إرسال الطلب 🚀";


}



}catch(error){


console.log(error);


alert("❌ مشكلة في الاتصال");


sendBtn.disabled=false;


sendBtn.innerText="إرسال الطلب 🚀";


}



});


// =====================================
// دالة نسخ رقم الكاش
// =====================================

function copyCashNumber() {
    const cashInput = document.getElementById("cashNumber");
    const copyBtn = document.getElementById("copyBtn");

    if (!cashInput) return;

    // نسخ النص للحافظة
    cashInput.select();
    cashInput.setSelectionRange(0, 99999); // للهواتف الذكية

    navigator.clipboard.writeText(cashInput.value).then(() => {
        // تغيير نص ولون الزر لتأكيد النسخ
        const originalText = copyBtn.innerText;
        copyBtn.innerText = "تم النسخ! ✓";
        copyBtn.style.background = "#00ff88";
        copyBtn.style.color = "#000";

        setTimeout(() => {
            copyBtn.innerText = originalText;
            copyBtn.style.background = "";
            copyBtn.style.color = "";
        }, 1500);
    }).catch(err => {
        console.error("فشل النسخ: ", err);
    });
}
