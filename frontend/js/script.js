// =========================
// USUÁRIO LOGADO
// =========================

const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
const areaUsuario = document.getElementById("areaUsuario");

if (usuario && areaUsuario) {
  areaUsuario.innerHTML = `
    <div style="display:flex; align-items:center; gap:10px;">
      <span style="color:white; font-size:14px;">
        Olá, ${usuario.nome}
      </span>

      <button onclick="logout()" style="
        padding:6px 12px;
        border:none;
        border-radius:8px;
        cursor:pointer;
      ">
        Sair
      </button>
    </div>
  `;
}

function logout() {
  localStorage.removeItem("usuarioLogado");
  window.location.reload();
}


// =========================
// PRODUTOS
// =========================

let listaProdutos = [];

const containerProdutos = document.getElementById("produtos");
const campoPesquisa = document.getElementById("pesquisaProdutos");
const btnDireita = document.getElementById("btn-direita");
const btnEsquerda = document.getElementById("btn-esquerda");

fetch(`${API_URL}/produtos`)
  .then(res => res.json())
  .then(produtos => {
    listaProdutos = produtos;
    mostrarProdutos(listaProdutos);
  })
  .catch(erro => {
    console.log("Erro ao carregar produtos:", erro);
  });


function mostrarProdutos(produtos) {
  if (!containerProdutos) return;

  containerProdutos.innerHTML = "";

  produtos.forEach((produto, index) => {
    const imagemProduto = produto.imagens
      ? produto.imagens[0]
      : produto.imagem;

    containerProdutos.innerHTML += `
      <div class="card-produto">

        <img
          src="${imagemProduto}"
          alt="${produto.nome}"
        >

        <h3>${produto.nome}</h3>

        <p>R$ ${produto.preco}</p>

        <a href="produto.html?id=${produto.id ?? index}">
          <button>
            Ver Produto
          </button>
        </a>

      </div>
    `;
  });
}


// =========================
// FILTRO POR CATEGORIA
// =========================

function filtrarCategoria(categoria) {
  if (!campoPesquisa) return;

  campoPesquisa.value = "";

  if (categoria === "todos") {
    mostrarProdutos(listaProdutos);
    return;
  }

  const produtosFiltrados = listaProdutos.filter(produto =>
    produto.categoria &&
    produto.categoria.trim().toLowerCase() === categoria.toLowerCase()
  );

  mostrarProdutos(produtosFiltrados);
}


// =========================
// PESQUISA
// =========================

if (campoPesquisa) {
  campoPesquisa.addEventListener("input", () => {
    const textoDigitado = campoPesquisa.value.trim().toLowerCase();

    const produtosFiltrados = listaProdutos.filter(produto =>
      produto.nome &&
      produto.nome.toLowerCase().includes(textoDigitado)
    );

    mostrarProdutos(produtosFiltrados);
  });
}


// =========================
// CARROSSEL
// =========================

if (btnDireita && containerProdutos) {
  btnDireita.addEventListener("click", () => {
    containerProdutos.scrollBy({
      left: 300,
      behavior: "smooth"
    });
  });
}

if (btnEsquerda && containerProdutos) {
  btnEsquerda.addEventListener("click", () => {
    containerProdutos.scrollBy({
      left: -300,
      behavior: "smooth"
    });
  });
}