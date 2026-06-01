import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import {
  lerUsuarios,
  salvarUsuarios
} from "../utils/readDatabase.js";

// ============================
// CADASTRO
// ============================

export async function cadastro(req, res) {
  try {

    const {
      nome,
      email,
      senha
    } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        erro: "Preencha todos os campos"
      });
    }

    if (senha.length < 6) {
      return res.status(400).json({
        erro: "Senha muito curta"
      });
    }

    const usuarios = lerUsuarios();

    const usuarioExiste = usuarios.find(
      usuario => usuario.email === email
    );

    if (usuarioExiste) {
      return res.status(400).json({
        erro: "Email já cadastrado"
      });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const novoUsuario = {
      id: Date.now(),
      nome,
      email,
      senha: senhaHash
    };

    usuarios.push(novoUsuario);

    salvarUsuarios(usuarios);

    res.status(201).json({
      sucesso: true,
      mensagem: "Usuário cadastrado"
    });

  } catch (erro) {

    console.log(erro);

    res.status(500).json({
      erro: "Erro interno"
    });

  }
}

// ============================
// LOGIN
// ============================

export async function login(req, res) {
  try {

    const {
      email,
      senha
    } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        erro: "Preencha todos os campos"
      });
    }

    const usuarios = lerUsuarios();

    const usuario = usuarios.find(
      usuario => usuario.email === email
    );

    if (!usuario) {
      return res.status(401).json({
        erro: "Email ou senha inválidos"
      });
    }

    const senhaCorreta = await bcrypt.compare(
      senha,
      usuario.senha
    );

    if (!senhaCorreta) {
      return res.status(401).json({
        erro: "Email ou senha inválidos"
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h"
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAge: 1000 * 60 * 60
    });

    res.status(200).json({
      sucesso: true,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      }
    });

  } catch (erro) {

    console.log(erro);

    res.status(500).json({
      erro: "Erro interno"
    });

  }
}

// ============================
// LOGOUT
// ============================

export function logout(req, res) {

  res.clearCookie("token");

  res.json({
    sucesso: true
  });

}