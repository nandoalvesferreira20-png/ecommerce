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
  localStorage.removeItem("token");
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

// Alternância entre as abas Cartão e Pix
function switchTab(method) {
    // Esconde todos os conteúdos e remove classe ativa dos botões
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

    // Ativa o conteúdo e botão selecionados
    if (method === 'cartao') {
        document.getElementById('form-cartao').classList.add('active');
        event.currentTarget.classList.add('active');
    } else if (method === 'pix') {
        document.getElementById('form-pix').classList.add('active');
        event.currentTarget.classList.add('active');
    }
}

// Simulação de comportamento ao clicar em "Gerar Código Pix"
function gerarPix() {
    const qrArea = document.getElementById('pix-qr-area');
    qrArea.classList.remove('hidden');
}

// Função para copiar o código Pix fictício "Copia e Cola"
function copiarPix() {
    const pixInput = document.getElementById('pix-code');
    const btnCopiar = document.getElementById('btn-copiar');
    
    // Seleciona e copia o texto
    pixInput.select();
    pixInput.setSelectionRange(0, 99999); // Para mobile
    navigator.clipboard.writeText(pixInput.value);
    
    // Altera o visual do botão temporariamente para dar feedback de sucesso
    btnCopiar.innerText = "Copiado!";
    btnCopiar.style.backgroundColor = "#2ed573";
    btnCopiar.style.color = "#ffffff";
    
    setTimeout(() => {
        btnCopiar.innerText = "Copiar";
        btnCopiar.style.backgroundColor = "";
        btnCopiar.style.color = "";
    }, 2000);
}

// Evento disparado ao enviar os dados do cartão de crédito
function processarPagamento(event) {
    event.preventDefault(); // Impede a página de recarregar
    
    // Aqui no futuro vocês vão conectar à API do Gateway (Mercado Pago, Stripe, etc)
    alert("Dados capturados com sucesso! Enviando para processamento seguro...");
}