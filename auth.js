//initialize supabase
const {createClient} = window.supabase;
const supabaseURL = "https://lyvswpeeahsowgcrvqco.supabase.co";
const supabaseAnnonKey= "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5dnN3cGVlYWhzb3dnY3J2cWNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc3MjYzOTYsImV4cCI6MjA1MzMwMjM5Nn0.oQaVxbt8WOQ0_GLgJhbV0pg46N6ZWC65OWNIhWFw3KA";

const supabase = createClient(supabaseURL,supabaseAnnonKey);

//login
const loginBtn = document.getElementById('LogIn');
loginBtn?.addEventListener("click", async() => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const{error: loginError, session} = await supabase.auth.signInWithPassword({email,password});

    if(loginError){
        document.getElementById("error-msg").textContent = loginError.message;
    }else{
        window.location.href = 'MainScreen.html';
    }
});

const signupLink = document.getElementById('createAccount');
signupLink?.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = 'SignUp.html';
});

//Signup
const signupBtn = document.getElementById("SignUp");
signupBtn?.addEventListener("click", async (e) => {
//e.preventDefault();
    const email = document.getElementById("email").value.toLowerCase();
    const password = document.getElementById("password").value;
    const username = document.getElementById("username").value;
    const { error: signupError, user } = await supabase.auth.signUp({ email, password });

    if (signupError) {
        document.getElementById("error-msg").textContent = signupError.message;
    } else {
        const { error: insertError } = await supabase.from('OptiLearn').insert([{
            user_name:username, email: email
        }]);

        if (insertError) {
            alert(insertError.message);
        } else {
            window.location.href = 'MainScreen.html';
        }
    }
});
const loginLink = document.getElementById('enterAccount');
loginLink?.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = 'LogIn.html';
});

