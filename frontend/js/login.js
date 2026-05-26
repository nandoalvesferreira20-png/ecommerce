 //<!-- LOGIN GOOGLE -->//
 import { initializeApp }
        from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

        import {
            getAuth,
            GoogleAuthProvider,
            signInWithPopup
        }
        from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

        const firebaseConfig = {
            apiKey: "AIzaSyCfs_qRIeyKRCZpg8oJSb4qMyUgDkOBoqs",
            authDomain: "fut-store.firebaseapp.com",
            projectId: "fut-store",
            storageBucket: "fut-store.firebasestorage.app",
            messagingSenderId: "532114026795",
            appId: "1:532114026795:web:ea97838b6642fed94a156e"
        };

        const app = initializeApp(firebaseConfig);

        const auth = getAuth(app);

        const provider = new GoogleAuthProvider();

        const googleLogin = document.getElementById("googleLogin");

        googleLogin.addEventListener("click", async () => {

            try {

                const resultado = await signInWithPopup(auth, provider);

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

                alert("Login com Google realizado!");

                window.location.href = "index.html";

            } catch (erro) {

                console.log("ERRO COMPLETO:", erro);
                console.log("CÓDIGO:", erro.code);
                console.log("MENSAGEM:", erro.message);

                alert(erro.code);
            }

        });

        //<!-- LOGIN NORMAL -->
   

        const formLogin = document.getElementById("formLogin");

        formLogin.addEventListener("submit", async (event) => {

            event.preventDefault();

            const email = document.getElementById("email").value;

            const senha = document.getElementById("senha").value;

            const resposta = await fetch("http://localhost:3000/login", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    senha
                })
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                alert(dados.erro);
                return;
            }

            localStorage.setItem(
                "usuarioLogado",
                JSON.stringify(dados.usuario)
            );

            alert("Login realizado com sucesso!");

            window.location.href = "index.html";

        });