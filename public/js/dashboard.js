// dashboard.js — carrega os dados da API e monta os gráficos com Chart.js.
// Só usamos function, var e eventos chamados pelo HTML (onload, onclick), como em aula.

// --- cores da identidade (preto, vermelho e papel) ---
var COR_VERMELHO = "#c2121c";
var COR_VERMELHO_ESCURO = "#8d0d15";
var COR_PAPEL = "#e7dcc1";
var COR_TEXTO = "#efe6d2";
var COR_LINHA = "rgba(239, 230, 210, 0.16)";

// --- guarda os gráficos para atualizar sem recriar ---
var areasChart = null;
var artistsChart = null;
var impactosChart = null;
var estudoChart = null;
var conversaChart = null;
var areaImpactoChart = null;

// --- controle das requisições e dos estados da tela ---
var primeiraCarga = true;
var requisicoesPendentes = 0;
var houveErro = false;
var totalRespostas = 0;

function q(id) {
    return document.getElementById(id);
}

function mostrarElemento(id, mostrar) {
    var elemento = q(id);
    if (elemento) {
        elemento.style.display = mostrar ? "block" : "none";
    }
}

function formatarNumero(valor, casas) {
    var numero = Number(valor);
    if (isNaN(numero)) {
        numero = 0;
    }
    return numero.toFixed(casas);
}

function formatarData(valor) {
    if (!valor) {
        return "sem data";
    }
    var data = new Date(valor);
    if (isNaN(data.getTime())) {
        return String(valor);
    }
    return data.toLocaleDateString("pt-BR");
}

// ---------- início da página ----------
function iniciarPagina() {
    atualizarMenuUsuario();
    atualizarFormulario();
    carregarTudo();
    setInterval(carregarTudo, 30000);
}

function mostrarCarregando() {
    if (!primeiraCarga) {
        return;
    }
    var status = q("dados-status");
    if (status) {
        status.textContent = "Carregando dados...";
    }
    mostrarElemento("dados-status", true);
    mostrarElemento("dados-erro", false);
    mostrarElemento("dados-vazio", false);
    mostrarElemento("dados-conteudo", false);
}

function carregarTudo() {
    houveErro = false;
    totalRespostas = 0;
    requisicoesPendentes = 6;
    mostrarCarregando();

    carregarAgregados();
    carregarRanking();
    carregarDepoimentos();
    carregarImpactos();
    carregarComportamento();
    carregarAreasImpacto();
}

function finalizarRequisicao(deuErro) {
    if (deuErro) {
        houveErro = true;
    }

    requisicoesPendentes = requisicoesPendentes - 1;
    if (requisicoesPendentes > 0) {
        return;
    }

    primeiraCarga = false;

    var status = q("dados-status");

    if (houveErro) {
        if (status) {
            status.textContent = "Não foi possível carregar os dados.";
        }
        mostrarElemento("dados-status", true);
        mostrarElemento("dados-erro", true);
        mostrarElemento("dados-vazio", false);
        mostrarElemento("dados-conteudo", false);
        return;
    }

    mostrarElemento("dados-erro", false);

    if (totalRespostas === 0) {
        if (status) {
            status.textContent = "Ainda não há respostas registradas.";
        }
        mostrarElemento("dados-status", true);
        mostrarElemento("dados-vazio", true);
        mostrarElemento("dados-conteudo", false);
        return;
    }

    mostrarElemento("dados-status", false);
    mostrarElemento("dados-vazio", false);
    mostrarElemento("dados-conteudo", true);

    setTimeout(redimensionarGraficos, 0);
}

function redimensionarGraficos() {
    if (areasChart) { areasChart.resize(); }
    if (artistsChart) { artistsChart.resize(); }
    if (impactosChart) { impactosChart.resize(); }
    if (estudoChart) { estudoChart.resize(); }
    if (conversaChart) { conversaChart.resize(); }
    if (areaImpactoChart) { areaImpactoChart.resize(); }
}

// ---------- formulário ----------
function atualizarFormulario() {
    var logado = sessionStorage.ID_USUARIO != undefined;

    var formulario = q("form-logado");
    var aviso = q("form-deslogado");

    if (formulario) {
        formulario.style.display = logado ? "block" : "none";
    }
    if (aviso) {
        aviso.style.display = logado ? "none" : "block";
    }
    if (logado) {
        contarDepoimento();
    }
}

function contarDepoimento() {
    var campo = q("f-depoimento");
    var contador = q("contador-depoimento");
    if (!campo || !contador) {
        return;
    }
    contador.textContent = campo.value.length + " / 280";
}

function mostrarStatusFormulario(mensagem, deuErro) {
    var status = q("form-status");
    if (!status) {
        return;
    }
    status.textContent = mensagem;
    status.className = deuErro ? "formulario-status form-erro" : "formulario-status form-ok";
}

function enviarResposta() {
    if (sessionStorage.ID_USUARIO == undefined) {
        window.location = "login.html";
        return;
    }

    var area = q("f-area").value;
    var artista = q("f-artista").value.trim();
    var emocional = Number(q("f-impact-emocional").value);
    var pratico = Number(q("f-impact-pratico").value);
    var horasTexto = q("f-horas").value.trim();
    var horas = horasTexto === "" ? 0 : Number(horasTexto);
    var estudo = q("f-beh-estudo").value;
    var conversa = q("f-beh-conversa").value;
    var depoimento = q("f-depoimento").value.trim();

    if (artista === "") {
        mostrarStatusFormulario("Digite o nome do artista que mais te marcou.", true);
        return;
    }
    if (artista.length > 80) {
        mostrarStatusFormulario("O nome do artista pode ter no máximo 80 caracteres.", true);
        return;
    }
    if (isNaN(horas) || horas < 0 || horas > 1000) {
        mostrarStatusFormulario("Digite as horas ouvidas (entre 0 e 1000).", true);
        return;
    }
    if (depoimento.length > 280) {
        mostrarStatusFormulario("O depoimento pode ter no máximo 280 caracteres.", true);
        return;
    }

    var corpo = {
        fk_usuario: Number(sessionStorage.ID_USUARIO),
        area: area,
        artista: artista,
        impacto_emocional: emocional,
        impacto_pratico: pratico,
        horas_ouvidas: horas,
        influenciou_estudo: estudo === "sim" ? "sim" : "nao",
        conversou_sobre: conversa === "sim" ? "sim" : "nao",
        depoimento: depoimento
    };

    mostrarStatusFormulario("Enviando...", false);

    fetch("/respostas/cadastrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo)
    }).then(function (res) {
        if (!res.ok) {
            return res.json().then(function (json) {
                throw new Error(json.erro || "A API recusou a resposta.");
            });
        }
        return res.json();
    }).then(function () {
        mostrarStatusFormulario("Resposta enviada. Obrigado por participar!", false);
        q("form-logado").reset();
        contarDepoimento();
        carregarTudo();
    }).catch(function (erro) {
        console.log("Erro ao enviar resposta:", erro);
        mostrarStatusFormulario(erro.message || "Não foi possível falar com a API.", true);
    });
}

// ---------- KPIs ----------
function atualizarKpis(kpis, areas) {
    if (q("kpi-total")) {
        q("kpi-total").textContent = Number(kpis.total_respostas) || 0;
    }
    if (q("kpi-avg-impact")) {
        q("kpi-avg-impact").textContent = formatarNumero(kpis.avg_impacto, 1);
    }
    if (q("kpi-avg-hours")) {
        q("kpi-avg-hours").textContent = formatarNumero(kpis.avg_horas, 1) + "h";
    }
    if (q("kpi-top-area")) {
        q("kpi-top-area").textContent = (areas && areas.length ? Number(areas[0].pct) || 0 : 0) + "%";
    }
    if (q("kpi-top-area-legenda")) {
        q("kpi-top-area-legenda").textContent = areas && areas.length
            ? "em " + areas[0].area
            : "na área mais impactada";
    }
}

// ---------- requisições ----------
function carregarAgregados() {
    fetch("/respostas/agregados").then(function (res) {
        if (!res.ok) {
            throw new Error("HTTP " + res.status);
        }
        return res.json();
    }).then(function (payload) {
        var kpis = payload.kpis || { total_respostas: 0, avg_impacto: 0, avg_horas: 0 };
        var artistas = payload.artistas || [];
        var areas = payload.areas || [];

        totalRespostas = Number(kpis.total_respostas) || 0;

        atualizarKpis(kpis, areas);
        desenharAreas(areas);
        desenharArtistas(artistas);
        preencherSugestoesArtistas(artistas);

        finalizarRequisicao(false);
    }).catch(function (erro) {
        console.log("Erro ao carregar agregados:", erro);
        finalizarRequisicao(true);
    });
}

function carregarRanking() {
    fetch("/respostas/ranking").then(function (res) {
        if (!res.ok) {
            throw new Error("HTTP " + res.status);
        }
        return res.json();
    }).then(function (linhas) {
        montarRanking(linhas || []);
        finalizarRequisicao(false);
    }).catch(function (erro) {
        console.log("Erro ao carregar ranking:", erro);
        finalizarRequisicao(true);
    });
}

function carregarDepoimentos() {
    fetch("/respostas/depoimentos").then(function (res) {
        if (!res.ok) {
            throw new Error("HTTP " + res.status);
        }
        return res.json();
    }).then(function (lista) {
        montarMural(lista || []);
        finalizarRequisicao(false);
    }).catch(function (erro) {
        console.log("Erro ao carregar depoimentos:", erro);
        finalizarRequisicao(true);
    });
}

function carregarImpactos() {
    fetch("/respostas/impactos").then(function (res) {
        if (!res.ok) {
            throw new Error("HTTP " + res.status);
        }
        return res.json();
    }).then(function (dados) {
        desenharImpactos(dados || {});
        finalizarRequisicao(false);
    }).catch(function (erro) {
        console.log("Erro ao carregar impactos:", erro);
        finalizarRequisicao(true);
    });
}

function carregarComportamento() {
    fetch("/respostas/comportamento").then(function (res) {
        if (!res.ok) {
            throw new Error("HTTP " + res.status);
        }
        return res.json();
    }).then(function (dados) {
        var estudo = dados.estudo || { pct_sim: 0, pct_nao: 0 };
        var conversa = dados.conversa || { pct_sim: 0, pct_nao: 0 };
        desenharEstudo(estudo);
        desenharConversa(conversa);
        finalizarRequisicao(false);
    }).catch(function (erro) {
        console.log("Erro ao carregar comportamento:", erro);
        finalizarRequisicao(true);
    });
}

function carregarAreasImpacto() {
    fetch("/respostas/areas-impacto").then(function (res) {
        if (!res.ok) {
            throw new Error("HTTP " + res.status);
        }
        return res.json();
    }).then(function (areas) {
        desenharAreasImpacto(areas || []);
        finalizarRequisicao(false);
    }).catch(function (erro) {
        console.log("Erro ao carregar áreas de impacto:", erro);
        finalizarRequisicao(true);
    });
}

// ---------- gráficos ----------
function desenharAreas(areas) {
    var canvas = q("chart-areas");
    if (!canvas) {
        return;
    }

    var labels = [];
    var dados = [];
    var i;
    for (i = 0; i < areas.length; i++) {
        labels.push(areas[i].area);
        dados.push(Number(areas[i].pct) || 0);
    }

    if (areasChart) {
        areasChart.data.labels = labels;
        areasChart.data.datasets[0].data = dados;
        areasChart.update();
        return;
    }

    areasChart = new Chart(canvas.getContext("2d"), {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Respostas (%)",
                data: dados,
                backgroundColor: COR_VERMELHO,
                borderColor: COR_PAPEL,
                borderWidth: 2
            }]
        },
        options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { color: COR_TEXTO },
                    grid: { color: COR_LINHA }
                },
                y: {
                    ticks: { color: COR_TEXTO },
                    grid: { color: COR_LINHA }
                }
            }
        }
    });
}

function desenharArtistas(artistas) {
    var canvas = q("chart-artists");
    if (!canvas) {
        return;
    }

    var labels = [];
    var dados = [];
    var i;
    for (i = 0; i < artistas.length; i++) {
        labels.push(artistas[i].artista);
        dados.push(Number(artistas[i].respostas) || 0);
    }

    if (artistsChart) {
        artistsChart.data.labels = labels;
        artistsChart.data.datasets[0].data = dados;
        artistsChart.update();
        return;
    }

    artistsChart = new Chart(canvas.getContext("2d"), {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Menções",
                data: dados,
                backgroundColor: COR_PAPEL,
                borderColor: COR_VERMELHO,
                borderWidth: 2
            }]
        },
        options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { precision: 0, color: COR_TEXTO },
                    grid: { color: COR_LINHA }
                },
                y: {
                    ticks: { color: COR_TEXTO },
                    grid: { color: COR_LINHA }
                }
            }
        }
    });
}

function desenharImpactos(dados) {
    var canvas = q("chart-impactos");
    if (!canvas) {
        return;
    }

    var emocional = Number(dados.media_emocional) || 0;
    var pratico = Number(dados.media_pratico) || 0;

    if (impactosChart) {
        impactosChart.data.datasets[0].data = [emocional];
        impactosChart.data.datasets[1].data = [pratico];
        impactosChart.update();
        return;
    }

    impactosChart = new Chart(canvas.getContext("2d"), {
        type: "bar",
        data: {
            labels: ["Média geral"],
            datasets: [
                {
                    label: "Emocional",
                    data: [emocional],
                    backgroundColor: COR_VERMELHO,
                    borderColor: COR_PAPEL,
                    borderWidth: 2
                },
                {
                    label: "Prático",
                    data: [pratico],
                    backgroundColor: COR_PAPEL,
                    borderColor: COR_VERMELHO,
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { labels: { color: COR_TEXTO } }
            },
            scales: {
                x: {
                    ticks: { color: COR_TEXTO },
                    grid: { color: COR_LINHA }
                },
                y: {
                    beginAtZero: true,
                    max: 5,
                    ticks: { color: COR_TEXTO },
                    grid: { color: COR_LINHA }
                }
            }
        }
    });
}

function desenharEstudo(dados) {
    var canvas = q("chart-estudo");
    if (!canvas) {
        return;
    }

    var sim = Number(dados.pct_sim) || 0;
    var nao = Number(dados.pct_nao) || 0;
    var labels = ["Sim " + sim + "%", "Não " + nao + "%"];
    var valores = [sim, nao];

    if (estudoChart) {
        estudoChart.data.labels = labels;
        estudoChart.data.datasets[0].data = valores;
        estudoChart.update();
        return;
    }

    estudoChart = new Chart(canvas.getContext("2d"), {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [{
                data: valores,
                backgroundColor: [COR_VERMELHO, COR_PAPEL],
                borderColor: "#111",
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: { color: COR_TEXTO }
                }
            }
        }
    });
}

function desenharConversa(dados) {
    var canvas = q("chart-conversa");
    if (!canvas) {
        return;
    }

    var sim = Number(dados.pct_sim) || 0;
    var nao = Number(dados.pct_nao) || 0;
    var labels = ["Sim " + sim + "%", "Não " + nao + "%"];
    var valores = [sim, nao];

    if (conversaChart) {
        conversaChart.data.labels = labels;
        conversaChart.data.datasets[0].data = valores;
        conversaChart.update();
        return;
    }

    conversaChart = new Chart(canvas.getContext("2d"), {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [{
                data: valores,
                backgroundColor: [COR_VERMELHO_ESCURO, COR_PAPEL],
                borderColor: "#111",
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: { color: COR_TEXTO }
                }
            }
        }
    });
}

function desenharAreasImpacto(areas) {
    var canvas = q("chart-area-impacto");
    if (!canvas) {
        return;
    }

    var labels = [];
    var dados = [];
    var i;
    for (i = 0; i < areas.length; i++) {
        labels.push(areas[i].area);
        dados.push(Number(areas[i].impacto_medio) || 0);
    }

    if (areaImpactoChart) {
        areaImpactoChart.data.labels = labels;
        areaImpactoChart.data.datasets[0].data = dados;
        areaImpactoChart.update();
        return;
    }

    areaImpactoChart = new Chart(canvas.getContext("2d"), {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Impacto médio (0 a 100)",
                data: dados,
                backgroundColor: COR_VERMELHO,
                borderColor: COR_PAPEL,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    ticks: { color: COR_TEXTO },
                    grid: { color: COR_LINHA }
                },
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { color: COR_TEXTO },
                    grid: { color: COR_LINHA }
                }
            }
        }
    });
}

// ---------- ranking e mural ----------
function adicionarCelula(linha, texto) {
    var celula = document.createElement("td");
    celula.textContent = texto;
    linha.appendChild(celula);
}

function montarRanking(linhas) {
    var corpo = q("ranking-corpo");
    if (!corpo) {
        return;
    }

    corpo.textContent = "";

    if (linhas.length === 0) {
        var vazia = document.createElement("tr");
        adicionarCelula(vazia, "Ainda sem menções.");
        corpo.appendChild(vazia);
        return;
    }

    var i;
    for (i = 0; i < linhas.length; i++) {
        var linha = document.createElement("tr");
        adicionarCelula(linha, linhas[i].artista);
        adicionarCelula(linha, String(Number(linhas[i].mencoes) || 0));
        adicionarCelula(linha, formatarNumero(linhas[i].horas_totais, 1) + "h");
        adicionarCelula(linha, formatarNumero(linhas[i].horas_medias, 1) + "h");
        adicionarCelula(linha, formatarNumero(linhas[i].impacto_medio, 1) + " / 100");
        corpo.appendChild(linha);
    }
}

function montarMural(lista) {
    var mural = q("mural-lista");
    if (!mural) {
        return;
    }

    mural.textContent = "";

    if (lista.length === 0) {
        var vazio = document.createElement("p");
        vazio.className = "mural-vazio";
        vazio.textContent = "Nenhum depoimento ainda. O primeiro pode ser o seu.";
        mural.appendChild(vazio);
        return;
    }

    var i;
    for (i = 0; i < lista.length; i++) {
        var cartao = document.createElement("article");
        cartao.className = "depoimento";

        var texto = document.createElement("p");
        texto.className = "depoimento-texto";
        texto.textContent = "“" + lista[i].depoimento + "”";

        var meta = document.createElement("p");
        meta.className = "depoimento-meta";
        meta.textContent = lista[i].artista + " · " + lista[i].area + " · " + formatarData(lista[i].dtResposta);

        cartao.appendChild(texto);
        cartao.appendChild(meta);
        mural.appendChild(cartao);
    }
}

function preencherSugestoesArtistas(artistas) {
    var lista = q("lista-artistas");
    if (!lista) {
        return;
    }

    lista.textContent = "";

    var i;
    for (i = 0; i < artistas.length; i++) {
        var opcao = document.createElement("option");
        opcao.value = artistas[i].artista;
        lista.appendChild(opcao);
    }
}
