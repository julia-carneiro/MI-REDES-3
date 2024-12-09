const CasaApostas = artifacts.require("CasaApostas");

contract("CasaApostas - Saldos", (accounts) => {
    let casaApostas;

    beforeEach(async () => {
        casaApostas = await CasaApostas.new();
    });

    it("deve permitir depósitos e atualizar saldo", async () => {
        const valorDeposito = web3.utils.toWei("2", "ether");

        await casaApostas.depositar({ from: accounts[1], value: valorDeposito });

        const saldo = await casaApostas.getSaldo({ from: accounts[1] });
        assert.equal(saldo.toString(), valorDeposito, "O saldo deve ser atualizado após o depósito.");
    });

    it("deve permitir sacar saldo e atualizar o estado corretamente", async () => {
        const valorDeposito = web3.utils.toWei("3", "ether");
        await casaApostas.depositar({ from: accounts[1], value: valorDeposito });
        
        const saldoAntes = await casaApostas.saldos(accounts[1]);
        assert.equal(saldoAntes.toString(), valorDeposito, "O saldo deve ser correto antes do saque.");

        // Capturando a transação
        const tx = await casaApostas.sacarSaldo({ from: accounts[1] });
        
        const saldoDepois = await casaApostas.saldos(accounts[1]);
        assert.equal(saldoDepois.toString(), "0", "O saldo deve ser zerado após o saque.");
        
        // Verificar se a transferência foi feita com sucesso
        const saldoConta = await web3.eth.getBalance(accounts[1]);
        assert.isTrue(Number(saldoConta) > Number(valorDeposito), "O saldo da conta não foi atualizado corretamente.");

        // Verificar o evento SaldoSacado
        const log = tx.logs[0];
        assert.equal(log.event, "SaldoSacado", "Deve emitir o evento SaldoSacado");
        assert.equal(log.args.usuario, accounts[1], "O usuário do evento está correto");
        assert.equal(log.args.valor.toString(), valorDeposito, "O valor do saque está correto");
    });

    it("deve falhar ao tentar sacar se o saldo for insuficiente", async () => {
        try {
            await casaApostas.sacarSaldo({ from: accounts[1] });
            assert.fail("O saque deveria falhar devido ao saldo insuficiente.");
        } catch (error) {
            assert(error.message.includes("Saldo insuficiente"), "Mensagem de erro esperada.");
        }
    });

    it("deve permitir encerrar apostas e atualizar saldo dos vencedores", async () => {
        const descricao = "Lançamento de moeda";
        const prazo = (await web3.eth.getBlock('latest')).timestamp + 2; // Prazo no futuro (2 segundos)
        const opcoes = ["cara", "coroa"];
    
        // Criar evento
        await casaApostas.criarEvento(descricao, opcoes, prazo, { from: accounts[0] });
    
        // Realizar apostas
        await casaApostas.apostar(0, 0, { from: accounts[1], value: web3.utils.toWei("1", "ether") });
        await casaApostas.apostar(0, 1, { from: accounts[2], value: web3.utils.toWei("2", "ether") });
    
        // Simular passagem de tempo no blockchain
        await web3.currentProvider.send(
            {
                jsonrpc: "2.0",
                method: "evm_increaseTime",
                params: [6], // Avançar 6 segundos
                id: 0,
            },
            () => {}
        );
        await web3.currentProvider.send(
            {
                jsonrpc: "2.0",
                method: "evm_mine", // Minerar um novo bloco
                id: 0,
            },
            () => {}
        );
    
        // Encerrar o evento
        await casaApostas.encerrarEvento(0, 1, { from: accounts[0] });
    
        // Verificar saldos
        const saldo1 = await casaApostas.getSaldo({ from: accounts[1] }); // Apostador 1 (cara)
        const saldo2 = await casaApostas.getSaldo({ from: accounts[2] }); // Apostador 2 (coroa)
    
        assert(saldo2 >= web3.utils.toWei("2", "ether"), "Saldo do vencedor não foi atualizado corretamente");
        assert.equal(saldo1.toString(), "0", "Saldo do perdedor não foi zerado corretamente");
    });
    
});
