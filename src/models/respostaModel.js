var database = require("../database/config");

function cadastrar(resposta) {
    var instrucaoSql = `
        INSERT INTO resposta (
            fk_usuario, area, area_outra, artista, impacto, horas, depoimento
        ) VALUES (?, ?, ?, ?, ?, ?, ?);
    `;
    var params = [
        resposta.fk_usuario,
        resposta.area,
        resposta.area_outra,
        resposta.artista,
        resposta.impacto,
        resposta.horas,
        resposta.depoimento
    ];
    return database.executar(instrucaoSql, params);
}

// devolve a lista no formato que o dashboard.js espera
function listar() {
    var instrucao = `
        SELECT
            idResposta, fk_usuario, area, artista,
            impacto AS impacto,
            horas,
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
               ROUND(AVG(impacto) / 5 * 100, 1) AS avg_score,
               ROUND(AVG(horas), 1) AS horas_medias
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
            ROUND(AVG(impacto) / 5 * 100, 1) AS avg_impacto,
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
               ROUND(AVG(horas), 1) AS horas_medias,
               ROUND(AVG(impacto) / 5 * 100, 1) AS impacto_medio
        FROM resposta
        GROUP BY artista
        ORDER BY mencoes DESC, artista ASC;
    `;
    return database.executar(instrucao);
}

// removed: we use a single impacto field now

function obterHorasImpacto() {
    var instrucao = `
        SELECT impacto AS nota, COUNT(*) AS quantidade, ROUND(AVG(horas), 1) AS horas_media
        FROM resposta
        GROUP BY impacto
        ORDER BY impacto ASC;
    `;
    return database.executar(instrucao);
}

function obterArtistasSimples() {
    var instrucao = `
        SELECT artista FROM resposta;
    `;
    return database.executar(instrucao);
}

// comportamento removed

function obterAreasImpacto() {
    var instrucao = `
        SELECT area,
               COUNT(*) AS respostas,
               ROUND(AVG(impacto) / 5 * 100, 1) AS impacto_medio
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
    obterHorasImpacto,
    obterArtistasSimples,
    obterAreasImpacto
};
