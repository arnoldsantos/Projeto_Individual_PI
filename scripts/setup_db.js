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
  , `CREATE TABLE IF NOT EXISTS resposta (
    id INT PRIMARY KEY AUTO_INCREMENT,
    area VARCHAR(100) NOT NULL,
    artista VARCHAR(200) NOT NULL,
    impacto_emocional TINYINT NOT NULL,
    impacto_pratico TINYINT NOT NULL,
    impacto_social TINYINT NOT NULL,
    impacto_media DECIMAL(4,2) NOT NULL,
    impacto_slider TINYINT NOT NULL,
    impacto_composite INT NOT NULL,
    horas_ouvidas DECIMAL(8,2) DEFAULT 0,
    influenciou_estudo TINYINT DEFAULT 0,
    conversou_sobre TINYINT DEFAULT 0,
    depoimento VARCHAR(1000),
    usuario_id INT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
  );`
  , `CREATE TABLE IF NOT EXISTS artista_aggregate (
    artista VARCHAR(200) PRIMARY KEY,
    respostas INT DEFAULT 0,
    avg_composite DECIMAL(6,2) DEFAULT 0,
    total_hours DECIMAL(10,2) DEFAULT 0,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );`
  , `CREATE TABLE IF NOT EXISTS area_aggregate (
    area VARCHAR(100) PRIMARY KEY,
    respostas INT DEFAULT 0,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
