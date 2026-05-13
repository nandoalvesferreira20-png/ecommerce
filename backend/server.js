const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =========================
// UPLOAD DE IMAGENS
// =========================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// =========================
// PRODUTOS
// =========================

app.get("/produtos", (req, res) => {
  const produtos = JSON.parse(
    fs.readFileSync(path.join(__dirname, "produtos.json"))
  );

  res.json(produtos);
});

app.post("/produtos", upload.single("imagem"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      erro: "Imagem não enviada"
    });
  }

  const produtos = JSON.parse(
    fs.readFileSync(path.join(__dirname, "produtos.json"))
  );

  const novoProduto = {
    id: Date.now(),
    nome: req.body.nome,
    preco: req.body.preco,
    descricao: req.body.descricao,
    categoria: req.body.categoria,
    imagem: `http://localhost:3000/uploads/${req.file.filename}`
  };

  produtos.push(novoProduto);

  fs.writeFileSync(
    path.join(__dirname, "produtos.json"),
    JSON.stringify(produtos, null, 2)
  );

  res.json({
    mensagem: "Produto salvo!",
    produto: novoProduto
  });
});

app.delete("/produtos/:id", (req, res) => {
  const id = Number(req.params.id);

  const produtos = JSON.parse(
    fs.readFileSync(path.join(__dirname, "produtos.json"))
  );

  const produtosAtualizados =
    produtos.filter(produto => produto.id !== id);

  fs.writeFileSync(
    path.join(__dirname, "produtos.json"),
    JSON.stringify(produtosAtualizados, null, 2)
  );

  res.json({
    mensagem: "Produto excluído!"
  });
});

// =========================
// CADASTRO
// =========================

app.post("/cadastro", (req, res) => {
  const { nome, email, telefone, senha } = req.body;

  if (!nome || !email || !telefone || !senha) {
    return res.status(400).json({
      erro: "Preencha todos os campos"
    });
  }

  const caminhoUsuarios =
    path.join(__dirname, "usuarios.json");

  const usuarios = JSON.parse(
    fs.readFileSync(caminhoUsuarios)
  );

  const usuarioExiste = usuarios.find(
    usuario => usuario.email === email
  );

  if (usuarioExiste) {
    return res.status(400).json({
      erro: "E-mail já cadastrado"
    });
  }

  const novoUsuario = {
    id: Date.now(),
    nome,
    email,
    telefone,
    senha
  };

  usuarios.push(novoUsuario);

  fs.writeFileSync(
    caminhoUsuarios,
    JSON.stringify(usuarios, null, 2)
  );

  res.json({
    mensagem: "Usuário cadastrado com sucesso!"
  });
});

// =========================
// LOGIN
// =========================

app.post("/login", (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({
      erro: "Preencha e-mail e senha"
    });
  }

  const caminhoUsuarios =
    path.join(__dirname, "usuarios.json");

  const usuarios = JSON.parse(
    fs.readFileSync(caminhoUsuarios)
  );

  const usuario = usuarios.find(
    usuario => usuario.email === email && usuario.senha === senha
  );

  if (!usuario) {
    return res.status(401).json({
      erro: "E-mail ou senha inválidos"
    });
  }

  res.json({
    mensagem: "Login realizado com sucesso!",
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone
    }
  });
});

// =========================
// FEEDBACKS
// =========================

app.get("/feedbacks", (req, res) => {
  const caminhoFeedbacks =
    path.join(__dirname, "feedbacks.json");

  const feedbacks = JSON.parse(
    fs.readFileSync(caminhoFeedbacks)
  );

  res.json(feedbacks);
});

app.post("/feedbacks", (req, res) => {
  const { nome, avaliacao, mensagem } = req.body;

  if (!nome || !avaliacao || !mensagem) {
    return res.status(400).json({
      erro: "Preencha todos os campos"
    });
  }

  const caminhoFeedbacks =
    path.join(__dirname, "feedbacks.json");

  const feedbacks = JSON.parse(
    fs.readFileSync(caminhoFeedbacks)
  );

  const novoFeedback = {
    id: Date.now(),
    nome,
    avaliacao,
    mensagem,
    data: new Date().toLocaleDateString("pt-BR")
  };

  feedbacks.push(novoFeedback);

  fs.writeFileSync(
    caminhoFeedbacks,
    JSON.stringify(feedbacks, null, 2)
  );

  res.json({
    mensagem: "Feedback enviado com sucesso!",
    feedback: novoFeedback
  });
});

// =========================
// SERVIDOR
// =========================

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});