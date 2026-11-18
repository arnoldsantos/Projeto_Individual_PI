var database = require("../database/config");

// troca ' por '' para o texto não quebrar o SQL
function texto(valor) {
    return String(valor || "").replace(/\\/g, "\\\\").replace(/'/g, "''");
}

function cadastrar(resposta) {
    var instrucaoSql = `
        INSERT INTO resposta (
            area, artista, impacto_emocional, impacto_pratico, horas,
            influenciou_estudo, conversou_sobre, depoimento
        ) VALUES (
            '${texto(resposta.area)}', '${texto(resposta.artista)}',
            ${Number(resposta.impacto_emocional ?? resposta.impactoEmocional) || 3}, ${Number(resposta.impacto_pratico ?? resposta.impactoPratico) || 3},
            ${Number(resposta.horas_ouvidas ?? resposta.horas) || 0},
            ${ (resposta.influenciou_estudo ?? resposta.influenciouEstudo) ? 1 : 0 }, ${ (resposta.conversou_sobre ?? resposta.conversouSobre) ? 1 : 0 },
            '${texto(resposta.depoimento)}'
        );
    `;
    console.log("Executando a instrução SQL (resposta): \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

// devolve a lista no formato que o dashboard.js espera
function listar() {
    var instrucao = `
        SELECT
            idResposta, area, artista,
            impacto_emocional AS impactoEmocional,
            impacto_pratico   AS impactoPratico,
            horas,
            influenciou_estudo AS influenciouEstudo,
            conversou_sobre    AS conversouSobre,
            depoimento
        FROM resposta;
    `;
    return database.executar(instrucao);
}

function obterAgregadosArtistas(limit) {
    var instrucao = `
        SELECT artista, COUNT(*) AS respostas,
               ROUND(AVG((impacto_emocional + impacto_pratico) / 2 / 5 * 100), 1) AS avg_score,
               ROUND(SUM(horas), 1) AS total_hours
        FROM resposta
        GROUP BY artista
        ORDER BY respostas DESC
        LIMIT ${Number(limit) || 5};
    `;
    return database.executar(instrucao);
}

function obterAgregadosAreas() {
    var instrucao = `
        SELECT area, COUNT(*) AS respostas
        FROM resposta
        GROUP BY area
        ORDER BY respostas DESC;
    `;
    return database.executar(instrucao);
}

function obterKpis() {
    var instrucao = `
        SELECT
            COUNT(*) AS total_respostas,
            ROUND(AVG((impacto_emocional + impacto_pratico) / 2 / 5 * 100), 1) AS avg_impacto,
            ROUND(AVG(horas), 1) AS avg_horas
        FROM resposta;
    `;
    return database.executar(instrucao);
}

module.exports = { cadastrar, listar, obterAgregadosArtistas, obterAgregadosAreas, obterKpis };
