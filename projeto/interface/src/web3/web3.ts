
// web3.ts
import Web3 from 'web3';

// Configura o provedor HTTP para conectar ao nó Ethereum
const provider = new Web3.providers.HttpProvider("http://127.0.0.1:8545/");
const web3 = new Web3(provider);

import contractEventJSON from '../../../build/contracts/CasaApostas.json';

const contractEventABI = contractEventJSON.abi;
const contractAddressEvent: string = '0xED4fb0E44374a60D80C6eDC8248CBdE8A056Ee74';

export const EventManager = new web3.eth.Contract(
  contractEventABI,
  contractAddressEvent
);

async function getGanacheAccounts(): Promise<string[] | Error> {
  try {
    const accounts = await web3.eth.getAccounts(); // Obtém as contas
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
    console.log('Evento criado:', response);
  } catch (error: unknown) {
    console.error('Erro ao criar evento:', error);
  }
};

export const placeBet = async (eventId: number, option: number, value: number) => {
  try {
    const accounts = await getGanacheAccounts();
    if (accounts instanceof Error) {
      throw new Error(accounts.message);
    }
    const response = await EventManager.methods.fazerAposta(eventId, option)
      .send({ from: accounts[1], value: web3.utils.toWei(value.toString(), 'ether'), gas: '3000000' });
    console.log('Aposta realizada:', response);
  } catch (error: unknown) {
    console.error('Erro ao realizar aposta:', error);
  }
};

export const closeEvent = async (eventId: number) => {
  try {
    const accounts = await getGanacheAccounts();
    if (accounts instanceof Error) {
      throw new Error(accounts.message);
    }
    const response = await EventManager.methods.encerrarEvento(eventId)
      .send({ from: accounts[1], gas: '3000000' });
    console.log('Evento encerrado:', response);
  } catch (error: unknown) {
    console.error('Erro ao encerrar evento:', error);
  }
};

export const getEvento = async (eventId:number) =>{
  const evento = await EventManager.methods.eventos(eventId).call();
  return evento;
};

export const getAllEventos = async ()=>{
  // Obtenha o número total de eventos (se possível)
  const totalEventos: number = await EventManager.methods.getNumEventos().call(); // Assumindo que existe uma função getNumEventos() no contrato

  const eventos = [];
  for (let i = 0; i < totalEventos; i++) {
      const evento = await getEvento(i);
      eventos.push(evento);
  }
  return eventos;
}
