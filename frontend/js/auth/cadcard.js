const formCartao = document.getElementById("formCartao");
const inputNome = document.getElementById("nomeC");
const inputNumero = document.getElementById("ndcartoes");
const inputValidade = document.getElementById("validade");

// =========================
// ATUALIZAR PREVIEW EM TEMPO REAL
// =========================

// Atualizar nome no cartão
inputNome.addEventListener("input", (e) => {
    const nome = e.target.value.trim().toUpperCase() || "SEU NOME";
    document.getElementById("previewName").textContent = nome;
});

// Atualizar número do cartão (com espaçamento)
inputNumero.addEventListener("input", (e) => {
    let valor = e.target.value.replace(/\s/g, "").replace(/\D/g, "");
    
    if (valor.length > 16) {
        valor = valor.slice(0, 16);
    }
    
    // Adicionar espaços a cada 4 dígitos
    valor = valor.replace(/(\d{4})(?=\d)/g, "$1 ");
    e.target.value = valor;
    
    // Atualizar preview
    const previewNumero = valor || "0000 0000 0000 0000";
    document.getElementById("previewNumber").textContent = previewNumero;
});

// Atualizar validade no cartão
inputValidade.addEventListener("input", (e) => {
    let valor = e.target.value.replace(/\D/g, "");
    
    if (valor.length >= 2) {
        valor = valor.slice(0, 2) + "/" + valor.slice(2, 4);
    }
    
    e.target.value = valor;
    
    const previewValidade = valor || "MM/YY";
    document.getElementById("previewValidity").textContent = previewValidade;
});

// =========================
// FORMULÁRIO SUBMIT
// =========================

formCartao.addEventListener("submit", async (event) => {
    event.preventDefault();

    const botao = formCartao.querySelector("button");

    try {
        botao.disabled = true;
        botao.innerHTML = "Cadastrando...";

        const nomeC = document.getElementById("nomeC").value.trim();
        const ndcartoes = document.getElementById("ndcartoes").value.trim().replace(/\s/g, "");
        const validade = document.getElementById("validade").value.trim();
        const cv = document.getElementById("cv").value.trim();

        // =========================
        // VALIDAÇÕES
        // =========================

        if (!nomeC || !ndcartoes || !validade || !cv) {
            alert("Preencha todos os campos");
            return;
        }

        // Validar número do cartão (16 dígitos)
        if (ndcartoes.length !== 16 || !/^\d+$/.test(ndcartoes)) {
            alert("Número do cartão deve ter 16 dígitos");
            return;
        }

        // Validar validade (MM/YY)
        if (!/^\d{2}\/\d{2}$/.test(validade)) {
            alert("Validade deve estar no formato MM/YY");
            return;
        }

        // Validar CVV (3 ou 4 dígitos)
        if (!/^\d{3,4}$/.test(cv)) {
            alert("CVV deve ter 3 ou 4 dígitos");
            return;
        }

        // Recuperar token do localStorage
        const token = localStorage.getItem("token");
        
        if (!token) {
            alert("Você precisa estar logado para cadastrar um cartão");
            window.location.href = "login.html";
            return;
        }

        // =========================
        // REQUISIÇÃO
        // =========================

        const resposta = await fetch("http://localhost:3000/cartoes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                nomeC,
                ndcartoes,
                validade,
                cv
            })
        });

        const dados = await resposta.json();

        // =========================
        // ERRO
        // =========================

        if (!resposta.ok) {
            alert(dados.erro || "Erro ao cadastrar cartão");
            return;
        }

        // =========================
        // SUCESSO
        // =========================

        alert("Cartão cadastrado com sucesso!");
        formCartao.reset();
        
        // Resetar preview
        document.getElementById("previewName").textContent = "SEU NOME";
        document.getElementById("previewNumber").textContent = "0000 0000 0000 0000";
        document.getElementById("previewValidity").textContent = "MM/YY";
        
        // Redirecionar para a página de pagamento ou perfil
        window.location.href = "pagamento.html";

    } catch (erro) {
        console.log("ERRO CADASTRO CARTÃO:", erro);
        alert("Erro no servidor");

    } finally {
        botao.disabled = false;
        botao.innerHTML = "Cadastrar Cartão";
    }
});
