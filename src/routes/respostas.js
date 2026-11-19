var express = require('express');
var router = express.Router();
var respostaController = require('../controllers/respostaController');

router.post('/cadastrar', function (req, res) {
    respostaController.cadastrar(req, res);
});

router.get('/agregados', function (req, res) {
    respostaController.agregados(req, res);
});

router.get('/depoimentos', function (req, res) {
    respostaController.depoimentos(req, res);
});

router.get('/ranking', function (req, res) {
    respostaController.ranking(req, res);
});

router.get('/impactos', function (req, res) {
    // removed
    res.status(404).json({ erro: 'Rota removida' });
});

router.get('/comportamento', function (req, res) {
    // removed
    res.status(404).json({ erro: 'Rota removida' });
});

router.get('/areas-impacto', function (req, res) {
    respostaController.areasImpacto(req, res);
});

router.get('/horas-impacto', function (req, res) {
    respostaController.horasImpacto(req, res);
});

router.get('/minas', function (req, res) {
    respostaController.minas(req, res);
});

module.exports = router;
