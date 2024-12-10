const CasaApostas = artifacts.require("CasaApostas");

contract("CasaApostas", (accounts) => {
  let casaApostas;

  beforeEach(async () => {
    casaApostas = await CasaApostas.new();

    // Resetar tempo antes de cada teste
    await web3.currentProvider.send(
    {
        jsonrpc: "2.0",
        method: "evm_setTime",
        params: [new Date()],
        id: 0,
    },
    () => {}
  );
  });




  it("deve permitir fazer uma aposta válida", async () => {
    const descricao = "Final da Copa do Mundo";
    const prazo = Math.floor(Date.now() / 1000) + 3600; 
    const opcoes = ["time A", "time B", "empate"];

    // Criar um evento
    await casaApostas.criarEvento(descricao, opcoes, prazo, { from: accounts[0] });

    await casaApostas.depositar({ from: accounts[1], value: web3.utils.toWei("1", "ether") })

    // Fazer uma aposta válida
    const valorAposta = web3.utils.toWei("1", "ether");
    const tx = await casaApostas.apostar(0, 1, { from: accounts[1], value: valorAposta });

    // Verificar se o evento de aposta foi emitido corretamente
    const log = tx.logs[0];
    assert.equal(log.event, "ApostaFeita", "Deve emitir o evento 'ApostaFeita'");
    assert.equal(log.args.eventoId.toString(), "0", "ID do evento deve ser 0");
    assert.equal(log.args.apostador, accounts[1], "O apostador deve ser a conta que realizou a aposta");
    assert.equal(log.args.opcao.toString(), "1", "A opção apostada deve ser 1");
    assert.equal(log.args.valor.toString(), valorAposta, "O valor da aposta deve ser 1 ether");
  });

  it("deve rejeitar apostas com valor zero", async () => {
    const descricao = "Final da Copa do Mundo";
    const prazo = Math.floor(Date.now() / 1000) + 3600;
    const opcoes = ["time A", "time B", "empate"];

    await casaApostas.criarEvento(descricao, opcoes, prazo, { from: accounts[0] });

    try {
      await casaApostas.apostar(0, 1, { from: accounts[1], value: 0 });
      assert.fail("A aposta com valor zero deveria ser rejeitada");
    } catch (error) {
      assert(error.message.includes("Valor da aposta deve ser maior que zero."), "Mensagem de erro esperada");
    }
  });

  it("deve rejeitar apostas após o prazo do evento", async () => {
      
    const descricao = "Final da Copa do Mundo";
    const latestBlock = await web3.eth.getBlock("latest");
    const currentTime = latestBlock.timestamp;
    const prazo = currentTime + 30; // Prazo definido no futuro

    const opcoes = ["time A", "time B", "empate"];
    await casaApostas.criarEvento(descricao, opcoes, prazo, { from: accounts[0] });

    await web3.currentProvider.send(
      {
          jsonrpc: "2.0",
          method: "evm_increaseTime",
          params: [32], // Avançar 10 segundos para garantir que o prazo expire
          id: 0,
      },
      () => {}
    );
    await web3.currentProvider.send(
        {
            jsonrpc: "2.0",
            method: "evm_mine", // Minerar um novo bloco para efetivar o avanço
            id: 0,
        },
        () => {}
    );
  
    
    
    try {
      const valorAposta = web3.utils.toWei("1", "ether");
      await casaApostas.apostar(2, 1, { from: accounts[1], value: valorAposta });
      assert.fail("A aposta após o prazo deveria ser rejeitada");
    } catch (error) {
      assert(error.message.includes("Apostas encerradas."), "Mensagem de erro esperada");
    }
  });

  it("deve rejeitar apostas em uma opção inválida", async () => {
    const descricao = "Final da Copa do Mundo";
    const prazo = Math.floor(Date.now() / 1000) + 3600;
    const opcoes = ["time A", "time B", "empate"];

    await casaApostas.criarEvento(descricao, opcoes, prazo, { from: accounts[0] });

    try {
      const valorAposta = web3.utils.toWei("1", "ether");
      await casaApostas.apostar(0, 3, { from: accounts[1], value: valorAposta }); // Opção 3 é inválida
      assert.fail("A aposta em uma opção inválida deveria ser rejeitada");
    } catch (error) {
      assert(error.message.includes("Opcao invalida."), "Mensagem de erro esperada");
    }
  });
});
