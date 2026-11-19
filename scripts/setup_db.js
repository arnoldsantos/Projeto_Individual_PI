// Script mínimo para criar as tabelas do projeto conforme o banco real
require('dotenv').config({ path: './.env.dev' });
const db = require('../src/database/config');

const sqls = [
  `CREATE TABLE IF NOT EXISTS usuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
  );`
  , `CREATE TABLE IF NOT EXISTS resposta (
    idResposta INT PRIMARY KEY AUTO_INCREMENT,
    fk_usuario INT NULL,
    area VARCHAR(40) NOT NULL,
    area_outra VARCHAR(40) NULL,
    artista VARCHAR(80) NOT NULL,
    impacto TINYINT NOT NULL,
    horas DECIMAL(8,2) DEFAULT 0,
    depoimento VARCHAR(280),
    dtResposta DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resposta_usuario FOREIGN KEY (fk_usuario) REFERENCES usuario(id)
  );`
];

async function run() {
  try {
    for (const s of sqls) {
      await db.executar(s);
      console.log('OK:', s.split('\n')[0].trim().slice(0, 60));
    }
    console.log('Tabelas criadas/validadas.');
    process.exit(0);
  } catch (e) {
    console.error('Erro ao criar tabelas:', e.sqlMessage || e.message || e);
    process.exit(1);
  }
}

run();
