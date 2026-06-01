const areaUsuario =
    document.getElementById("areaUsuario");

const usuario = JSON.parse(
    localStorage.getItem("usuarioLogado")
);

if (usuario && areaUsuario) {

    areaUsuario.innerHTML = `
        <span>
            👋 ${usuario.nome}
        </span>

        <button id="logoutBtn">
            Sair
        </button>
    `;

    document
        .getElementById("logoutBtn")
        .addEventListener("click", () => {

            localStorage.removeItem(
                "usuarioLogado"
            );

            location.reload();
        });
}