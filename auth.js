const questionsMap = {
    "q1": "ما هي فاكهة الشيطان المفضلة لديك؟",
    "q2": "ما اسم أول طاقم أو أنمي شاهدته؟",
    "q3": "ما هي مدينتك أو مسقط رأسك؟",
    "q4": "ما اسم صديقك المقرب؟"
};

function switchTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotForm = document.getElementById('forgotForm');
    const tabs = document.querySelectorAll('.tab-btn');

    loginForm.classList.remove('active');
    registerForm.classList.remove('active');
    forgotForm.classList.remove('active');

    tabs[0].classList.remove('active');
    tabs[1].classList.remove('active');
    tabs[2].classList.remove('active');

    if (tab === 'login') {
        loginForm.classList.add('active');
        tabs[0].classList.add('active');
    } else if (tab === 'register') {
        registerForm.classList.add('active');
        tabs[1].classList.add('active');
    } else if (tab === 'forgot') {
        forgotForm.classList.add('active');
        tabs[2].classList.add('active');
    }
}

function handleRegister(e) {
    e.preventDefault();

    const pirateName = document.getElementById('regPirateName').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const questionKey = document.getElementById('regSecurityQuestion').value;
    const answer = document.getElementById('regSecurityAnswer').value.trim().toLowerCase();

    let users = JSON.parse(localStorage.getItem('store_users')) || [];

    const userExists = users.some(u => u.phone === phone);
    if (userExists) {
        alert("⚠️ هذا الرقم مسجل بالفعل! يمكنك تسجيل الدخول مباشرة.");
        switchTab('login');
        return;
    }

    const newUser = { pirateName, phone, password, questionKey, answer };

    users.push(newUser);
    localStorage.setItem('store_users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    alert(`🎉 أهلاً بك في الطاقم يا القرصان (${pirateName})! تم إنشاء الحساب بنجاح.`);
    window.location.href = "index.html";
}

function handleLogin(e) {
    e.preventDefault();

    const phone = document.getElementById('loginPhone').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    let users = JSON.parse(localStorage.getItem('store_users')) || [];
    const user = users.find(u => u.phone === phone && u.password === password);

    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        alert(`🏴‍☠️ أهلاً بعودتك يا القرصان ${user.pirateName}!`);
        window.location.href = "index.html";
    } else {
        alert("❌ رقم الموبايل أو كلمة السر غير صحيحة!");
    }
}

function checkPhoneForQuestion() {
    const phone = document.getElementById('forgotPhone').value.trim();
    let users = JSON.parse(localStorage.getItem('store_users')) || [];
    const user = users.find(u => u.phone === phone);

    if (!user) {
        alert("❌ هذا الرقم غير مسجل لدينا!");
        return;
    }

    const questionText = questionsMap[user.questionKey] || "السؤال الأمني:";
    document.getElementById('displayQuestionLabel').innerText = `السؤال الأمني: ${questionText}`;
    document.getElementById('questionArea').style.display = 'block';
}

function handleForgotPassword(e) {
    e.preventDefault();

    const phone = document.getElementById('forgotPhone').value.trim();
    const answerInput = document.getElementById('forgotAnswer').value.trim().toLowerCase();
    const newPassword = document.getElementById('newPassword').value.trim();

    let users = JSON.parse(localStorage.getItem('store_users')) || [];
    const userIndex = users.findIndex(u => u.phone === phone);

    if (userIndex !== -1) {
        if (users[userIndex].answer === answerInput) {
            users[userIndex].password = newPassword;
            localStorage.setItem('store_users', JSON.stringify(users));

            alert("✅ تم تحديث كلمة السر بنجاح! يمكنك الآن تسجيل الدخول.");
            switchTab('login');
        } else {
            alert("❌ إجابة السؤال الأمني غير صحيحة!");
        }
    }
}
