require('dotenv').config({ path: './.env.dev' });
const usuarioModel = require('../src/models/usuarioModel');

async function run() {
  try {
    // tenta cadastrar um usuário de teste (ignora erro se já existir)
    const nome = 'Usuario Teste';
    const email = 'teste_api@example.com';
    const senha = 'senha1234';
    const fkEmpresa = 1;

    try {
      const res = await usuarioModel.cadastrar(nome, email, senha, fkEmpresa);
      console.log('Cadastro OK, insertId:', res.insertId);
    } catch (e) {
      console.log('Cadastro falhou (pode já existir):', e.sqlMessage || e.message || e);
    }

    // tenta autenticar
    const resultado = await usuarioModel.autenticar(email, senha);
    console.log('Resultado autenticar:', resultado);
    process.exit(0);
  } catch (e) {
    console.error('Erro no teste:', e.sqlMessage || e.message || e);
    process.exit(1);
  }
}

run();
