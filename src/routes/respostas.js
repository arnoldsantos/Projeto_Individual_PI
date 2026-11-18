var express = require('express');
var router = express.Router();
var respostaController = require('../controllers/respostaController');

router.post('/cadastrar', function (req, res) {
    respostaController.cadastrar(req, res);
});

router.get('/agregados', function (req, res) {
    respostaController.agregados(req, res);
});

module.exports = router;
