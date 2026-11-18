var respostaModel = require("../models/respostaModel");

function cadastrar(req, res) {
    // mapear campos do body para o objeto esperado pelo model
    var body = req.body || {};

    if (!body.artista || !body.area) {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes: artista e area' });
    }

    var resposta = {
        area: body.area.replace(/'/g, "''"),
        artista: body.artista.replace(/'/g, "''"),
        impacto_emocional: Number(body.impacto_emocional) || 3,
        impacto_pratico: Number(body.impacto_pratico) || 3,
        impacto_social: Number(body.impacto_social) || 3,
        impacto_media: Number(body.impacto_media) || 3,
        impacto_slider: Number(body.impacto_slider) || 50,
        impacto_composite: Number(body.impacto_composite) || 50,
        horas_ouvidas: Number(body.horas_ouvidas) || 0,
        influenciou_estudo: (body.influenciou_estudo === 'sim' || body.influenciou_estudo === '1' || body.influenciou_estudo === true),
        conversou_sobre: (body.conversou_sobre === 'sim' || body.conversou_sobre === '1' || body.conversou_sobre === true),
        depoimento: (body.depoimento || "").replace(/'/g, "''"),
        usuario_id: body.usuario_id || null
    };

    respostaModel.cadastrar(resposta).then(function (resultado) {
        res.status(201).json({ message: 'Resposta cadastrada', resultado: resultado });
    }).catch(function (erro) {
        console.log('Erro ao cadastrar resposta:', erro);
        res.status(500).json({ error: erro.sqlMessage || erro.message || erro });
    });
}

function agregados(req, res) {
    // retorna os dados que o frontend precisa para montar o dashboard
    Promise.all([
        respostaModel.obterKpis(),
        respostaModel.obterAgregadosArtistas(10),
        respostaModel.obterAgregadosAreas()
    ]).then(function (results) {
        var kpis = results[0] && results[0][0] ? results[0][0] : { total_respostas: 0, avg_impacto: 0, avg_horas: 0 };
        // garantir que os campos numéricos sejam números (o driver pode retornar strings)
        kpis.total_respostas = Number(kpis.total_respostas) || 0;
        kpis.avg_impacto = Number(kpis.avg_impacto) || 0;
        kpis.avg_horas = Number(kpis.avg_horas) || 0;
        var artistas = results[1] || [];
        var areas = results[2] || [];

        // calcular porcentagem por área
        var total = Number(kpis.total_respostas) || artistas.reduce((a,b)=>a,0) || areas.reduce((s,o)=>s+o.respostas,0);
        if (!total) total = areas.reduce((s,o)=>s+o.respostas,0) || 0;

        var areasPct = areas.map(function (a) {
            return { area: a.area, respostas: a.respostas, pct: total ? Math.round((a.respostas / total) * 100) : 0 };
        });

        res.json({ kpis: kpis, artistas: artistas, areas: areasPct });
    }).catch(function (erro) {
        console.log('Erro ao obter agregados:', erro);
        res.status(500).json({ error: erro.sqlMessage || erro.message || erro });
    });
}

module.exports = {
    cadastrar,
    agregados
};
