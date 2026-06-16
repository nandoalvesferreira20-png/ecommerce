const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
<<<<<<< HEAD
=======
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2/promise");
>>>>>>> aac8d9148fd14ec61a2f46796d083ce061fe8c32

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

<<<<<<< HEAD
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
=======
const JWT_SECRET = process.env.JWT_SECRET || "segredo_temporario";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "ecommerce",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

function parseImagensField(valor) {
  if (!valor) return [];
  if (Array.isArray(valor)) return valor;

  if (typeof valor === "string") {
    const texto = valor.trim();
    if (texto.startsWith("[") || texto.startsWith("{")) {
      try {
        const parsed = JSON.parse(texto);
        if (Array.isArray(parsed)) return parsed;
      } catch (erro) {
        return [];
      }
    }

    return texto
      .split(",")
      .map(item => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeProduto(produto) {
  return {
    id: produto.id_prod,
    nome: produto.nome_prod || produto.nome,
    preco: Number(produto.preco),
    descricao: produto.descricao || "",
    imagens: parseImagensField(produto.imagens)
  };
}

async function sincronizarProdutosDoJsonSeNecessario() {
  const [countRows] = await pool.query("SELECT COUNT(*) AS total FROM produtos");

  if (!countRows || countRows[0].total === 0) {
    const produtosJson = JSON.parse(fs.readFileSync(path.join(__dirname, "produtos.json"), "utf8"));

    for (const produto of produtosJson) {
      const imagensString = JSON.stringify(produto.imagens || []);
      await pool.query(
        "INSERT IGNORE INTO produtos (id_prod, nome_prod, preco, descricao, imagens) VALUES (?, ?, ?, ?, ?)",
        [produto.id, produto.nome, produto.preco, produto.descricao || "", imagensString]
      );
    }
  }
}

function extrairUsuarioId(req) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      return payload.id;
    } catch (erro) {
      return null;
    }
  }

  const usuarioId = Number(req.query.usuarioId || req.body.usuarioId || req.headers["x-user-id"]);
  return Number.isInteger(usuarioId) && usuarioId > 0 ? usuarioId : null;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "uploads")),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
>>>>>>> aac8d9148fd14ec61a2f46796d083ce061fe8c32
});

const upload = multer({ storage });

<<<<<<< HEAD
// =========================
// PRODUTOS
// =========================

app.get("/produtos", (req, res) => {
  const produtos = JSON.parse(
    fs.readFileSync(path.join(__dirname, "produtos.json"))
  );

  res.json(produtos);
});

app.post("/produtos", upload.array("imagens", 5), (req, res) => {
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
    id: Date.now(),
    nome: req.body.nome,
    preco: req.body.preco,
    descricao: req.body.descricao,
    categoria: req.body.categoria,
    imagens: imagens
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
=======
app.get("/produtos", async (req, res) => {
  try {
    await sincronizarProdutosDoJsonSeNecessario();
    const [rows] = await pool.query("SELECT * FROM produtos");
    res.json(rows.map(normalizeProduto));
  } catch (erro) {
    console.error("Erro ao carregar produtos:", erro);
    res.status(500).json({ erro: "Erro ao carregar produtos" });
  }
});

app.post("/produtos", upload.array("imagens", 5), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ erro: "Nenhuma imagem enviada" });
  }

  try {
    const imagens = req.files.map(file => `http://localhost:3000/uploads/${file.filename}`);
    const novoId = Date.now();

    await pool.query(
      "INSERT INTO produtos (id_prod, nome_prod, preco, descricao, imagens) VALUES (?, ?, ?, ?, ?)",
      [novoId, req.body.nome, req.body.preco, req.body.descricao || "", JSON.stringify(imagens)]
    );

    res.json({
      mensagem: "Produto salvo!",
      produto: {
        id: novoId,
        nome: req.body.nome,
        preco: req.body.preco,
        descricao: req.body.descricao,
        imagens
      }
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

app.post("/usuarios", async (req, res) => {
  const { nome, email, telefone, senha } = req.body;

  if (!nome || !email || !telefone || !senha) {
    return res.status(400).json({ erro: "Preencha todos os campos" });
  }

  try {
    const [existing] = await pool.query("SELECT id_usuarios FROM usuarios WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ erro: "E-mail já cadastrado" });
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

app.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: "Preencha e-mail e senha" });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    const usuario = rows[0];

    if (!usuario) {
      return res.status(401).json({ erro: "E-mail ou senha inválidos" });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ erro: "E-mail ou senha inválidos" });
    }

    const token = jwt.sign({ id: usuario.id_usuarios, email: usuario.email }, JWT_SECRET, { expiresIn: "1d" });

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

app.get("/carrinho", async (req, res) => {
  const usuarioId = extrairUsuarioId(req);
  if (!usuarioId) return res.status(400).json({ erro: "Usuário não informado" });

  try {
    const [rows] = await pool.query(
      `SELECT c.id_carrinho, c.id_produto, c.quantidade, p.nome_prod, p.preco, p.descricao, p.imagens
       FROM carrinho c
       JOIN produtos p ON p.id_prod = c.id_produto
       WHERE c.id_usuario = ?`,
      [usuarioId]
    );

    res.json(rows.map(row => ({
      id: row.id_carrinho,
      produtoId: row.id_produto,
      quantidade: row.quantidade,
      nome: row.nome_prod,
      preco: Number(row.preco),
      descricao: row.descricao,
      imagens: parseImagensField(row.imagens)
    })));
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
    const [existing] = await pool.query("SELECT id_carrinho, quantidade FROM carrinho WHERE id_usuario = ? AND id_produto = ?", [usuarioId, produtoId]);

    if (existing.length > 0) {
      await pool.query("UPDATE carrinho SET quantidade = ? WHERE id_carrinho = ?", [existing[0].quantidade + Number(quantidade), existing[0].id_carrinho]);
    } else {
      await pool.query("INSERT INTO carrinho (id_usuario, id_produto, quantidade) VALUES (?, ?, ?)", [usuarioId, produtoId, quantidade]);
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
    await pool.query("UPDATE carrinho SET quantidade = ? WHERE id_carrinho = ? AND id_usuario = ?", [quantidade, idCarrinho, usuarioId]);
    res.json({ mensagem: "Quantidade atualizada" });
  } catch (erro) {
    console.error("Erro ao atualizar carrinho:", erro);
    res.status(500).json({ erro: "Erro ao atualizar carrinho" });
  }
});

app.delete("/carrinho/:id", async (req, res) => {
  const usuarioId = extrairUsuarioId(req);
  const idCarrinho = Number(req.params.id);

  if (!usuarioId || !idCarrinho) return res.status(400).json({ erro: "Dados inválidos" });

  try {
    await pool.query("DELETE FROM carrinho WHERE id_carrinho = ? AND id_usuario = ?", [idCarrinho, usuarioId]);
    res.json({ mensagem: "Item removido do carrinho" });
  } catch (erro) {
    console.error("Erro ao remover item do carrinho:", erro);
    res.status(500).json({ erro: "Erro ao remover item do carrinho" });
  }
});

app.delete("/carrinho", async (req, res) => {
  const usuarioId = extrairUsuarioId(req);
  if (!usuarioId) return res.status(400).json({ erro: "Usuário não informado" });

  try {
    await pool.query("DELETE FROM carrinho WHERE id_usuario = ?", [usuarioId]);
    res.json({ mensagem: "Carrinho limpo" });
  } catch (erro) {
    console.error("Erro ao limpar carrinho:", erro);
    res.status(500).json({ erro: "Erro ao limpar carrinho" });
  }
});

app.get("/feedbacks", (req, res) => {
  const caminhoFeedbacks = path.join(__dirname, "feedbacks.json");
  res.json(JSON.parse(fs.readFileSync(caminhoFeedbacks, "utf8")));
>>>>>>> aac8d9148fd14ec61a2f46796d083ce061fe8c32
});

app.post("/feedbacks", (req, res) => {
  const { nome, avaliacao, mensagem } = req.body;
<<<<<<< HEAD

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
=======
  if (!nome || !avaliacao || !mensagem) return res.status(400).json({ erro: "Preencha todos os campos" });

  const caminhoFeedbacks = path.join(__dirname, "feedbacks.json");
  const feedbacks = JSON.parse(fs.readFileSync(caminhoFeedbacks, "utf8"));
  const novoFeedback = { id: Date.now(), nome, avaliacao, mensagem, data: new Date().toLocaleDateString("pt-BR") };

  feedbacks.push(novoFeedback);
  fs.writeFileSync(caminhoFeedbacks, JSON.stringify(feedbacks, null, 2));

  res.json({ mensagem: "Feedback enviado com sucesso!", feedback: novoFeedback });
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
>>>>>>> aac8d9148fd14ec61a2f46796d083ce061fe8c32
