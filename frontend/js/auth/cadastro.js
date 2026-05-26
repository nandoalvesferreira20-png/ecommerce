const formCadastro =
        document.getElementById("formCadastro");


      formCadastro.addEventListener(
        "submit",

        async (event) => {

          event.preventDefault();


          const nome =
            document.getElementById("nome").value;

          const email =
            document.getElementById("email").value;

          const telefone =
            document.getElementById("telefone").value;

          const senha =
            document.getElementById("senha").value;

          const confirmarSenha =
            document.getElementById("confirmarSenha").value;

          const termos =
            document.getElementById("termos").checked;


          if (senha !== confirmarSenha) {

            alert("As senhas não conferem");

            return;
          }


          if (!termos) {

            alert("Você precisa aceitar os termos");

            return;
          }


          const resposta = await fetch(`${API_URL}/usuarios`,
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


          if (!resposta.ok) {

            alert(dados.erro);

            return;
          }


          alert(dados.mensagem);


          window.location.href =
            "login.html";

      });