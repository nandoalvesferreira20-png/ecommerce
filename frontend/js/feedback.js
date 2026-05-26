
    // =========================
    // LISTAR FEEDBACKS
    // =========================

    async function carregarFeedbacks() {

      try {

        const resposta =
          await fetch(`${API_URL}/feedbacks`);

        const feedbacks =
          await resposta.json();

        const container =
          document.getElementById("listaFeedbacks");

        container.innerHTML = "";

        feedbacks.reverse().forEach(feedback => {

          let estrelas = "";

          for (
            let i = 0;
            i < Number(feedback.avaliacao);
            i++
          ) {
            estrelas += "★";
          }

          for (
            let i = Number(feedback.avaliacao);
            i < 5;
            i++
          ) {
            estrelas += "☆";
          }

          container.innerHTML += `

            <div class="feedback-card">

              <div class="stars">
                ${estrelas}
              </div>

              <p>
                "${feedback.mensagem}"
              </p>

              <h3>
                ${feedback.nome}
              </h3>

              <span>
                ${feedback.data}
              </span>

            </div>

          `;
        });

      } catch (erro) {

        console.log(
          "Erro ao carregar feedbacks:",
          erro
        );
      }
    }

    carregarFeedbacks();


    // =========================
    // ENVIAR FEEDBACK
    // =========================

    const formFeedback =
      document.getElementById("formFeedback");

    formFeedback.addEventListener(
      "submit",
      async (event) => {

        event.preventDefault();

        const nome =
          document.getElementById("nome").value;

        const avaliacao =
          document.getElementById("avaliacao").value;

        const mensagem =
          document.getElementById("mensagem").value;

        try {

          const resposta =
            await fetch(
              `${API_URL}/feedbacks`,
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json"
                },

                body: JSON.stringify({
                  nome,
                  avaliacao,
                  mensagem
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

          formFeedback.reset();

          carregarFeedbacks();

        } catch (erro) {

          console.log(
            "Erro ao enviar feedback:",
            erro
          );

          alert(
            "Erro ao enviar feedback."
          );
        }
      }
    );