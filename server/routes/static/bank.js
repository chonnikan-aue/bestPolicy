const express = require("express");
const router = express.Router(); //creates a router object
const ctrl = require("../../controllers");

router.post('/Bank', ctrl.bank.createBank);
router.get('/Bank', ctrl.bank.findAllBanks);
router.get('/BankByType', ctrl.bank.findBanksByType);
router.get('/BankAmityBrand', ctrl.bank.findBankAmityBrand);
router.get('/BankAmityBranch', ctrl.bank.findBankAmityBranch);
router.get('/BankPartnerBrand', ctrl.bank.findBankPartnerBrand);
router.get('/BankPartnerBranch', ctrl.bank.findBankPartnerBranch);
module.exports = router;