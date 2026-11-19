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
    var areaOutra = texto(body.area_outra);
    if (areaOutra && areaOutra.length > 40) {
        return res.status(400).json({ erro: "A área (outra) deve ter no máximo 40 caracteres." });
    }

    var artista = texto(body.artista);
    if (artista === "") {
        return res.status(400).json({ erro: "Informe o artista que mais te marcou." });
    }
    if (artista.length > 80) {
        return res.status(400).json({ erro: "O artista deve ter no máximo 80 caracteres." });
    }

    var impacto = inteiro(body.impacto);
    if (impacto === null || impacto < 1 || impacto > 5) {
        return res.status(400).json({ erro: "O impacto deve ser um número inteiro de 1 a 5." });
    }

    var horas = Number(body.horas_ouvidas);
    if (isNaN(horas) || horas < 0 || horas > 168) {
        return res.status(400).json({ erro: "As horas ouvidas devem ser um número entre 0 e 168." });
    }

    var depoimento = texto(body.depoimento);
    if (depoimento.length > 280) {
        return res.status(400).json({ erro: "O depoimento deve ter no máximo 280 caracteres." });
    }

    var resposta = {
        fk_usuario: fkUsuario,
        area: area,
        area_outra: areaOutra || null,
        artista: artista,
        impacto: impacto,
        horas: horas,
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
    // endpoint removed in the new schema
    res.status(404).json({ erro: "Rota removida: use /respostas/horas-impacto e /respostas/minas." });
}

function comportamento(req, res) {
    // comportamento endpoint removed
    res.status(404).json({ erro: "Rota removida." });
}

function areasImpacto(req, res) {
    respostaModel.obterAreasImpacto().then(function (resultado) {
        res.json(resultado || []);
    }).catch(function (erro) {
        console.log("Erro ao obter áreas de impacto:", erro.sqlMessage || erro.message);
        res.status(500).json({ erro: "Não foi possível carregar as áreas de impacto." });
    });
}

function horasImpacto(req, res) {
    respostaModel.obterHorasImpacto().then(function (resultado) {
        // ensure notes 1..5 present
        var mapa = {
            1: { quantidade: 0, horas_media: 0 },
            2: { quantidade: 0, horas_media: 0 },
            3: { quantidade: 0, horas_media: 0 },
            4: { quantidade: 0, horas_media: 0 },
            5: { quantidade: 0, horas_media: 0 }
        };
        for (var i = 0; i < resultado.length; i++) {
            var linha = resultado[i];
            var nota = Number(linha.nota) || 0;
            if (nota >= 1 && nota <= 5) {
                mapa[nota] = { quantidade: Number(linha.quantidade) || 0, horas_media: Number(linha.horas_media) || 0 };
            }
        }
        res.json(mapa);
    }).catch(function (erro) {
        console.log("Erro ao obter horas x impacto:", erro.sqlMessage || erro.message);
        res.status(500).json({ erro: "Não foi possível carregar horas x impacto." });
    });
}

function minas(req, res) {
    // the list of minas is rendered in the frontend; we count occurrences in artista
    var minasLista = ["Duquesa", "Ebony", "Slipmami", "Tasha", "Tracie", "Tasha & Tracie", "Julia Costa", "Nanda Tsunami"];
    respostaModel.obterArtistasSimples().then(function (linhas) {
        var contagem = {};
        var totalComMina = 0;
        for (var i = 0; i < minasLista.length; i++) {
            contagem[minasLista[i]] = 0;
        }
        for (var j = 0; j < linhas.length; j++) {
            var artista = (linhas[j].artista || "").toLowerCase();
            var encontrou = false;
            // check each mine name presence
            for (var k = 0; k < minasLista.length; k++) {
                var nome = minasLista[k].toLowerCase();
                if (artista.indexOf(nome) !== -1) {
                    contagem[minasLista[k]] = (contagem[minasLista[k]] || 0) + 1;
                    encontrou = true;
                }
            }
            if (encontrou) totalComMina++;
        }
        res.json({ minas: contagem, total_com_mina: totalComMina });
    }).catch(function (erro) {
        console.log("Erro ao obter minas:", erro.sqlMessage || erro.message);
        res.status(500).json({ erro: "Não foi possível carregar os dados das minas." });
    });
}

module.exports = {
    cadastrar,
    agregados,
    depoimentos,
    ranking,
    impactos,
    comportamento,
    areasImpacto,
    horasImpacto,
    minas
};
