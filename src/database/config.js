var mysql = require("mysql2");

// CONEXÃO DO BANCO MYSQL SERVER
var mySqlConfig = {
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
};

// executar(instrucao, params): os valores vão em params usando "?" na instrução.
// Isso evita injeção de SQL e resolve apóstrofos e acentos no texto.
function executar(instrucao, params) {
    params = params || [];

    if (process.env.AMBIENTE_PROCESSO !== "producao" && process.env.AMBIENTE_PROCESSO !== "desenvolvimento") {
        console.log("\nO AMBIENTE (produção OU desenvolvimento) NÃO FOI DEFINIDO EM .env OU dev.env OU app.js\n");
        return Promise.reject("AMBIENTE NÃO CONFIGURADO EM .env");
    }

    return new Promise(function (resolve, reject) {
        var conexao = mysql.createConnection(mySqlConfig);

        conexao.connect(function (erroConexao) {
            if (erroConexao) {
                console.log("ERRO AO CONECTAR NO MySQL SERVER:", erroConexao.sqlMessage || erroConexao.message);
                conexao.destroy();
                return reject(erroConexao);
            }

            conexao.query(instrucao, params, function (erro, resultados) {
                conexao.end();
                if (erro) {
                    return reject(erro);
                }
                resolve(resultados);
            });
        });

        conexao.on('error', function (erro) {
            console.log("ERRO NO MySQL SERVER:", erro.sqlMessage || erro.message);
        });
    });
}

module.exports = {
    executar
};
