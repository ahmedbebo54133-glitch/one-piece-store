// ===============================
// ONE PIECE STORE LOGIN
// ===============================

const form = document.getElementById("loginForm");


form.addEventListener("submit", function (e) {

    e.preventDefault();


    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value.trim();


    if (email === "" || password === "") {

        alert("يرجى إدخال جميع البيانات.");

        return;

    }


    const user = JSON.parse(localStorage.getItem("user"));


    if (!user) {

        alert("لا يوجد حساب، قم بإنشاء حساب أولاً.");

        return;

    }



    if (
        (email === user.phone) &&
        password === user.password
    ) {


        localStorage.setItem("loggedIn", "true");


        alert("✅ تم تسجيل الدخول بنجاح");


        window.location.href = "../index.html";


    } else {


        alert("❌ رقم الهاتف أو كلمة المرور غير صحيحة");


    }


});



// ===============================
// FORGOT PASSWORD
// ===============================


const forgotPassword = document.getElementById("forgotPassword");

const forgotBox = document.getElementById("forgotBox");



forgotPassword.onclick = function(){

    forgotBox.style.display = "flex";

};





document.getElementById("closeForgot").onclick = function(){

    forgotBox.style.display = "none";

};






// البحث عن الرقم

document.getElementById("checkPhone").onclick = function(){


    const phone =
    document.getElementById("forgotPhone").value.trim();



    const user =
    JSON.parse(localStorage.getItem("user"));



    if(!user || phone !== user.phone){


        alert("❌ رقم الهاتف غير موجود");

        return;

    }



    document.getElementById("securityQuestion").innerHTML =
    "❓ " + user.securityQuestion;



    document.getElementById("securityArea").style.display="block";


};






// التحقق من السؤال الأمني

document.getElementById("checkAnswer").onclick = function(){


    const answer =
    document.getElementById("securityAnswer").value.trim();



    const user =
    JSON.parse(localStorage.getItem("user"));



    if(answer !== user.securityAnswer){


        alert("❌ إجابة السؤال الأمني غير صحيحة");

        return;

    }



    document.getElementById("newPasswordArea").style.display="block";


};








// حفظ كلمة المرور الجديدة

document.getElementById("savePassword").onclick = function(){


    const newPassword =
    document.getElementById("newPassword").value.trim();



    if(newPassword.length < 6){


        alert("كلمة المرور يجب أن تكون 6 أحرف على الأقل");

        return;

    }




    let user =
    JSON.parse(localStorage.getItem("user"));



    user.password = newPassword;



    localStorage.setItem("user", JSON.stringify(user));



    alert("✅ تم تغيير كلمة المرور بنجاح");



    location.reload();


};