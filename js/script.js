fetch("http://localhost:3000/produtos")

  .then(res => res.json())

  .then(produtos => {

    const container =
      document.getElementById("produtos");


    produtos.forEach((produto, index) => {

      container.innerHTML += `
      
      <div class="card-produto">

          <img src="${produto.imagem}" alt="${produto.nome}">

          <h3>${produto.nome}</h3>

          <p>R$ ${produto.preco}</p>

          <a href="produto.html?id=${index}">

              <button>
                  Ver Produto
              </button>

          </a>

      </div>
      `;
    });

});


// CARROSSEL
const produtosContainer =
  document.getElementById("produtos");


document
  .getElementById("btn-direita")

  .addEventListener("click", () => {

    produtosContainer.scrollBy({

      left: 300,

      behavior: "smooth"
    });
});


document
  .getElementById("btn-esquerda")

  .addEventListener("click", () => {

    produtosContainer.scrollBy({

      left: -300,

      behavior: "smooth"
    });
});