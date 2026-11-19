# Plano de alterações — Dashboard "Rap é Compromisso" (versão 2)

Status: **nada foi alterado no projeto ainda.** Este arquivo lista tudo que será feito, na ordem de execução.
Legenda: `[ ]` a fazer · **(decidir)** depende da sua resposta.

Esta versão incorpora as decisões de 19/11/2026 e substitui o plano anterior no que for diferente. Os erros técnicos já corrigidos por você (apóstrofo, injeção de SQL, validações, `fk_usuario`, etc.) não entram aqui de novo.

---

## Decisões já tomadas

| Assunto | Decisão |
|---|---|
| Notas emocional e prática | Viram **uma nota só** de impacto, ligada à área escolhida |
| Perguntas "estudo" e "conversou" | **Saem** do formulário (opção A) e as colunas podem ser apagadas |
| Índice médio de impacto (0 a 100) | **Sai** |
| Top 10 artistas (gráfico) | **Sai**; fica só o ranking |
| Radar emocional × prático | **Sai** |
| Roscas estudo/conversa | **Saem** |
| Impacto médio por área | **Sai** |
| Horas × impacto | **Entra**, como barras com a média de horas por nota (1 a 5) |
| Minas | **Entram nos dados**: selo "citada X vezes" e indicador de % |
| Horas | Campo mantido como **estimativa de horas por semana** (opção A); limite de 0 a 168 |
| Respostas atuais no banco | Eram dados de teste: **serão apagadas** |
| Áreas de impacto | Seção **fica**; a lista será **ampliada** e terá opção "Outra" |

---

## Pergunta nova do formulário

> "Na área que você escolheu, quanto o rap mudou a sua vida?"
> 1 = quase nada · 5 = mudou muito

Começa em "Selecione..." (sem valor padrão), para não gerar dado falso de quem passa sem pensar. O mesmo vale para a área.

---

## ETAPA 1 — Banco de dados (você executa no MySQL Workbench)

Disciplina: **Banco de Dados** (alteração de tabela, comandos SQL).

- [ ] Apagar as 6 respostas de teste (`DELETE FROM resposta;`). Sem backup, porque você confirmou que eram dados criados só para teste.
- [ ] Criar a coluna `impacto` (nota de 1 a 5) em `resposta`.
- [x] Valores antigos: decidido, a tabela fica vazia e `impacto` já nasce obrigatório (`NOT NULL`).
- [ ] Apagar as colunas `impacto_emocional`, `impacto_pratico`, `influenciou_estudo` e `conversou_sobre` (autorizado por você).
- [ ] Trava de valor para `impacto` entre 1 e 5 e para `horas`, se o MySQL for 8.0.16 ou mais novo (`SELECT VERSION();`). As travas antigas das notas emocional/prática caem junto com as colunas.
- [ ] Conferir com `DESCRIBE resposta;`.
- [ ] Atualizar `scripts/setup_db.js` para a nova estrutura.

Tabela `resposta` depois da mudança: `idResposta`, `fk_usuario`, `area`, `artista`, `impacto`, `horas`, `depoimento`, `dtResposta`.

Eu escrevo os comandos SQL quando você aprovar este plano, e você roda no Workbench.

---

## ETAPA 2 — Backend (Node)

Mesmo padrão `routes → controller → model`.

- [ ] `respostaModel.js` e `respostaController.js`: o cadastro de resposta passa a receber `impacto` no lugar das quatro colunas antigas; validação de `impacto` de 1 a 5.
- [ ] **Padronizar o artista ao gravar**: tirar espaços sobrando e uniformizar maiúsculas, para "racionais" e "Racionais" não virarem dois artistas. Como na comparação das minas ("Tasha e Tracie" × "Tasha & Tracie"), isso precisa ser pensado junto.
- [ ] Rotas que **saem**: `impactos`, `comportamento`, `areas-impacto`.
- [ ] Rotas que **ficam**: agregados por área, `depoimentos`, `ranking`.
- [ ] Rotas que **entram**:
  - [ ] `GET /respostas/horas-impacto`: média de horas e quantidade de pessoas para cada nota de 1 a 5.
  - [ ] `GET /respostas/minas`: quantas vezes cada mina foi citada e o total de respostas que citam alguma mina.
- [ ] `scripts/test_api.js` alinhado às rotas novas.

---

## ETAPA 3 — Dashboard (`index.html` + `js/dashboard.js`)

Disciplinas: **Algoritmos**, **Matemática** (médias e porcentagens), **Pesquisa e Inovação** (cruzamento de dados).

JavaScript continua no seu nível: `function`, `var` e eventos direto no HTML.

### Nova ordem da seção "Os dados"

| Ordem | Bloco | Situação |
|---|---|---|
| 1 | KPIs: **pessoas responderam** · **% na área mais impactada** (com o nome da área) · **% das respostas que citam uma mina** | Sai o índice médio e o KPI de horas |
| 2 | Áreas mais impactadas (barras horizontais) | Mantém |
| 3 | **Horas × impacto**: barras com a média de horas para cada nota de 1 a 5, mostrando quantas pessoas deram cada nota | **Novo** |
| 4 | Ranking de artistas: artista · menções · horas médias · impacto médio | Sem "horas totais" |
| 5 | Mural de depoimentos (sem nome nem e-mail) | Mantém |

- [ ] Remover do HTML e do JS: gráfico do top 10, radar, as duas roscas, impacto médio por área, KPI de índice e KPI de horas.
- [ ] Texto de explicação sob o gráfico novo, para a banca: "Se as barras sobem, quem ouve mais sente mais impacto". Com poucas respostas, avisar na tela quantas pessoas estão por trás de cada barra.
- [ ] Estados de carregando, erro e "ainda sem respostas" continuam.

### Minas nos dados
- [ ] Cada card de "As minas do rap" ganha o selo "citada X vezes", com o número vindo da API.
- [ ] Mina com 0 citações aparece como "ainda não citada".
- [ ] Os nomes oficiais das minas entram no `<datalist>` do campo artista, para a pessoa escolher em vez de digitar.

---

## ETAPA 4 — Formulário e `index.html`

### Formulário final
Área · artista · impacto (1 a 5) · horas · depoimento (até 280 caracteres).

- [ ] Remover os dois campos de sim/não e as duas notas antigas.
- [ ] Área e impacto começam em "Selecione...".
- [ ] Campo de horas: estimativa de horas **por semana** (decidido). Texto de apoio: "estimativa; confira os minutos da semana no seu app de música". Validação de 0 a 168.
- [ ] Depois de enviar, a página volta para a seção de dados já atualizada.

### Ordem e menu
Recomendação: **formulário antes dos dados**.
- O objetivo do site é coletar respostas; quem chega pelo link de um colega precisa chegar rápido no formulário.
- Depois de responder, a pessoa desce e vê o resultado, incluindo a própria resposta.
- Ordem nova: início → sobre → minas → como funciona → áreas → **participar** → **dados**.
- [ ] Mover a seção `#participar` para antes de `#dados`, renumerar os rótulos (04 e 05) e adicionar "Participar" no menu.
- [ ] Na apresentação, o menu leva direto a "Dados".

### Textos para corrigir
- [ ] Passo 2 de "Como funciona": tirar "sub-notas + índice"; trocar por algo como "diga o quanto o rap mudou essa área".
- [ ] Passo 3: ajustar para os dados que realmente existirão.
- [ ] Rodapé: tirar "Protótipo visual, não é a versão final".
- [ ] Minas: trocar "Voz do rap nacional" por uma frase real e curta para cada uma, escrita por você.
- [ ] Seção "Áreas de impacto": fica no site (decidido). A lista será ampliada e a mesma lista vale para a seção, para o campo "Área" do formulário e para o gráfico **(lista a confirmar, ver pendência 1)**.
- [ ] Opção "Outra" no campo "Área": ao escolhê-la, aparece um campo para a pessoa escrever. No gráfico, tudo que for "Outra" aparece junto, em uma barra só.

---

## ETAPA 5 — Visual

- [ ] CSS para o selo de citações nos cards das minas, para o gráfico de horas × impacto e para o ranking e o mural, no padrão preto/vermelho já usado.
- [ ] Cores dos gráficos só da identidade (preto, vermelho, tons de papel).
- [ ] Conferir em celular e em tela cheia.

---

## ETAPA 6 — Conferência final

- [ ] Comparar as colunas do banco com o que a dashboard mostra: nenhuma coluna sem uso (exceto `idResposta`).
- [ ] Testar: cadastro → login → resposta → dashboard atualizada → mural → selo das minas.
- [ ] Casos de borda: sem respostas, só uma resposta, depoimento com apóstrofo e com 280 caracteres, artista escrito de formas diferentes, API desligada.
- [ ] Resumo final das alterações.

---

## Pendência atual (19/11)

### 1. Lista de áreas e campo "Outra"
Proposta de lista ampliada (as 8 atuais + 6 novas):
Senso crítico · Autoestima · Estudos · Motivação · Amizades · Visão de mundo · Escrita e linguagem · Identidade · **Família · Trabalho e carreira · Saúde mental · Cidadania e política · Cultura e história · Superação** · **Outra**.

Por que não deixar só texto livre: se cada um escrever do seu jeito ("estudo", "Estudos", "escola"), o gráfico de áreas se espalha em várias barras de 1 pessoa. A lista fixa mantém o gráfico legível, e "Outra" dá liberdade sem perder a contagem.

Para guardar o que a pessoa escreveu em "Outra", é preciso uma coluna nova, `area_outra` (VARCHAR(40), aceita nulo). Opções:
- **Com coluna** (recomendo): o texto fica guardado e dá para listar na tela ou analisar depois. Mexe no banco, então depende da sua aprovação.
- **Sem coluna**: "Outra" só conta como "Outra" e o texto escrito se perde.

---

## Decididas em 19/11 (antigas pendências)

### Campo de horas — decidido: opção A (estimativa por semana)
O Spotify mostra os minutos da semana (de toda a música) e a faixa mais ouvida da semana. Ele **não** mostra o total por artista. Então a pergunta "horas ouvidas do artista" vira estimativa. Três caminhos:

| Opção | Pergunta | Prós | Contras |
|---|---|---|---|
| **A (recomendo)** | "Quantas horas por semana você ouve esse artista? (estimativa)" | Dá para estimar olhando os minutos da semana no app; mantém o gráfico por média; banco igual | Continua sendo palpite |
| B | "Quantas horas por semana você ouve música no total?" (número do app) | Número exato, vindo do Spotify | Mede música em geral, não rap; o cruzamento perde o sentido do tema |
| C | Faixas de frequência (todo dia, algumas vezes por semana, raramente) | Fácil de responder | Não gera média; o gráfico mudaria para barras por faixa |

Com a opção A, o limite do campo cai de 1000 para 168 horas (uma semana inteira). As respostas antigas eram de teste e serão apagadas.

### Valores antigos — decidido: eram de teste, serão apagados
As 6 respostas eram dados de teste. A tabela fica vazia e a nota única já nasce obrigatória.

### Seção "Áreas de impacto" — decidido: fica no site, com a lista ampliada
Ver a pendência 1 acima.

---

## Para defender na banca

| Tela | Disciplina |
|---|---|
| Cadastro/login e validações | Algoritmos, TI |
| Formulário da pesquisa (pergunta única de impacto) | HTML/CSS/JS, Socioemocional |
| Relacionamento usuário × resposta | Banco de Dados |
| Média de horas por nota e porcentagens | Matemática |
| Horas × impacto e minas nos dados | Pesquisa e Inovação |
| Banco na VM Linux | Sistemas Operacionais |

Observação: com poucas respostas, o gráfico de horas × impacto fica fraco. Vale coletar respostas reais de colegas antes da apresentação; nada de dados fictícios.