<!-- # Plano de alterações — Dashboard "Rap é Compromisso"

Status: **nada foi alterado no projeto ainda.** Este arquivo lista tudo que será feito, na ordem de execução.
Legenda: `[ ]` a fazer · **(confirmar)** depende da sua resposta.

Banco real conferido (`DESCRIBE resposta`): `idResposta`, `area`, `artista`, `impacto_emocional`, `impacto_pratico`, `horas`, `influenciou_estudo`, `conversou_sobre`, `depoimento`, `dtResposta`. Hoje há 6 respostas.

---

## ETAPA 1 — Banco de dados (você executa no MySQL Workbench)

Disciplina coberta: **Banco de Dados** (relacionamento entre tabelas, comandos SQL).

### 1.1 Conferir o tipo do `id` de `usuario`
A chave estrangeira só funciona se os tipos forem iguais.
- [ ] Rodar `DESCRIBE usuario;` e me mandar o resultado (preciso ver o tipo de `id`).

### 1.2 Vincular a resposta ao usuário (obrigatório)
Cria o relacionamento **1 usuário → N respostas**.
- [ ] Adicionar a coluna `fk_usuario` em `resposta` (aceita nulo, porque as 6 respostas atuais não têm dono).
- [ ] Criar a chave estrangeira de `resposta.fk_usuario` para `usuario.id`.
- [ ] Conferir com `DESCRIBE resposta;` e `SELECT idResposta, fk_usuario FROM resposta;`.

```sql
ALTER TABLE resposta ADD COLUMN fk_usuario INT NULL;

ALTER TABLE resposta
  ADD CONSTRAINT fk_resposta_usuario
  FOREIGN KEY (fk_usuario) REFERENCES usuario(id);
```
(Se o `id` de `usuario` não for `INT`, trocamos o tipo da coluna acima.)

### 1.3 Travas de valor (opcional, recomendado) **(confirmar)**
Impede nota fora de 1 a 5 e horas negativas direto no banco.
```sql
ALTER TABLE resposta
  ADD CONSTRAINT chk_emocional CHECK (impacto_emocional BETWEEN 1 AND 5),
  ADD CONSTRAINT chk_pratico   CHECK (impacto_pratico BETWEEN 1 AND 5),
  ADD CONSTRAINT chk_horas     CHECK (horas >= 0);
```
Só funciona no MySQL 8.0.16 ou mais novo (em versões antigas o comando passa, mas a trava é ignorada). Rode `SELECT VERSION();` para saber.

### 1.4 O que NÃO muda no banco
- Sem `UNIQUE` em `fk_usuario`: cada pessoa pode responder mais de uma vez **(confirmar)**.
- Sem tabelas novas e sem normalizar `area`/`artista` por enquanto.
- `artista_aggregate` e `area_aggregate` não existem no seu banco real; saem só do script `setup_db.js`.

--- -->

## ETAPA 2 — Backend e requisições

Disciplinas: **Tecnologia da Informação / Algoritmos** (API Node, funções, condicionais).

- [ ] `database/config.js`: `executar` passa a aceitar parâmetros (`?`); parar de imprimir todo resultado no console; tratar falha de conexão.
- [ ] `respostaModel.js`: INSERT passa a gravar `fk_usuario`, usando `?` (resolve o **apóstrofo duplicado** e o limite de 280 caracteres).
- [ ] `respostaController.js`: remover o escape manual duplicado; validar tipos e limites (`area` até 40, `artista` até 80, notas 1 a 5, `horas` 0 a 1000, `depoimento` até 280); exigir `fk_usuario` válido; remover campos mortos (`impacto_social`, `impacto_media`, `impacto_slider`, `impacto_composite`).
- [ ] Corrigir o cálculo de `total` e da porcentagem por área em `agregados`.
- [ ] Novas rotas (mesmo padrão `routes → controller → model`):
  - [ ] `GET /respostas/depoimentos` (mural)
  - [ ] `GET /respostas/ranking` (menções, horas totais, horas médias, impacto médio por artista)
  - [ ] `GET /respostas/impactos` (média emocional e prática)
  - [ ] `GET /respostas/comportamento` (% sim/não de estudo e conversa)
  - [ ] `GET /respostas/areas-impacto` (impacto médio por área) **(confirmar)**
- [ ] Respostas de erro padronizadas (`{ erro: "mensagem" }`) com o status HTTP certo.
- [ ] `usuarioModel.js`: login e cadastro com `?` (fecha a injeção de SQL).
- [ ] `.gitignore`: incluir `.env`, `.env.dev` e `server.log`.
- [ ] `scripts/setup_db.js` alinhado ao banco real (com `fk_usuario`); `scripts/test_api.js` alinhado à assinatura atual.
- [ ] Nada é excluído do projeto: `listar()`, `css/estilo.css` e `server.log` ficam como estão.

---

## ETAPA 3 — Dashboard (`index.html` + `js/dashboard.js`)

Disciplinas: **Algoritmos** (variáveis, funções, vetores, repetições), **Matemática** (médias, porcentagens), **Pesquisa e Inovação** (indicadores).

### JavaScript no seu nível
- [ ] Reescrever `dashboard.js` só com `function`, `var` e eventos no HTML (`onload`, `onclick`). Sem `addEventListener`, IIFE, arrow function ou `Promise.all`.
- [ ] Botão de enviar vira `onclick="enviarResposta()"` no HTML.
- [ ] Chart.js com versão fixa no CDN.

### Estados da tela
- [ ] Carregando, erro (com botão "Tentar de novo") e "ainda sem respostas".
- [ ] Conferir `res.ok` em todo `fetch`.
- [ ] Atualização a cada 30 s e logo após enviar uma resposta.

### Indicadores (KPIs)
- [ ] Total de respostas · índice médio de impacto (0 a 100) · horas médias · % da área mais impactada (mostrando o **nome** da área).

### Gráficos (Chart.js)
| Informação | Tipo |
|---|---|
| Áreas mais impactadas | Barras horizontais |
| Artistas mais citados (top 10) | Barras horizontais |
| Impacto emocional × prático | Radar (ou barras agrupadas) |
| Influenciou estudo / conversou sobre | 2 roscas (sim × não) |
| Impacto médio por área **(confirmar)** | Barras |

- [ ] Preencher os 2 painéis hoje vazios (emocional × prático e sim/não).
- [ ] Cores só da identidade (preto, vermelho, tons de papel); sair do rosa e azul atuais.

### Novos blocos aprovados
- [ ] **Tabela de ranking**: artista · menções · horas totais · horas médias · impacto médio.
- [ ] **Mural de depoimentos**: texto, artista, área e data (`dtResposta`). **Sem nome ou e-mail** **(confirmar)**. Inserido com `textContent` (sem risco de HTML malicioso).

### Formulário
- [ ] Só para usuário logado: sem login, aparece aviso com botão "Entrar" no lugar dos campos **(confirmar)**.
- [ ] Enviar `fk_usuario` (vem de `sessionStorage.ID_USUARIO`).
- [ ] Limites nos campos (`maxlength`), contador de caracteres do depoimento, validação de horas.
- [ ] Remover a nota "Protótipo: as validações... entram na versão final".
- [ ] Lista de sugestões de artistas já cadastrados no campo (`<datalist>`) **(confirmar)**.

---

## ETAPA 4 — Visual

- [ ] CSS completo para `.kpis`, `.kpi`, `.paineis`, `.painel`, `.painel-largo`, `.painel-titulo`, `.dados-intro`, tabela do ranking e mural, em `style.css`, no padrão preto/vermelho, tipografia e grão atuais.
- [ ] Responsivo (celular e tela cheia na apresentação).

---

## ETAPA 5 — Conferência final
- [ ] Comparar de novo as colunas do banco com o que a dashboard mostra (nenhuma coluna sem uso, exceto `idResposta`).
- [ ] Testar: cadastro → login → resposta → dashboard atualizada → mural.
- [ ] Testar casos de borda: sem respostas, depoimento com apóstrofo e com 280 caracteres, API desligada.
- [ ] Resumo final das alterações e dos problemas corrigidos.

---
<!-- 
## Para defender na banca
| Tela | Disciplina |
|---|---|
| Cadastro/login e validações | Algoritmos, TI |
| Formulário da pesquisa | HTML/CSS/JS, Socioemocional |
| Relacionamento usuário × resposta | Banco de Dados |
| Médias e porcentagens | Matemática |
| Dashboard e indicadores | Pesquisa e Inovação |
| Banco na VM Linux | Sistemas Operacionais |

Observação: com poucas respostas os gráficos ficam magros. Vale coletar respostas reais de colegas antes da apresentação; nada de dados fictícios. -->