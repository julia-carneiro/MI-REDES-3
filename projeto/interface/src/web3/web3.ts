import Web3 from 'web3';

// Define uma variável para a instância do Web3

// Configura o provedor HTTP para conectar ao nó Ethereum
const provider = new Web3.providers.HttpProvider(
  "http://127.0.0.1:8545/" // Endereço do nó Ethereum (Ganache)
);

// Inicializa a instância do Web3
const web3 = new Web3(provider);

import contractEventJSON from '../../../build/contracts/CasaApostas.json';

const contractEventABI = contractEventJSON.abi;
const contractAddressEvent: string = '0xd9235676f33C57c7Da59Ac9e554923cEde2e391A';

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
    .send({from: accounts[1], gas: '3000000'});
    console.log(response);
  } 
  catch (error: unknown) {
    console.error(error);
  }
}


    




