// =========================
// FIREBASE
// =========================

import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// =========================
// CONFIG FIREBASE
// =========================

const firebaseConfig = {

    apiKey: "SUA_API_KEY",

    authDomain: "fut-store.firebaseapp.com",

    projectId: "fut-store",

    storageBucket: "fut-store.firebasestorage.app",

    messagingSenderId: "532114026795",

    appId: "1:532114026795:web:ea97838b6642fed94a156e"
};

const firebaseApp = initializeApp(firebaseConfig);

const auth = getAuth(firebaseApp);

const provider = new GoogleAuthProvider();

// =========================
// LOGIN GOOGLE
// =========================

const googleLogin =
    document.getElementById("googleLogin");

googleLogin.addEventListener("click", async () => {

    try {

        const resultado =
            await signInWithPopup(auth, provider);

        const usuario = resultado.user;

        const usuarioLogado = {
            nome: usuario.displayName,
            email: usuario.email,
            foto: usuario.photoURL
        };

        localStorage.setItem(
            "usuarioLogado",
            JSON.stringify(usuarioLogado)
        );

        alert(`Bem-vindo ${usuario.displayName}!`);

        window.location.href = "index.html";

    } catch (erro) {

        console.log("ERRO GOOGLE:", erro);

        alert("Erro no login Google");
    }
});

// =========================
// LOGIN NORMAL
// =========================

const formLogin =
    document.getElementById("formLogin");

formLogin.addEventListener("submit", async (event) => {

    event.preventDefault();

    const botao =
        formLogin.querySelector("button");

    try {

        botao.disabled = true;

        botao.innerHTML = "Entrando...";

        const email = document
            .getElementById("email")
            .value
            .trim();

        const senha = document
            .getElementById("senha")
            .value;

        if (!email || !senha) {

            alert("Preencha todos os campos");

            return;
        }

        const resposta = await fetch(
            "http://localhost:3000/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "include",

                body: JSON.stringify({
                    email,
                    senha
                })
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {

            alert(dados.erro);

            return;
        }

        // Salva usuário para uso na navbar e interface
        localStorage.setItem(
            "usuarioLogado",
            JSON.stringify(dados.usuario)
        );

        alert("Login realizado com sucesso!");

        window.location.href = "index.html";

    } catch (erro) {

        console.log("ERRO LOGIN:", erro);

        alert("Erro no servidor");

    } finally {

        botao.disabled = false;

        botao.innerHTML = "Entrar";
    }
});