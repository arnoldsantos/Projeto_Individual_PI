var database = require("../database/config");

function cadastrar(resposta) {
    var instrucaoSql = `
        INSERT INTO resposta (
            fk_usuario, area, artista, impacto_emocional, impacto_pratico, horas,
            influenciou_estudo, conversou_sobre, depoimento
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
    var params = [
        resposta.fk_usuario,
        resposta.area,
        resposta.artista,
        resposta.impacto_emocional,
        resposta.impacto_pratico,
        resposta.horas,
        resposta.influenciou_estudo,
        resposta.conversou_sobre,
        resposta.depoimento
    ];
    return database.executar(instrucaoSql, params);
}

// devolve a lista no formato que o dashboard.js espera
function listar() {
    var instrucao = `
        SELECT
            idResposta, fk_usuario, area, artista,
            impacto_emocional AS impactoEmocional,
            impacto_pratico   AS impactoPratico,
            horas,
            influenciou_estudo AS influenciouEstudo,
            conversou_sobre    AS conversouSobre,
            depoimento,
            dtResposta
        FROM resposta
        ORDER BY dtResposta DESC;
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
        ORDER BY respostas DESC, artista ASC
        LIMIT ?;
    `;
    return database.executar(instrucao, [Number(limit) || 5]);
}

function obterAgregadosAreas() {
    var instrucao = `
        SELECT area, COUNT(*) AS respostas
        FROM resposta
        GROUP BY area
        ORDER BY respostas DESC, area ASC;
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

function obterDepoimentos() {
    var instrucao = `
        SELECT depoimento, artista, area, dtResposta
        FROM resposta
        WHERE depoimento IS NOT NULL AND TRIM(depoimento) <> ''
        ORDER BY dtResposta DESC
        LIMIT 50;
    `;
    return database.executar(instrucao);
}

function obterRanking() {
    var instrucao = `
        SELECT artista,
               COUNT(*) AS mencoes,
               ROUND(SUM(horas), 1) AS horas_totais,
               ROUND(AVG(horas), 1) AS horas_medias,
               ROUND(AVG((impacto_emocional + impacto_pratico) / 2 / 5 * 100), 1) AS impacto_medio
        FROM resposta
        GROUP BY artista
        ORDER BY mencoes DESC, artista ASC;
    `;
    return database.executar(instrucao);
}

function obterImpactos() {
    var instrucao = `
        SELECT
            ROUND(AVG(impacto_emocional), 2) AS media_emocional,
            ROUND(AVG(impacto_pratico), 2) AS media_pratico
        FROM resposta;
    `;
    return database.executar(instrucao);
}

function obterComportamento() {
    var instrucao = `
        SELECT
            SUM(CASE WHEN influenciou_estudo = 1 THEN 1 ELSE 0 END) AS estudo_sim,
            SUM(CASE WHEN influenciou_estudo = 0 THEN 1 ELSE 0 END) AS estudo_nao,
            SUM(CASE WHEN conversou_sobre = 1 THEN 1 ELSE 0 END) AS conversa_sim,
            SUM(CASE WHEN conversou_sobre = 0 THEN 1 ELSE 0 END) AS conversa_nao,
            COUNT(*) AS total
        FROM resposta;
    `;
    return database.executar(instrucao);
}

function obterAreasImpacto() {
    var instrucao = `
        SELECT area,
               COUNT(*) AS respostas,
               ROUND(AVG((impacto_emocional + impacto_pratico) / 2 / 5 * 100), 1) AS impacto_medio
        FROM resposta
        GROUP BY area
        ORDER BY impacto_medio DESC, area ASC;
    `;
    return database.executar(instrucao);
}

module.exports = {
    cadastrar,
    listar,
    obterAgregadosArtistas,
    obterAgregadosAreas,
    obterKpis,
    obterDepoimentos,
    obterRanking,
    obterImpactos,
    obterComportamento,
    obterAreasImpacto
};
