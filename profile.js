// ===============================
// ONE PIECE STORE PROFILE
// ===============================


// جلب بيانات المستخدم

const user = JSON.parse(localStorage.getItem("user"));


// التأكد من تسجيل الدخول

if(!user || localStorage.getItem("loggedIn") !== "true"){

    alert("يرجى تسجيل الدخول أولاً");

    window.location.href = "../login/login.html";

}



// عرض بيانات الحساب

document.getElementById("userName").innerText = user.name;

document.getElementById("userPhone").innerText = user.phone;





// ===============================
// عرض سجل الشحنات
// ===============================


const ordersList = document.getElementById("ordersList");


let orders = JSON.parse(localStorage.getItem("orders")) || [];



const myOrders = orders.filter(order => {

    return order.userPhone === user.phone;

});





if(myOrders.length === 0){


    ordersList.innerHTML = `

    <div class="order-empty">

    لا يوجد طلبات حالياً

    </div>

    `;


}else{


    myOrders.forEach(order => {



        let packagesHTML = "";



        if(Array.isArray(order.packages)){


            order.packages.forEach(item => {



                packagesHTML += `

                <div class="package-item">


                ⚔️ ${item.name}


                <br>


                💎 ${item.diamond || item.uc || item.gems || ""}


                <br>


                📦 العدد: ${item.qty}


                </div>


                <hr>


                `;



            });



        }else{


            packagesHTML = order.packages || "غير محدد";


        }





        ordersList.innerHTML += `



        <details class="order-card">



        <summary class="order-summary">



            <div>

            🎮 ${order.game}

            </div>



            <div>

            💰 ${order.price} ج.م

            </div>



            <div>

            📅 ${order.date}

            </div>



        </summary>







        <div class="order-details">



            <p>

            🧾 رقم الطلب:

            <strong>

            ${order.orderId || order.orderNumber || "قديم"}

            </strong>

            </p>





            <p>

            📦 الباقات:

            <br>

            <strong>

            ${packagesHTML}

            </strong>

            </p>





            <p>

            🎮 ID اللاعب:

            <strong>

            ${order.playerId || "غير موجود"}

            </strong>

            </p>






            ${
            order.zoneId

            ?

            `

            <p>

            🌐 Server ID:

            <strong>

            ${order.zoneId}

            </strong>

            </p>

            `

            :

            ""

            }







            <p>

            💰 الإجمالي:

            <strong>

            ${order.price} ج.م

            </strong>

            </p>







            <p>

            📅 تاريخ الطلب:

            <strong>

            ${order.date}

            </strong>

            </p>







            <p>

            ${order.status}

            </p>





        </div>





        </details>



        `;


    });


}









// ===============================
// حذف سجل الشحنات
// ===============================


document.getElementById("deleteOrders").onclick = function(){



    const confirmDelete = confirm(

        "هل أنت متأكد من حذف سجل الشحنات؟"

    );



    if(confirmDelete){



        let allOrders = JSON.parse(localStorage.getItem("orders")) || [];



        allOrders = allOrders.filter(order => {


            return order.userPhone !== user.phone;


        });



        localStorage.setItem(

            "orders",

            JSON.stringify(allOrders)

        );



        alert("✅ تم حذف سجل الشحنات");


        location.reload();


    }



};









// ===============================
// تغيير كلمة المرور
// ===============================


const passwordBox = document.getElementById("passwordBox");



document.getElementById("changePassword").onclick = function(){


    passwordBox.style.display = "flex";


};






document.getElementById("closePassword").onclick = function(){


    passwordBox.style.display = "none";


};







document.getElementById("savePassword").onclick = function(){



    const newPassword =

    document.getElementById("newPassword").value.trim();



    const confirmPassword =

    document.getElementById("confirmPassword").value.trim();






    if(newPassword === "" || confirmPassword === ""){


        alert("يرجى كتابة كلمة المرور");


        return;


    }






    if(newPassword.length < 6){


        alert("كلمة المرور يجب أن تكون 6 أحرف على الأقل");


        return;


    }







    if(newPassword !== confirmPassword){


        alert("كلمتا المرور غير متطابقتين");


        return;


    }







    user.password = newPassword;



    localStorage.setItem(

        "user",

        JSON.stringify(user)

    );





    alert("✅ تم تغيير كلمة المرور بنجاح");



    document.getElementById("newPassword").value = "";

    document.getElementById("confirmPassword").value = "";



    passwordBox.style.display = "none";



};









// ===============================
// تسجيل الخروج
// ===============================


document.getElementById("logout").onclick = function(){



    const confirmLogout = confirm(

        "هل أنت متأكد أنك تريد تسجيل الخروج؟"

    );




    if(confirmLogout){



        localStorage.removeItem("loggedIn");



        alert("✅ تم تسجيل الخروج بنجاح");



        window.location.href="../login/login.html";



    }



};