const formCadastro =
    document.getElementById("formCadastro");

formCadastro.addEventListener(
    "submit",

    async (event) => {

        event.preventDefault();

        const botao =
            formCadastro.querySelector("button");

        try {

            botao.disabled = true;

            botao.innerHTML = "Cadastrando...";

            const nome =
                document
                .getElementById("nome_user")
                .value
                .trim();

            const email =
                document
                .getElementById("email")
                .value
                .trim();

            const telefone =
                document
                .getElementById("telefone")
                .value
                .trim();

            const senha =
                document
                .getElementById("senha")
                .value;

            const confirmarSenha =
                document
                .getElementById("confirmarSenha")
                .value;

            const termos =
                document
                .getElementById("termos")
                .checked;

            // =========================
            // VALIDAÇÕES
            // =========================

            if (
                !nome ||
                !email ||
                !telefone ||
                !senha ||
                !confirmarSenha
            ) {

                alert("Preencha todos os campos");

                return;
            }

            if (senha.length < 6) {

                alert(
                    "A senha precisa ter pelo menos 6 caracteres"
                );

                return;
            }

            if (senha !== confirmarSenha) {

                alert("As senhas não conferem");

                return;
            }

            if (!termos) {

                alert(
                    "Você precisa aceitar os termos"
                );

                return;
            }

            // =========================
            // REQUISIÇÃO
            // =========================

            const resposta = await fetch(
                "http://localhost:3000/usuarios",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        nome,
                        email,
                        telefone,
                        senha
                    })
                }
            );

            const dados =
                await resposta.json();

            // =========================
            // ERRO
            // =========================

            if (!resposta.ok) {

                alert(dados.erro);

                return;
            }

            // =========================
            // SUCESSO
            // =========================

            alert("Conta criada com sucesso!");

            window.location.href =
                "login.html";

        } catch (erro) {

            console.log(
                "ERRO CADASTRO:",
                erro
            );

            alert("Erro no servidor");

        } finally {

            botao.disabled = false;

            botao.innerHTML = "Cadastrar";
        }
    }
);