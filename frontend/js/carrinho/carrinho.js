const cartItems = document.getElementById("cartItems");
const emptyState = document.getElementById("cartEmpty");
const summary = document.getElementById("cartSummary");
const subtotalElement = document.getElementById("subtotal");
const freteElement = document.getElementById("frete");
const totalElement = document.getElementById("total");
const limparCarrinhoButton = document.getElementById("limparCarrinho");
const finalizarCompraButton = document.getElementById("finalizarCompra");

const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
const token = localStorage.getItem("token");

function buildHeaders() {
  const headers = { "Content-Type": "application/json" };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

async function buscarCarrinho() {
  if (!usuario) {
    mostraUsuarioInvalido();
    return [];
  }

  const query = usuario.id ? `?usuarioId=${usuario.id}` : "";

  const resposta = await fetch(`${API_URL}/carrinho${query}`, {
    headers: buildHeaders()
  });

  if (!resposta.ok) {
    console.error("Erro ao buscar carrinho", await resposta.text());
    mostraUsuarioInvalido();
    return [];
  }

  return await resposta.json();
}

function mostraUsuarioInvalido() {
  cartItems.innerHTML = "";
  emptyState.classList.remove("d-none");
  summary.classList.add("d-none");
  emptyState.innerHTML = `
    <div class="cart-empty">
      <i class="fa-solid fa-user-lock fa-2x text-info"></i>
      <h3 class="m-0">Faça login para ver seu carrinho</h3>
      <p class="m-0 text-secondary">Entre para salvar seus itens no banco de dados.</p>
      <a href="login.html" class="btn btn-primary">Entrar</a>
    </div>
  `;
}

function atualizarResumo(itens) {
  const subtotal = itens.reduce((total, item) => {
    return total + Number(item.preco || 0) * Number(item.quantidade || 0);
  }, 0);

  const frete = subtotal > 0 ? 0 : 0;
  const total = subtotal + frete;

  subtotalElement.textContent = formatarMoeda(subtotal);
  freteElement.textContent = formatarMoeda(frete);
  totalElement.textContent = formatarMoeda(total);
}

async function renderizarCarrinho() {
  const carrinho = await buscarCarrinho();

  cartItems.innerHTML = "";

  if (!carrinho.length) {
    emptyState.classList.remove("d-none");
    summary.classList.add("d-none");
    return;
  }

  emptyState.classList.add("d-none");
  summary.classList.remove("d-none");

  carrinho.forEach(item => {
    const subtotalItem = Number(item.preco || 0) * Number(item.quantidade || 0);

    const cartItem = document.createElement("article");
    cartItem.className = "cart-item";

    cartItem.innerHTML = `
      <div class="cart-item-image">
        <img 
          src="${item.imagens?.[0] || "https://via.placeholder.com/300x300?text=Produto"}" 
          alt="${item.nome}" 
          loading="lazy"
        >
      </div>

      <div class="cart-item-details">
        <div class="d-flex justify-content-between align-items-start gap-3">
          <div>
            <h2>${item.nome}</h2>

            <p class="mb-0 text-secondary">
              ${item.descricao || "Produto sem descrição"}
            </p>

            <p class="mb-0 text-secondary">
              <strong>Tamanho:</strong> ${item.tamanho || "Não informado"}
            </p>
          </div>

          <button 
            type="button" 
            class="btn btn-sm btn-outline-light remove-item" 
            data-id="${item.id}" 
            aria-label="Remover ${item.nome}"
          >
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>

        <div class="cart-item-footer">
          <div class="cart-price">
            ${formatarMoeda(Number(item.preco || 0))}
          </div>

          <div class="quantity-controls" aria-label="Controle de quantidade">
            <button type="button" class="qty-btn decrement" data-id="${item.id}">-</button>
            <span class="qty-value">${item.quantidade}</span>
            <button type="button" class="qty-btn increment" data-id="${item.id}">+</button>
          </div>

          <div class="cart-subtotal">
            ${formatarMoeda(subtotalItem)}
          </div>
        </div>
      </div>
    `;

    cartItems.appendChild(cartItem);
  });

  atualizarResumo(carrinho);
}

cartItems.addEventListener("click", async (event) => {
  const decrementButton = event.target.closest(".decrement");
  const incrementButton = event.target.closest(".increment");
  const removeButton = event.target.closest(".remove-item");

  if (!decrementButton && !incrementButton && !removeButton) {
    return;
  }

  const button = decrementButton || incrementButton || removeButton;
  const id = Number(button.dataset.id);
  const usuarioId = usuario?.id;

  if (!usuarioId) {
    alert("Faça login para editar o carrinho.");
    return;
  }

  if (removeButton) {
    await fetch(`${API_URL}/carrinho/${id}`, {
      method: "DELETE",
      headers: buildHeaders()
    });
  } else {
    const itemRow = event.target.closest(".cart-item");
    const quantidadeSpan = itemRow?.querySelector(".qty-value");
    const quantidadeAtual = Number(quantidadeSpan?.textContent || 1);
    const novaQuantidade = decrementButton
      ? Math.max(1, quantidadeAtual - 1)
      : quantidadeAtual + 1;

    await fetch(`${API_URL}/carrinho/${id}`, {
      method: "PUT",
      headers: buildHeaders(),
      body: JSON.stringify({
        quantidade: novaQuantidade,
        usuarioId
      })
    });
  }

  renderizarCarrinho();
});

limparCarrinhoButton.addEventListener("click", async () => {
  if (!usuario?.id) {
    alert("Faça login para limpar o carrinho.");
    return;
  }

  await fetch(`${API_URL}/carrinho?usuarioId=${usuario.id}`, {
    method: "DELETE",
    headers: buildHeaders()
  });

  renderizarCarrinho();
});

finalizarCompraButton.addEventListener("click", async () => {
  const carrinho = await buscarCarrinho();

  if (!carrinho.length) {
    alert("Seu carrinho está vazio.");
    return;
  }

  alert("Pedido finalizado com sucesso!");

  await fetch(`${API_URL}/carrinho?usuarioId=${usuario.id}`, {
    method: "DELETE",
    headers: buildHeaders()
  });

  renderizarCarrinho();
});

renderizarCarrinho();