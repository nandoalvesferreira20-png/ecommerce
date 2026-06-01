const params = new URLSearchParams(window.location.search);

const id = Number(params.get("id"));

const API_URL = "http://localhost:3000";

fetch(`${API_URL}/produtos`)

  .then(res => res.json())

  .then(produtos => {

    const produto =
      produtos.find(item => item.id === id);

    window.currentProduct = produto;

    const container =
      document.getElementById("produto");

    if (!produto) {

      container.innerHTML =
        "<h2>Produto não encontrado</h2>";

      return;
    }

    container.innerHTML = `

      <div class="pagina-produto">

        <!-- GALERIA -->
        <div class="galeria-produto">

          <!-- MINIATURAS -->
          <div class="miniaturas-laterais">

            ${produto.imagens.map((imagem, index) => `
              
              <img
                src="${imagem}"
                class="miniatura-lateral ${index === 0 ? "ativa" : ""}"
                onclick="trocarImagem('${imagem}', this)"
              >

            `).join("")}

          </div>

          <!-- IMAGEM PRINCIPAL -->
          <div class="imagem-principal-box">

            <img
              id="imagemPrincipal"
              src="${produto.imagens[0]}"
              class="imagem-principal"
            >

          </div>

        </div>

        <!-- INFO -->
        <div class="produto-info">

          <h1>${produto.nome}</h1>

          <p class="produto-preco">
            R$ ${produto.preco}
          </p>

          <p class="produto-descricao">
            ${produto.descricao || "Produto sem descrição."}
          </p>

          <!-- TAMANHOS -->
          <div class="tamanhos">

            <h3>Tamanho</h3>

            <div class="opcoes-tamanho">
              <button>P</button>
              <button>M</button>
              <button>G</button>
              <button>GG</button>
            </div>

          </div>
            <div class="quantidade-container">
                <label for="quantidade">Quantidade:</label>
                  <div class="seletor-quantidade">
                    <button type="button" class="btn-menos" onclick="alterarQtd(-1)">-</button>
                    <input type="number" id="quantidade" value="1" min="1" max="10" readonly>
                <button type="button" class="btn-mais" onclick="alterarQtd(1)">+</button>
            </div>
        </div>
          <!-- AÇÕES -->
          <div class="acoes-produto">

            <button class="btn-carrinho">
              Adicionar ao carrinho
            </button>

            <button class="btn-comprar">
              Comprar agora
            </button>

          </div>

          <!-- BENEFÍCIOS -->
          <div class="beneficios">

            <p>✓ Envio para todo o Brasil</p>

            <p>✓ Compra segura</p>

            <p>✓ Troca em até 7 dias</p>

          </div>
        <div class="frete-box">

          <h3>Calcular frete</h3>

            <div class="frete-inputs">

              <input
                type="text"
                id="cep"
                placeholder="Digite seu CEP"
                maxlength="9"
                  >

                <button onclick="calcularFrete()">
                  Calcular
                </button>

              </div>

            <div id="resultadoFrete"></div>

          </div>

        </div>

      </div>

    `;

    const btnCarrinho = document.querySelector(".btn-carrinho");

    if (btnCarrinho && window.currentProduct) {
      btnCarrinho.addEventListener("click", async () => {
        const quantidadeInput = document.getElementById("quantidade");
        const quantidade = Number(quantidadeInput?.value || 1);

        const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
        const token = localStorage.getItem("token");

        if (!usuario) {
          alert("Faça login para adicionar produtos ao carrinho.");
          window.location.href = "login.html";
          return;
        }

        const headers = {
          "Content-Type": "application/json"
        };

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/carrinho`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            produtoId: window.currentProduct.id,
            quantidade,
            usuarioId: usuario.id
          })
        });

        const dados = await response.json();

        if (!response.ok) {
          alert(dados.erro || "Erro ao adicionar ao carrinho.");
          return;
        }

        btnCarrinho.textContent = "Adicionado ao carrinho";
        btnCarrinho.disabled = true;

        setTimeout(() => {
          btnCarrinho.textContent = "Adicionar ao carrinho";
          btnCarrinho.disabled = false;
        }, 1800);
      });
    }

  })

  .catch(erro => {

    console.error(
      "Erro ao carregar produto:",
      erro
    );

    document.getElementById("produto").innerHTML =
      "<h2>Erro ao carregar produto.</h2>";

  });


// =========================
// TROCAR IMAGEM
// =========================

function trocarImagem(imagem, elemento) {

  // troca imagem principal
  document.getElementById(
    "imagemPrincipal"
  ).src = imagem;

  // remove borda ativa
  document
    .querySelectorAll(".miniatura-lateral")
    .forEach(img => {
      img.classList.remove("ativa");
    });

  // adiciona borda ativa
  elemento.classList.add("ativa");

}

async function calcularFrete() {
  const inputCep = document.getElementById("cep");
  const resultadoFrete = document.getElementById("resultadoFrete");

  let cep = inputCep.value.replace(/\D/g, "");

  if (cep.length !== 8) {
    resultadoFrete.innerHTML = `
      <p style="color: #f87171;">
        Digite um CEP válido.
      </p>
    `;
    return;
  }

  resultadoFrete.innerHTML = `
    <p>Consultando CEP...</p>
  `;

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const endereco = await resposta.json();

    if (endereco.erro) {
      resultadoFrete.innerHTML = `
        <p style="color: #f87171;">
          CEP não encontrado.
        </p>
      `;
      return;
    }

    let valorFrete;
    let prazo;

    if (endereco.uf === "SP") {
      valorFrete = 12.90;
      prazo = "2 a 3 dias úteis";
    } else if (
      endereco.uf === "RJ" ||
      endereco.uf === "MG" ||
      endereco.uf === "ES"
    ) {
      valorFrete = 18.90;
      prazo = "3 a 5 dias úteis";
    } else {
      valorFrete = 29.90;
      prazo = "5 a 9 dias úteis";
    }

    resultadoFrete.innerHTML = `
      <p>
        <strong>Entrega para:</strong>
        ${endereco.localidade} - ${endereco.uf}
      </p>

      <p>
        <strong>Bairro:</strong>
        ${endereco.bairro || "Não informado"}
      </p>

      <p>
        <strong>Frete:</strong>
        R$ ${valorFrete.toFixed(2).replace(".", ",")}
      </p>

      <p>
        <strong>Prazo:</strong>
        ${prazo}
      </p>
    `;

  } catch (erro) {
    console.error("Erro ao consultar ViaCEP:", erro);

    resultadoFrete.innerHTML = `
      <p style="color: #f87171;">
        Erro ao consultar CEP. Tente novamente.
      </p>
    `;
  }
}

function alterarQtd(valor) {
  const inputQtd = document.getElementById('quantidade');
  let valorAtual = parseInt(inputQtd.value);
  
  // Calcula o novo valor
  valorAtual += valor;
  
  // Garante que não vai ser menor que o mínimo (1) e nem maior que o máximo (ex: 10)
  const min = parseInt(inputQtd.getAttribute('min'));
  const max = parseInt(inputQtd.getAttribute('max'));
  
  if (valorAtual >= min && valorAtual <= max) {
    inputQtd.value = valorAtual;
  }
}