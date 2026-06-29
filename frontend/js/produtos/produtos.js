//<!-- SCRIPT DE PAGINAÇÃO -->
    
        let listaProdutos = [];
        let limite = 8; // Quantos produtos por página
        let paginaAtual = 1;

        // Carregando o JSON do backend (um array simples)
        fetch(`${API_URL}/produtos`)
            .then(res => res.json())
            .then(data => {
                listaProdutos = data;
                carregarPagina(1);
            })
            .catch(err => console.error("Erro ao carregar JSON:", err));


        // ==========================
        //       MOSTRAR PRODUTOS
        // ==========================

        function carregarPagina(pagina) {
            paginaAtual = pagina;

            const start = (pagina - 1) * limite;
            const end = start + limite;

            const produtosPagina = listaProdutos.slice(start, end);

            mostrarProdutos(produtosPagina);
            criarPaginacao();
        }


        function mostrarProdutos(produtos) {
            const container = document.getElementById("lista-produtos");
            container.innerHTML = "";

            produtos.forEach(produto => {
                container.innerHTML += `
                    <div class="col-md-3 mb-4">
                        <div class="card h-100 shadow-sm">

                            <img src="${produto.imagens[0]}" class="card-img-top" alt="${produto.nome}">

                            <div class="card-body">
                                <h5 class="card-title">${produto.nome}</h5>
                                <p class="card-text">${produto.descricao}</p>
                                <p class="fw-bold text-success">R$ ${produto.preco}</p>

                                <div class="d-flex gap-2 mt-3">
                                    <a href="produto.html?id=${produto.id}" class="btn btn-primary w-50">Ver</a>
                                    <button class="btn btn-success w-50">Comprar</button>
                                </div>
                            </div>

                        </div>
                    </div>
                `;
            });
        }


        // ==========================
        //         PAGINAÇÃO
        // ==========================

        function criarPaginacao() {
            const totalPaginas = Math.ceil(listaProdutos.length / limite);
            const container = document.getElementById("paginacao");

            let html = `<ul class="pagination">`;

            // Botão "Anterior"
            html += `
                <li class="page-item ${paginaAtual === 1 ? "disabled" : ""}">
                    <button class="page-link" onclick="carregarPagina(${paginaAtual - 1})">←
                    </button>
            `;
            for (let i = 1; i <= totalPaginas; i++) {
                html += `
                    <li class="page-item ${i === paginaAtual ? "active" : ""}">
                        <button class="page-link" onclick="carregarPagina(${i})">${i}</button>
                    </li>
                `;
            }

            // Botão "Próxima"
            html += `
                <li class="page-item ${paginaAtual === totalPaginas ? "disabled" : ""}">
                    <button class="page-link" onclick="carregarPagina(${paginaAtual + 1})">→</button>
                </li>
            `;

            html += `</ul>`;
            container.innerHTML = html;
        }
    