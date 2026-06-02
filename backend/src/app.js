const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2/promise");

const app = express();

app.use(cors({
  origin: "http://127.0.0.1:5500",

    credentials: true

}));
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =========================
// UPLOAD DE IMAGENS
// =========================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
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

app.post("/produtos", upload.array("imagens", 5), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      erro: "Nenhuma imagem enviada"
    });
  }

  const produtos = JSON.parse(
    fs.readFileSync(path.join(__dirname, "produtos.json"))
  );

  const imagens = req.files.map(file => {
    return `http://localhost:3000/uploads/${file.filename}`;
  });

    const novoProduto = {
      id: novoId,
      nome: req.body.nome,
      preco: req.body.preco,
      descricao: req.body.descricao,
      imagens
    };

    res.json({
      mensagem: "Produto salvo!",
      produto: novoProduto
    });
  } catch (erro) {
    console.error("Erro ao salvar produto:", erro);
    res.status(500).json({ erro: "Erro ao salvar produto" });
  }
});

app.delete("/produtos/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    await pool.query("DELETE FROM produtos WHERE id_prod = ?", [id]);
    res.json({ mensagem: "Produto excluído!" });
  } catch (erro) {
    console.error("Erro ao excluir produto:", erro);
    res.status(500).json({ erro: "Erro ao excluir produto" });
  }
});

// =========================
// CADASTRO
// =========================

app.post("/usuarios", async (req, res) => {
  const { nome, email, telefone, senha } = req.body;

  if (!nome || !email || !telefone || !senha) {
    return res.status(400).json({
      erro: "Preencha todos os campos"
    });
  }

  try {
    const [existing] = await pool.query(
      "SELECT id_usuarios FROM usuarios WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        erro: "E-mail já cadastrado"
      });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    await pool.query(
      "INSERT INTO usuarios (nome_user, email, telefone, senha) VALUES (?, ?, ?, ?)",
      [nome, email, telefone, senhaCriptografada]
    );

    res.json({ mensagem: "Usuário cadastrado com sucesso!" });
  } catch (erro) {
    console.error("Erro ao cadastrar usuário:", erro);
    res.status(500).json({ erro: "Erro ao cadastrar usuário" });
  }
});

// =========================
// LOGIN
// =========================

app.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({
      erro: "Preencha e-mail e senha"
    });
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    const usuario = rows[0];

    if (!usuario) {
      return res.status(401).json({
        erro: "E-mail ou senha inválidos"
      });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).json({
        erro: "E-mail ou senha inválidos"
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id_usuarios,
        email: usuario.email
      },
      JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    res.json({
      mensagem: "Login realizado com sucesso!",
      token,
      usuario: {
        id: usuario.id_usuarios,
        nome: usuario.nome_user,
        email: usuario.email,
        telefone: usuario.telefone
      }
    });
  } catch (erro) {
    console.error("Erro no login:", erro);
    res.status(500).json({ erro: "Erro ao fazer login" });
  }
});

// =========================
// CARRINHO
// =========================

app.get("/carrinho", async (req, res) => {
  const usuarioId = extrairUsuarioId(req);

  if (!usuarioId) {
    return res.status(400).json({ erro: "Usuário não informado" });
  }

  try {
    const [rows] = await pool.query(
      `SELECT c.id_carrinho, c.id_produto, c.quantidade, p.nome_prod, p.preco, p.descricao, p.imagens
       FROM carrinho c
       JOIN produtos p ON p.id_prod = c.id_produto
       WHERE c.id_usuario = ?`,
      [usuarioId]
    );

    const itens = rows.map(row => ({
      id: row.id_carrinho,
      produtoId: row.id_produto,
      quantidade: row.quantidade,
      nome: row.nome_prod,
      preco: Number(row.preco),
      descricao: row.descricao,
      imagens: parseImagensField(row.imagens)
    }));

    res.json(itens);
  } catch (erro) {
    console.error("Erro ao buscar carrinho:", erro);
    res.status(500).json({ erro: "Erro ao buscar carrinho" });
  }
});

app.post("/carrinho", async (req, res) => {
  const usuarioId = extrairUsuarioId(req);
  const { produtoId, quantidade } = req.body;

  if (!usuarioId || !produtoId || !quantidade || quantidade < 1) {
    return res.status(400).json({ erro: "Dados do carrinho inválidos" });
  }

  try {
    const [existing] = await pool.query(
      "SELECT id_carrinho, quantidade FROM carrinho WHERE id_usuario = ? AND id_produto = ?",
      [usuarioId, produtoId]
    );

    if (existing.length > 0) {
      const item = existing[0];
      await pool.query(
        "UPDATE carrinho SET quantidade = ? WHERE id_carrinho = ?",
        [item.quantidade + Number(quantidade), item.id_carrinho]
      );
    } else {
      await pool.query(
        "INSERT INTO carrinho (id_usuario, id_produto, quantidade) VALUES (?, ?, ?)",
        [usuarioId, produtoId, quantidade]
      );
    }

    res.json({ mensagem: "Item adicionado ao carrinho" });
  } catch (erro) {
    console.error("Erro ao adicionar ao carrinho:", erro);
    res.status(500).json({ erro: "Erro ao adicionar ao carrinho" });
  }
});

app.put("/carrinho/:id", async (req, res) => {
  const usuarioId = extrairUsuarioId(req);
  const idCarrinho = Number(req.params.id);
  const { quantidade } = req.body;

  if (!usuarioId || !idCarrinho || !quantidade || quantidade < 1) {
    return res.status(400).json({ erro: "Dados inválidos" });
  }

  try {
    await pool.query(
      "UPDATE carrinho SET quantidade = ? WHERE id_carrinho = ? AND id_usuario = ?",
      [quantidade, idCarrinho, usuarioId]
    );
    res.json({ mensagem: "Quantidade atualizada" });
  } catch (erro) {
    console.error("Erro ao atualizar carrinho:", erro);
    res.status(500).json({ erro: "Erro ao atualizar carrinho" });
  }
});

app.delete("/carrinho/:id", async (req, res) => {
  const usuarioId = extrairUsuarioId(req);
  const idCarrinho = Number(req.params.id);

  if (!usuarioId || !idCarrinho) {
    return res.status(400).json({ erro: "Dados inválidos" });
  }

  try {
    await pool.query(
      "DELETE FROM carrinho WHERE id_carrinho = ? AND id_usuario = ?",
      [idCarrinho, usuarioId]
    );
    res.json({ mensagem: "Item removido do carrinho" });
  } catch (erro) {
    console.error("Erro ao remover item do carrinho:", erro);
    res.status(500).json({ erro: "Erro ao remover item do carrinho" });
  }
});

app.delete("/carrinho", async (req, res) => {
  const usuarioId = extrairUsuarioId(req);

  if (!usuarioId) {
    return res.status(400).json({ erro: "Usuário não informado" });
  }

  try {
    await pool.query("DELETE FROM carrinho WHERE id_usuario = ?", [usuarioId]);
    res.json({ mensagem: "Carrinho limpo" });
  } catch (erro) {
    console.error("Erro ao limpar carrinho:", erro);
    res.status(500).json({ erro: "Erro ao limpar carrinho" });
  }
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
module.exports = app;