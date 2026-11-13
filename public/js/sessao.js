// js/sessao.js — funções que as telas compartilham (index, login, cadastro e as próximas).
// Só usamos eventos direto no HTML (onclick, onkeyup, onload), como visto em aula.

// ---------- Aviso na parte de cima da tela ----------
var temporizadorAviso; // guarda o "relógio" que esconde o aviso

function mostrarAviso(mensagem) {
    cardErro.style.display = "block";
    mensagem_erro.textContent = mensagem;

    // se já tinha um relógio rodando, cancela e começa de novo (senão o aviso some antes da hora)
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(sumirMensagem, 5000);
}

function sumirMensagem() {
    cardErro.style.display = "none";
}

// ---------- Carregando (bolinha girando enquanto espera o servidor) ----------
function aguardar() {
    div_aguardar.style.display = "flex";
    div_erros_login.style.display = "none";
}

// finalizarAguardar() esconde a bolinha. Se vier um texto (erro do servidor), mostra embaixo do formulário.
function finalizarAguardar(texto) {
    div_aguardar.style.display = "none";

    if (texto) {
        div_erros_login.style.display = "block";
        div_erros_login.textContent = texto; // textContent: mostra como texto puro, nunca como HTML
    }
}

// ---------- Validação de e-mail ----------
// Regra simples: tem "@" (não pode ser o primeiro caractere), tem um "." depois do "@",
// o "." não é o último caractere e não existem espaços.
function emailValido(email) {
    var posArroba = email.indexOf("@");
    var posPonto = email.lastIndexOf(".");

    return posArroba > 0 &&
        posPonto > posArroba + 1 &&
        posPonto < email.length - 1 &&
        email.indexOf(" ") == -1;
}

// ---------- Sessão (quem está logado) ----------
// No login guardamos id, nome e e-mail no sessionStorage. Ele dura até fechar a aba.

// Use nas páginas que SÓ podem ser vistas por quem fez login (ex.: a futura pesquisa.html):
// <body onload="validarSessao()">
function validarSessao() {
    if (sessionStorage.ID_USUARIO == undefined) {
        window.location = "login.html";
    }
}

function sair() {
    sessionStorage.clear();
    window.location = "index.html";
}

// Usado no index.html: se já tem alguém logado, o botão "Entrar" vira "Sair · Nome".
function atualizarMenuUsuario() {
    if (sessionStorage.NOME_USUARIO != undefined) {
        var primeiroNome = sessionStorage.NOME_USUARIO.split(" ")[0];
        menu_entrar.textContent = "Sair · " + primeiroNome;
    }
}

// Chamada pelo onclick do botão do menu: se está logado, sai; senão, segue para o login.html.
// "return false" cancela a navegação do link; "return true" deixa o link funcionar.
function cliqueEntrar() {
    if (sessionStorage.ID_USUARIO != undefined) {
        sair();
        return false;
    }
    return true;
}
