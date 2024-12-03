// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CasaApostas {
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
    }

    uint256 public proximoIdEvento;
    mapping(uint256 => Evento) public eventos;
    mapping(address => uint256) public saldos; // Saldo dos usuários no sistema

    event EventoCriado(uint256 id, address criador,string[] opcoes, string descricao, uint256 prazo);
    event ApostaFeita(uint256 eventoId, address apostador, uint256 opcao, uint256 valor);
    event ResultadoDefinido(uint256 eventoId, uint256 resultado);

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

        emit ApostaFeita(eventoId, msg.sender, opcao, msg.value);
    }

    // Definir resultado de um evento
    function definirResultado(uint256 eventoId, uint256 resultado) external {
        Evento storage evento = eventos[eventoId];
        require(msg.sender == evento.criador, "Somente o criador pode definir o resultado.");
        require(block.timestamp >= evento.prazo, "Prazo nao encerrado.");
        require(!evento.finalizado, "Evento ja finalizado.");
        require(resultado < evento.opcoes.length, "Resultado invalido.");

        evento.resultado = resultado;
        evento.finalizado = true;

        uint256 totalApostado = evento.apostasPorOpcao[resultado];
        if (totalApostado > 0) {
            // Somente distribuir para apostadores da opção vencedora
            for (uint256 i = 0; i < evento.apostadores.length; i++) {
                address apostador = evento.apostadores[i];
                uint256 valorApostado = evento.apostasUsuario[apostador];
                
                // Verificar se o apostador apostou na opção vencedora
                if (valorApostado > 0 && evento.apostasUsuario[apostador] == resultado) {
                    uint256 premio = (valorApostado * totalApostado) / evento.apostasPorOpcao[resultado];
                    saldos[apostador] += premio;
                }
            }
}

        emit ResultadoDefinido(eventoId, resultado);
    }

    // Sacar saldo
    function sacarSaldo() external {
        uint256 saldo = saldos[msg.sender];
        require(saldo > 0, "Saldo insuficiente.");
        saldos[msg.sender] = 0;
        payable(msg.sender).transfer(saldo);
    }
}
