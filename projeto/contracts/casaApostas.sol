// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CasaApostas {
    struct Aposta {
        address apostador;
        uint256 opcao;
        uint256 valor;
    }

    struct Evento {
        uint256 id;
        address criador;
        string descricao;
        string[] opcoes; // Ex.: ["Time A vence", "Time B vence", "Empate"]
        uint256 prazo;
        bool finalizado;
        uint256 resultado; // Índice da opção vencedora
        mapping(uint256 => uint256) apostasPorOpcao; // Opção => Valor total apostado
        mapping(address => uint256) apostasUsuario;  // Usuário => Valor apostado
        address[] apostadores;
        Aposta[] apostas; // Array de apostas
        bool encerrado; // Status de encerramento
    }

    struct HistoricoEvento {
        uint256 id;
        string descricao;
        string[] opcoes;
        uint256 resultado;
        uint256 prazo;
    }

    uint256 public proximoIdEvento;
    mapping(uint256 => Evento) public eventos;
    mapping(address => uint256) public saldos; // Saldo dos usuários no sistema
    HistoricoEvento[] public historico;

    event EventoCriado(uint256 id, address criador, string[] opcoes, string descricao, uint256 prazo);
    event ApostaFeita(uint256 eventoId, address apostador, uint256 opcao, uint256 valor);
    event ResultadoDefinido(uint256 eventoId, uint256 resultado);
    event EventoEncerrado(uint256 eventoId, uint256 resultado);
    event SaldoSacado(address indexed usuario, uint256 valor);

    function getOpcoes(uint256 eventoId) public view returns (string[] memory) {
        return eventos[eventoId].opcoes;
    }

    // Criar um evento de aposta
    function criarEvento(string memory descricao, string[] memory opcoes, uint256 prazo) external {
        require(opcoes.length > 1, "Deve haver pelo menos 2 opcoes.");
        require(prazo > block.timestamp, "Prazo deve ser no futuro.");

        Evento storage novoEvento = eventos[proximoIdEvento];
        novoEvento.id = proximoIdEvento;
        novoEvento.criador = msg.sender;
        novoEvento.descricao = descricao;
        novoEvento.opcoes = opcoes;
        novoEvento.prazo = prazo;

        emit EventoCriado(proximoIdEvento, msg.sender, opcoes, descricao, prazo);
        proximoIdEvento++;
    }

    // Função para encerrar evento e distribuir prêmios
    function encerrarEvento(uint256 eventoId, uint256 resultado) public {
        Evento storage evento = eventos[eventoId];
        
        // Verificar se o evento já terminou e não foi encerrado ainda
        require(block.timestamp > evento.prazo, "Evento ainda em andamento.");
        require(!evento.encerrado, "Evento ja foi encerrado.");

        evento.encerrado = true; // Marca o evento como encerrado
        evento.resultado = resultado; // Define o resultado do evento

        // Total apostado na opção vencedora
        uint256 totalApostadoVencedor = evento.apostasPorOpcao[resultado];
        uint256 totalPerdedor = 0;

        for(uint256 i = 0; i < evento.opcoes.length; i++){
                if (i != resultado) {
                    totalPerdedor += evento.apostasPorOpcao[i];
                }
            }

        if (totalApostadoVencedor > 0) {
            
            // Distribuir prêmio para os apostadores da opção vencedora
            for (uint256 i = 0; i < evento.apostas.length; i++) {
                Aposta memory aposta = evento.apostas[i];
                if (aposta.opcao == resultado) {
                    // Cálculo do prêmio baseado no valor apostado e no total apostado na opção vencedora
                    uint256 valorApostado = evento.apostasUsuario[aposta.apostador];
                    uint256 premio = (valorApostado / totalApostadoVencedor) * totalPerdedor;
                    saldos[aposta.apostador] += premio;
                }
            }
        }

        // Emitir evento para informar que o evento foi encerrado
        emit EventoEncerrado(eventoId, resultado);
    }


    // Função para depósito
    function depositar() external payable {
        require(msg.value > 0, "O valor do deposito deve ser maior que zero.");
        saldos[msg.sender] += msg.value;
    }

    // Função para visualizar o saldo
    function getSaldo() external view returns (uint256) {
        return saldos[msg.sender];
    }

    // Apostar em um evento
    function apostar(uint256 eventoId, uint256 opcao) external payable {
        require(msg.value > 0, "Valor da aposta deve ser maior que zero.");
        Evento storage evento = eventos[eventoId];
        require(block.timestamp < evento.prazo, "Apostas encerradas.");
        require(opcao < evento.opcoes.length, "Opcao invalida.");

        evento.apostasPorOpcao[opcao] += msg.value;
        if (evento.apostasUsuario[msg.sender] == 0) {
            evento.apostadores.push(msg.sender);
        }
        evento.apostasUsuario[msg.sender] += msg.value;

        // Registrar aposta no array
        evento.apostas.push(Aposta({
            apostador: msg.sender,
            opcao: opcao,
            valor: msg.value
        }));

        emit ApostaFeita(eventoId, msg.sender, opcao, msg.value);
    }



    // Visualizar resultado de um evento
    function getResultado(uint256 eventoId) public view returns (string memory) {
        Evento storage evento = eventos[eventoId];
        require(evento.finalizado, "O evento ainda nao foi finalizado.");
        uint index = evento.resultado;            
        return evento.opcoes[index];              
    }

    // Função para sacar saldo
    function sacarSaldo() external {
        uint256 saldo = saldos[msg.sender];
        require(saldo > 0, "Saldo insuficiente.");

        // Atualizando o saldo antes da transferência para evitar reentrância
        saldos[msg.sender] = 0;

        // Transferindo o saldo usando call para maior segurança
        (bool success, ) = msg.sender.call{value: saldo}("");
        require(success, "Falha na transferencia de saldo.");

        // Emitir evento de saque
        emit SaldoSacado(msg.sender, saldo);
    }

    // Função para obter informações do evento após o encerramento
function getInformacoesEvento(uint256 eventoId) public view returns (
    string memory descricao,
    string memory opcaoVencedora,
    uint256 totalApostadoresVencedores,
    uint256 totalApostasVencedoras,
    uint256 totalApostado
) {
    Evento storage evento = eventos[eventoId];
    require(evento.encerrado, "O evento ainda nao foi encerrado.");

    // Descrição do evento
    descricao = evento.descricao;

    // Opção vencedora
    opcaoVencedora = evento.opcoes[evento.resultado];

    // Contar o número de apostadores que apostaram na opção vencedora
    totalApostadoresVencedores = 0;
    totalApostasVencedoras = evento.apostasPorOpcao[evento.resultado];

    for (uint256 i = 0; i < evento.apostas.length; i++) {
        if (evento.apostas[i].opcao == evento.resultado) {
            totalApostadoresVencedores++;
        }
    }

    // Total apostado no evento
    totalApostado = 0;
    for (uint256 i = 0; i < evento.opcoes.length; i++) {
        totalApostado += evento.apostasPorOpcao[i];
    }
}
}
