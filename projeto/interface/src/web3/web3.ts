import Web3 from 'web3';

const provider = new Web3.providers.HttpProvider("http://127.0.0.1:8545/");
const web3 = new Web3(provider);

import contractEventJSON from '../../../build/contracts/CasaApostas.json';

const contractEventABI = contractEventJSON.abi;
const contractAddressEvent: string = '0x5433698F8d39F924Ccb612e61c3e0a268f32b8Bd';

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
    const response = await EventManager.methods.apostar(eventId, option)
      .send({ 
        from: accounts[1], 
        value: web3.utils.toWei(value.toString(), 'ether'), 
        gas: '3000000' 
      });
    console.log('Aposta realizada:', response);
  } catch (error: unknown) {
    console.error('Erro ao realizar aposta:', error);
    throw error;
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

export const closeEvent = async (eventId: number) => {
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

    const result = 0; //TEM Q TROCAR ISSO AQ

    const response = await EventManager.methods.encerrarEvento(eventId, result)
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
    encerrado: evento.encerrado || false 
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