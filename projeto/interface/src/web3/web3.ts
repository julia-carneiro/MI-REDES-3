import Web3 from 'web3';
import BN from 'bn.js';


const provider = new Web3.providers.HttpProvider("http://127.0.0.1:8545/");
const web3 = new Web3(provider);

import contractEventJSON from '../../../build/contracts/CasaApostas.json';

const contractEventABI = contractEventJSON.abi;
const contractAddressEvent: string = '0xeeC0A7e8Ce2dAc2F41f3d6c0c00BC17fA50ae831';

export const EventManager = new web3.eth.Contract(
  contractEventABI,
  contractAddressEvent
);

async function getGanacheAccounts(): Promise<string[] | Error> {
  try {
    const accounts = await web3.eth.getAccounts();
    return accounts;
  } catch (error: unknown) {
    if (error instanceof Error) {
      return new Error(`Erro: ${error.message}`);
    }
    return new Error('Erro desconhecido');
  }
}

export const createEvent = async (descricao: string, opcoes: string[], prazo: number) => {
  try {
    const accounts = await getGanacheAccounts();
    if (accounts instanceof Error) {
      throw new Error(accounts.message);
    }
    const response = await EventManager.methods.criarEvento(descricao, opcoes, prazo)
      .send({ from: accounts[1], gas: '3000000' });
    return response.events?.EventoCriado.returnValues.id;
  } catch (error: unknown) {
    console.error('Erro ao criar evento:', error);
    throw error;
  }
};

export const placeBet = async (eventId: number, option: number, value: number) => {
  try {

    const accounts = await getGanacheAccounts();
    if (accounts instanceof Error) {
      throw new Error(accounts.message);
    }

    // Convert value to Wei
    const valueInWei = web3.utils.toWei(value.toString(), 'ether');

    const balance = await web3.eth.getBalance(accounts[1]);
    if (new BN(balance.toString()).lt(new BN(valueInWei))) {
      throw new Error('Saldo insuficiente para realizar a aposta');
    }

    // Check event details before placing bet
    const evento: BlockchainEvent = await EventManager.methods.eventos(eventId).call();

    console.log('Event ID:', eventId);
    console.log('Option:', option);
    console.log('Value in Wei:', valueInWei);
    console.log('Event Details:', evento);
    
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const eventDeadline = Number(evento.prazo);

    console.log('Event Deadline:', eventDeadline);
    console.log('Current Timestamp:', currentTimestamp);
    console.log('Difference:', currentTimestamp - eventDeadline);

    // Add a small buffer to account for slight timing differences
    if (currentTimestamp > eventDeadline + 5) {  // 5-second buffer
      throw new Error('Apostas encerradas para este evento');
    }

    // Place the bet
    const response = await EventManager.methods.apostar(eventId, option)
      .send({ 
        from: accounts[1], 
        value: valueInWei, 
        gas: '3000000' 
      });

    console.log('Aposta realizada:', response);
    return response;
  } catch (error: unknown) {
    console.error('Erro ao realizar aposta:', error);
    
    // Provide more detailed error message
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Erro desconhecido ao realizar aposta');
    }
  }
};

interface BlockchainEvent {
  id?: number;
  criador?: string;
  descricao?: string;
  opcoes?: string[];
  prazo?: number;
  finalizado?: boolean;
  resultado?: number;
  encerrado?: boolean;
}

export const closeEvent = async (eventId: number, resultado: number) => {
  try {
    const accounts = await getGanacheAccounts();
    if (accounts instanceof Error) {
      throw new Error(accounts.message);
    }

    const evento: BlockchainEvent = await EventManager.methods.eventos(eventId).call();
 
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (Number(evento.prazo) > currentTimestamp) {
      throw new Error('Evento ainda não atingiu o prazo');
    }

    if (evento.encerrado) {
      throw new Error('Evento já foi encerrado');
    }

    const response = await EventManager.methods.encerrarEvento(eventId, resultado)
      .send({ 
        from: accounts[1], 
        gas: '3000000' 
      });

    console.log('Evento encerrado:', response);
  } catch (error: unknown) {
    console.error('Erro ao encerrar evento:', error);
    throw error;
  }
};

export const getEvento = async (eventId: number) => {
  const evento: BlockchainEvent = await EventManager.methods.eventos(eventId).call();
  return { 
    id: eventId, 
    description: evento.descricao || '', 
    options: evento.opcoes || [], 
    deadline: evento.prazo ? Number(evento.prazo) : 0, 
    encerrado: evento.encerrado || false,
    resultado: evento.resultado !== undefined ? Number(evento.resultado) : undefined
  };
};

export const getAllEventos = async () => {
  const totalEventos: number = await EventManager.methods.getNumEventos().call();

  const eventos = [];
  for (let i = 0; i < totalEventos; i++) {
    const evento = await getEvento(i);
    eventos.push(evento);
  }
  return eventos;
}

// New deposit function
export const depositFunds = async (amount: number) => {
  try {
    const accounts = await getGanacheAccounts();
    if (accounts instanceof Error) {
      throw new Error(accounts.message);
    }

    const response = await EventManager.methods.depositar()
      .send({ 
        from: accounts[1], 
        value: web3.utils.toWei(amount.toString(), 'ether'), 
        gas: '3000000' 
      });

    console.log('Depósito realizado:', response);
    return response;
  } catch (error: unknown) {
    console.error('Erro ao realizar depósito:', error);
    throw error;
  }
};

// New withdraw function
export const withdrawFunds = async () => {
  try {
    const accounts = await getGanacheAccounts();
    if (accounts instanceof Error) {
      throw new Error(accounts.message);
    }

    const response = await EventManager.methods.sacarSaldo()
      .send({ 
        from: accounts[1], 
        gas: '3000000' 
      });

    console.log('Saque realizado:', response);
    return response;
  } catch (error: unknown) {
    console.error('Erro ao realizar saque:', error);
    throw error;
  }
};

// Get user balance function
export const getUserBalance = async () => {
  try {
    const accounts = await getGanacheAccounts();
    if (accounts instanceof Error) {
      throw new Error(accounts.message);
    }

    const balance = await EventManager.methods.getSaldo().call({ from: accounts[1] });
    return web3.utils.fromWei(balance, 'ether');
  } catch (error: unknown) {
    console.error('Erro ao buscar saldo:', error);
    throw error;
  }
};