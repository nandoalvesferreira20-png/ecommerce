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

    // PESQUISA
    const campoPesquisa =
      document.getElementById("pesquisaProdutos");

    campoPesquisa.addEventListener("input", () => {

      const textoDigitado =
        campoPesquisa.value.toLowerCase();

      const cards =
        document.querySelectorAll(".card-produto");

      cards.forEach((produto) => {

        const nomeProduto =
          produto.querySelector("h3")
          .textContent
          .toLowerCase();

        if (nomeProduto.includes(textoDigitado)) {

          produto.style.display = "block";

        } else {

          produto.style.display = "none";
        }
      });
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