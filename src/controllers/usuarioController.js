var usuarioModel = require("../models/usuarioModel");

function autenticar(req, res) {
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;

    if (!email || !senha) {
        return res.status(400).json({ erro: "Informe e-mail e senha." });
    }

    usuarioModel.autenticar(email, senha)
        .then(function (resultadoAutenticar) {
            if (resultadoAutenticar.length == 1) {
                res.json({
                    id: resultadoAutenticar[0].id,
                    email: resultadoAutenticar[0].email,
                    nome: resultadoAutenticar[0].nome
                });
            } else if (resultadoAutenticar.length == 0) {
                res.status(403).json({ erro: "E-mail e/ou senha inválidos." });
            } else {
                res.status(403).json({ erro: "Mais de um usuário com o mesmo login e senha." });
            }
        })
        .catch(function (erro) {
            console.log("Erro ao autenticar:", erro.sqlMessage || erro.message);
            res.status(500).json({ erro: "Não foi possível realizar o login." });
        });
}

function cadastrar(req, res) {
    var nome = req.body.nomeServer;
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;

    if (!nome || !email || !senha) {
        return res.status(400).json({ erro: "Preencha nome, e-mail e senha." });
    }

    usuarioModel.cadastrar(nome, email, senha)
        .then(function (resultado) {
            res.status(201).json(resultado);
        })
        .catch(function (erro) {
            console.log("Erro ao cadastrar usuário:", erro.sqlMessage || erro.message);

            if (erro.code === "ER_DUP_ENTRY") {
                return res.status(409).json({ erro: "Este e-mail já está cadastrado." });
            }

            res.status(500).json({ erro: "Não foi possível realizar o cadastro." });
        });
}

module.exports = {
    autenticar,
    cadastrar
}
