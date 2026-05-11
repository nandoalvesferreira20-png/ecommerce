const params = new URLSearchParams(window.location.search);
const id = Number(params.get("id"));

fetch("http://localhost:3000/produtos")
  .then(res => res.json())
  .then(produtos => {
    const produto = produtos.find(item => item.id === id);

    const container = document.getElementById("produto");

    if (!produto) {
      container.innerHTML = "<h2>Produto não encontrado</h2>";
      return;
    }

    container.innerHTML = `
      <div class="pagina-produto">

        <div class="produto-imagem">
          <img src="${produto.imagem}" alt="${produto.nome}">
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