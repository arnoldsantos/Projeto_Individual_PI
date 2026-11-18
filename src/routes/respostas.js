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
    respostaController.impactos(req, res);
});

router.get('/comportamento', function (req, res) {
    respostaController.comportamento(req, res);
});

router.get('/areas-impacto', function (req, res) {
    respostaController.areasImpacto(req, res);
});

module.exports = router;
