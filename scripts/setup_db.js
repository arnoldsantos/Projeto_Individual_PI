// script mínimo para criar a tabela usuario (apenas campos essenciais para teste)
require('dotenv').config({ path: './.env.dev' });
const db = require('../src/database/config');

const sqls = [
  `CREATE TABLE IF NOT EXISTS usuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
  );`
];

async function run() {
  try {
    for (const s of sqls) {
      await db.executar(s);
      console.log('OK:', s.split('\n')[0].trim().slice(0,60));
    }
    console.log('Tabelas criadas/validadas.');
    process.exit(0);
  } catch (e) {
    console.error('Erro ao criar tabelas:', e.sqlMessage || e.message || e);
    process.exit(1);
  }
}

run();
