const params = new URLSearchParams(window.location.search);
const id = Number(params.get("id"));

let imagemAtual = 0;
let imagensProduto = [];

fetch("http://localhost:3000/produtos")
  .then(res => res.json())
  .then(produtos => {
    const produto = produtos.find(item => item.id === id);
    const container = document.getElementById("produto");

    if (!produto) {
      container.innerHTML = "<h2>Produto não encontrado</h2>";
      return;
    }

    imagensProduto = produto.imagens || [];

    container.innerHTML = `
      <div class="pagina-produto">

        <div class="produto-imagem carrossel">

          <button class="btn-carrossel anterior" onclick="voltarImagem()">
            ❮
          </button>

          <img
            id="imagemPrincipal"
            src="${imagensProduto[0]}"
            class="imagem-principal"
          >

          <button class="btn-carrossel proximo" onclick="avancarImagem()">
            ❯
          </button>

          <div class="contador-imagens">
            <span id="contadorImagem">1</span> / ${imagensProduto.length}
          </div>

        </div>

        <div class="produto-info">

          <h1>${produto.nome}</h1>

          <p class="produto-preco">R$ ${produto.preco}</p>

          <p class="produto-descricao">
            ${produto.descricao || "Produto sem descrição."}
          </p>

          <div class="tamanhos">
            <h3>Tamanho</h3>

            <div class="opcoes-tamanho">
              <button>P</button>
              <button>M</button>
              <button>G</button>
              <button>GG</button>
            </div>
          </div>

          <div class="acoes-produto">
            <button class="btn-carrinho">
              Adicionar ao carrinho
            </button>

            <button class="btn-comprar">
              Comprar agora
            </button>
          </div>

          <div class="beneficios">
            <p>✓ Envio para todo o Brasil</p>
            <p>✓ Compra segura</p>
            <p>✓ Troca em até 7 dias</p>
          </div>

        </div>

      </div>
    `;
  })
  .catch(erro => {
    console.error("Erro ao carregar produto:", erro);

    document.getElementById("produto").innerHTML =
      "<h2>Erro ao carregar produto.</h2>";
  });

function atualizarImagem() {
  document.getElementById("imagemPrincipal").src =
    imagensProduto[imagemAtual];

  document.getElementById("contadorImagem").textContent =
    imagemAtual + 1;
}

function avancarImagem() {
  imagemAtual++;

  if (imagemAtual >= imagensProduto.length) {
    imagemAtual = 0;
  }

  atualizarImagem();
}

function voltarImagem() {
  imagemAtual--;

  if (imagemAtual < 0) {
    imagemAtual = imagensProduto.length - 1;
  }

  atualizarImagem();
}