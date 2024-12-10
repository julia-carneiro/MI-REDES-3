const CasaApostas = artifacts.require("CasaApostas");

contract("CasaApostas", (accounts) => {
  let casaApostas;

  beforeEach(async () => {
    casaApostas = await CasaApostas.new();
  });

  it("deve permitir criar um evento", async () => {
    const descricao = "Final da Copa do Mundo";
    const prazo = Math.floor(Date.now() / 1000) + 3600; // 1 hora a partir de agora
    const opcoes = ["time A", "time B", "empate"]; // Exemplo de opções para o evento
  
    // Chamar a função para criar o evento com o array de opções
    const tx = await casaApostas.criarEvento(descricao, opcoes, prazo, { from: accounts[0] });
  
    // Verificar se o evento foi criado
    const evento = await casaApostas.eventos(0);
    // console.log(evento);  // Verificar o conteúdo completo do evento

    const opcoesDoEvento = await casaApostas.getOpcoes(0);
    console.log(opcoesDoEvento); // Deve exibir ['time A', 'time B', 'empate']

  
    // // Verificar se as opções foram registradas corretamente
    assert.deepEqual(opcoesDoEvento, opcoes, "As opções do evento devem corresponder.");
   
   
  
    // // Verificar o evento emitido
    const logs = tx.logs;
    assert.equal(logs.length, 1);
    const log = logs[0];
    assert.equal(log.event, "EventoCriado");
    assert.equal(log.args.descricao, descricao);
    assert.equal(log.args.prazo.toString(), prazo.toString());
  });
  
});
