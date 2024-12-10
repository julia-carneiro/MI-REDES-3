const 
casaApostas = artifacts.require("casaApostas");

module.exports = function (deployer) {
  deployer.deploy(casaApostas, "Mensagem inicial!");
};

