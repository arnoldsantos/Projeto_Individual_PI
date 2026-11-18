var respostaModel = require("../models/respostaModel");

function texto(valor) {
    if (typeof valor !== "string") {
        return "";
    }
    return valor.trim();
}

function inteiro(valor) {
    var numero = Number(valor);
    if (!Number.isInteger(numero)) {
        return null;
    }
    return numero;
}

function simOuNao(valor) {
    if (valor === true || valor === 1 || valor === "1" || valor === "sim") {
        return 1;
    }
    return 0;
}

function cadastrar(req, res) {
    var body = req.body || {};

    // vínculo obrigatório com o usuário logado
    var fkUsuario = inteiro(body.fk_usuario);
    if (fkUsuario === null || fkUsuario <= 0) {
        return res.status(400).json({ erro: "fk_usuario inválido. Faça login para responder." });
    }

    var area = texto(body.area);
    if (area === "") {
        return res.status(400).json({ erro: "Informe a área da vida mais impactada." });
    }
    if (area.length > 40) {
        return res.status(400).json({ erro: "A área deve ter no máximo 40 caracteres." });
    }

    var artista = texto(body.artista);
    if (artista === "") {
        return res.status(400).json({ erro: "Informe o artista que mais te marcou." });
    }
    if (artista.length > 80) {
        return res.status(400).json({ erro: "O artista deve ter no máximo 80 caracteres." });
    }

    var impactoEmocional = inteiro(body.impacto_emocional);
    if (impactoEmocional === null || impactoEmocional < 1 || impactoEmocional > 5) {
        return res.status(400).json({ erro: "O impacto emocional deve ser um número inteiro de 1 a 5." });
    }

    var impactoPratico = inteiro(body.impacto_pratico);
    if (impactoPratico === null || impactoPratico < 1 || impactoPratico > 5) {
        return res.status(400).json({ erro: "O impacto prático deve ser um número inteiro de 1 a 5." });
    }

    var horas = Number(body.horas_ouvidas);
    if (isNaN(horas) || horas < 0 || horas > 1000) {
        return res.status(400).json({ erro: "As horas ouvidas devem ser um número entre 0 e 1000." });
    }

    var depoimento = texto(body.depoimento);
    if (depoimento.length > 280) {
        return res.status(400).json({ erro: "O depoimento deve ter no máximo 280 caracteres." });
    }

    var resposta = {
        fk_usuario: fkUsuario,
        area: area,
        artista: artista,
        impacto_emocional: impactoEmocional,
        impacto_pratico: impactoPratico,
        horas: horas,
        influenciou_estudo: simOuNao(body.influenciou_estudo),
        conversou_sobre: simOuNao(body.conversou_sobre),
        depoimento: depoimento
    };

    respostaModel.cadastrar(resposta).then(function (resultado) {
        res.status(201).json({ mensagem: "Resposta cadastrada", idResposta: resultado.insertId });
    }).catch(function (erro) {
        console.log("Erro ao cadastrar resposta:", erro.sqlMessage || erro.message);

        if (erro.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({ erro: "Usuário não encontrado. Faça login de novo para responder." });
        }

        res.status(500).json({ erro: "Não foi possível salvar a resposta." });
    });
}

function agregados(req, res) {
    respostaModel.obterKpis().then(function (resultadoKpis) {
        var kpis = resultadoKpis && resultadoKpis[0] ? resultadoKpis[0] : {};

        return respostaModel.obterAgregadosArtistas(10).then(function (artistas) {
            return respostaModel.obterAgregadosAreas().then(function (areas) {
                var total = Number(kpis.total_respostas) || 0;

                kpis.total_respostas = total;
                kpis.avg_impacto = Number(kpis.avg_impacto) || 0;
                kpis.avg_horas = Number(kpis.avg_horas) || 0;

                var areasPct = [];
                var i;
                for (i = 0; i < areas.length; i++) {
                    areasPct.push({
                        area: areas[i].area,
                        respostas: Number(areas[i].respostas) || 0,
                        pct: total ? Math.round((Number(areas[i].respostas) / total) * 100) : 0
                    });
                }

                res.json({ kpis: kpis, artistas: artistas || [], areas: areasPct });
            });
        });
    }).catch(function (erro) {
        console.log("Erro ao obter agregados:", erro.sqlMessage || erro.message);
        res.status(500).json({ erro: "Não foi possível carregar os dados do dashboard." });
    });
}

function depoimentos(req, res) {
    respostaModel.obterDepoimentos().then(function (resultado) {
        res.json(resultado || []);
    }).catch(function (erro) {
        console.log("Erro ao obter depoimentos:", erro.sqlMessage || erro.message);
        res.status(500).json({ erro: "Não foi possível carregar os depoimentos." });
    });
}

function ranking(req, res) {
    respostaModel.obterRanking().then(function (resultado) {
        res.json(resultado || []);
    }).catch(function (erro) {
        console.log("Erro ao obter ranking:", erro.sqlMessage || erro.message);
        res.status(500).json({ erro: "Não foi possível carregar o ranking." });
    });
}

function impactos(req, res) {
    respostaModel.obterImpactos().then(function (resultado) {
        var linha = resultado && resultado[0] ? resultado[0] : {};
        res.json({
            media_emocional: Number(linha.media_emocional) || 0,
            media_pratico: Number(linha.media_pratico) || 0
        });
    }).catch(function (erro) {
        console.log("Erro ao obter impactos:", erro.sqlMessage || erro.message);
        res.status(500).json({ erro: "Não foi possível carregar os impactos." });
    });
}

function comportamento(req, res) {
    respostaModel.obterComportamento().then(function (resultado) {
        var linha = resultado && resultado[0] ? resultado[0] : {};
        var total = Number(linha.total) || 0;

        function pct(parte) {
            if (!total) {
                return 0;
            }
            return Math.round((Number(parte) || 0) / total * 100);
        }

        res.json({
            estudo: {
                sim: Number(linha.estudo_sim) || 0,
                nao: Number(linha.estudo_nao) || 0,
                pct_sim: pct(linha.estudo_sim),
                pct_nao: pct(linha.estudo_nao)
            },
            conversa: {
                sim: Number(linha.conversa_sim) || 0,
                nao: Number(linha.conversa_nao) || 0,
                pct_sim: pct(linha.conversa_sim),
                pct_nao: pct(linha.conversa_nao)
            }
        });
    }).catch(function (erro) {
        console.log("Erro ao obter comportamento:", erro.sqlMessage || erro.message);
        res.status(500).json({ erro: "Não foi possível carregar o comportamento." });
    });
}

function areasImpacto(req, res) {
    respostaModel.obterAreasImpacto().then(function (resultado) {
        res.json(resultado || []);
    }).catch(function (erro) {
        console.log("Erro ao obter áreas de impacto:", erro.sqlMessage || erro.message);
        res.status(500).json({ erro: "Não foi possível carregar as áreas de impacto." });
    });
}

module.exports = {
    cadastrar,
    agregados,
    depoimentos,
    ranking,
    impactos,
    comportamento,
    areasImpacto
};
