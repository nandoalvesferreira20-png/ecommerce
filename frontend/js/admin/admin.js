document
  .getElementById("btnSalvar")
  .addEventListener("click", async () => {

    const nome =
      document.getElementById("nome").value;

    const preco =
      document.getElementById("preco").value;

    const descricao =
      document.getElementById("descricao").value;

    const categoria =
      document.getElementById("categoria").value;

    const imagens =
      document.getElementById("imagens").files;

    if (
      !nome ||
      !preco ||
      !descricao ||
      !categoria ||
      imagens.length === 0
    ) {

      alert("Preencha todos os campos");

      return;
    }

    const formData = new FormData();

    formData.append("nome", nome);

    formData.append("preco", preco);

    formData.append("descricao", descricao);

    formData.append("categoria", categoria);

    for (let i = 0; i < imagens.length; i++) {
      formData.append("imagens", imagens[i]);
    }

    const resposta = await fetch(`${API_URL}/produtos`,
      {
        method: "POST",
        body: formData
      }
    );

    const dados = await resposta.json();

    console.log(dados);

    if (!resposta.ok) {

      alert(dados.erro);

      return;
    }

    alert("Produto salvo!");

    carregarProdutos();

  });

async function carregarProdutos() {

  const resposta =
    await fetch(`${API_URL}/produtos`);

  const produtos =
    await resposta.json();

  const lista =
    document.getElementById("listaProdutos");

  lista.innerHTML = "";

  produtos.forEach(produto => {

    lista.innerHTML += `
    
      <div style="
        display:flex;
        align-items:center;
        gap:15px;
        margin-top:15px;
      ">

        <img
          src="${produto.imagens[0]}"
          width="80"
          height="80"
          style="object-fit:cover;"
        >

        <strong>
          ${produto.nome}
        </strong>

        <span>
          R$ ${produto.preco}
        </span>

        <button
          onclick="excluirProduto(${produto.id})"
        >
          Excluir
        </button>

      </div>

    `;
  });

}

async function excluirProduto(id) {

  await fetch(
    `${API_URL}/produtos/${id}`,
    {
      method: "DELETE"
    }
  );

  alert("Produto excluído!");

  carregarProdutos();
}

carregarProdutos();