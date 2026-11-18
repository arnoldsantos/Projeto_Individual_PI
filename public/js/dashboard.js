// dashboard.js — carrega dados do backend e renderiza gráficos com Chart.js
(function () {
  function q(id) { return document.getElementById(id); }

  function atualizarKpis(kpis, areas) {
    if (q('kpi-total')) q('kpi-total').textContent = kpis.total_respostas || 0;
    if (q('kpi-avg-impact')) q('kpi-avg-impact').textContent = (kpis.avg_impacto || 0).toFixed(2);
    if (q('kpi-avg-hours')) q('kpi-avg-hours').textContent = (kpis.avg_horas || 0).toFixed(2) + 'h';
    if (q('kpi-top-area')) q('kpi-top-area').textContent = (areas && areas.length ? areas[0].pct : 0) + '%';
  }

  var areasChart = null;
  var artistsChart = null;

  function renderAreasChart(areas) {
    var ctx = document.getElementById('chart-areas');
    if (!ctx) return;
    var labels = areas.map(a => a.area);
    var data = areas.map(a => a.pct);

    var cfg = {
      type: 'bar',
      data: { labels: labels, datasets: [{ label: 'Porcentagem de respostas (%)', data: data, backgroundColor: '#ff7b7b' }] },
      options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100 } } }
    };

    if (areasChart) { areasChart.data.labels = labels; areasChart.data.datasets[0].data = data; areasChart.update(); }
    else areasChart = new Chart(ctx.getContext('2d'), cfg);
  }

  function renderArtistsChart(artists) {
    var ctx = document.getElementById('chart-artists');
    if (!ctx) return;
    var labels = artists.map(a => a.artista);
    var data = artists.map(a => Number(a.respostas));

    var cfg = {
      type: 'bar',
      data: { labels: labels, datasets: [{ label: 'Menções', data: data, backgroundColor: '#7bbcff' }] },
      options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    };

    if (artistsChart) { artistsChart.data.labels = labels; artistsChart.data.datasets[0].data = data; artistsChart.update(); }
    else artistsChart = new Chart(ctx.getContext('2d'), cfg);
  }

  function fetchAndRender() {
    fetch('/respostas/agregados').then(function (r) { return r.json(); }).then(function (payload) {
      var kpis = payload.kpis || { total_respostas: 0, avg_impacto: 0, avg_horas: 0 };
      var artistas = payload.artistas || [];
      var areas = payload.areas || [];

      atualizarKpis(kpis, areas);
      renderAreasChart(areas);
      renderArtistsChart(artistas);
    }).catch(function (err) {
      console.error('Erro ao carregar agregados:', err);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    fetchAndRender();
    // atualiza a cada 30s
    setInterval(fetchAndRender, 30000);
    // vincula envio do formulário
    var btnEnviar = document.querySelector('.btn-enviar');
    if (btnEnviar) {
      btnEnviar.addEventListener('click', function () {
        enviarResposta();
      });
    }
  });

  // Envia resposta do formulário para o backend
  function enviarResposta() {
    function q(id) { return document.getElementById(id); }

    var area = q('f-area') ? q('f-area').value : '';
    var artista = q('f-artista') ? q('f-artista').value.trim() : '';
    var emocional = q('f-impact-emocional') ? Number(q('f-impact-emocional').value) : 3;
    var pratico = q('f-impact-pratico') ? Number(q('f-impact-pratico').value) : 3;
    var horas = q('f-horas') ? Number(q('f-horas').value) : 0;
    var estudo = q('f-beh-estudo') ? q('f-beh-estudo').value : 'nao';
    var conversa = q('f-beh-conversa') ? q('f-beh-conversa').value : 'nao';
    var depoimento = q('f-depoimento') ? q('f-depoimento').value.trim() : '';

    // validações básicas
    if (!artista) { alert('Digite o nome do artista que mais te marcou.'); return; }
    if (isNaN(horas) || horas < 0 || horas > 1000) { alert('Digite as horas ouvidas (entre 0 e 1000).'); return; }
    if (depoimento.length > 280) { alert('O depoimento pode ter no máximo 280 caracteres.'); return; }

    // calcula campos usados pelo backend
    var impacto_media = (emocional + pratico) / 2; // média 1..5
    var impacto_composite = Math.round((impacto_media / 5) * 100); // 0..100
    var impacto_slider = impacto_composite; // manter compatibilidade

    var corpo = {
      area: area,
      artista: artista,
      impacto_emocional: emocional,
      impacto_pratico: pratico,
      impacto_social: 3,
      impacto_media: impacto_media,
      impacto_slider: impacto_slider,
      impacto_composite: impacto_composite,
      horas_ouvidas: horas,
      influenciou_estudo: estudo === 'sim' ? 'sim' : 'nao',
      conversou_sobre: conversa === 'sim' ? 'sim' : 'nao',
      depoimento: depoimento
    };

    fetch('/respostas/cadastrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo)
    }).then(function (res) {
      if (res.ok) {
        alert('Resposta enviada! Obrigado por participar.');
        var form = document.getElementById('form-resposta'); if (form) form.reset();
        fetchAndRender();
      } else {
        res.json().then(function (j) { alert('Erro ao enviar: ' + (j.error || j.message || res.statusText)); }).catch(function () { alert('A API recusou a resposta.'); });
      }
    }).catch(function (err) {
      console.error('Erro ao enviar resposta:', err);
      alert('Não foi possível falar com a API. Ela está rodando?');
    });
  }
})();
