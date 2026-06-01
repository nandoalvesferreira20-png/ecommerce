import fs from "fs";
const caminho = "./src/database/usuarios.json";
export function lerUsuarios() {
const dados = fs.readFileSync(caminho, "utf-8");
return JSON.parse(dados);
}
export function salvarUsuarios(usuarios) {
fs.writeFileSync(
caminho,
JSON.stringify(usuarios, null, 2)
);
}