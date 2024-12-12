# Problema 3 - BET Distribuída 

Objetivo: Desenvolver uma plataforma de apostas online descentralizada, eliminando a necessidade de intermediários e garantindo maior transparência e segurança nas transações.

## Introdução

A BET Distribuída é um projeto desenvolvido com o objetivo de oferecer uma alternativa segura, transparente e sem intermediários para apostas em eventos esportivos e outras competições. Utilizando a tecnologia blockchain, o sistema elimina a necessidade de confiar em terceiros, garantindo que todas as transações e operações sejam verificáveis e imutáveis.
O principal diferencial dessa plataforma é sua descentralização, que permite que qualquer usuário crie eventos, participe como apostador e receba seus prêmios de forma automatizada. Tudo isso é realizado por meio de um contrato inteligente, que define as regras de operação e garante o cumprimento delas, reduzindo a possibilidade de fraudes e inconsistências.
Além disso, o projeto busca resolver problemas comuns em casas de apostas tradicionais, como a falta de transparência nas odds, atrasos no pagamento dos prêmios e a dependência de uma entidade centralizada para gerenciar as operações. Ao implementar essas funcionalidades em um ambiente descentralizado, o sistema promove maior confiança e acessibilidade para os usuários.

## Principais Características

- **Descentralização Total**: Eliminação de intermediários
- **Transparência**: Todas as transações são verificáveis na blockchain
- **Segurança**: Implementado com contrato inteligente na blockchain Ethereum
- **Automatização**: Distribuição de prêmios completamente automatizada

## Tecnologias Utilizadas

- **Blockchain**: Ethereum
- **Linguagem de Contrato**: Solidity
- **Ferramentas de Desenvolvimento**:
  - Ganache (Blockchain local)
  - Truffle (Framework de desenvolvimento)

## Fundamentação Teórica

A BET Distribuída foi construída utilizando um contrato inteligente feito com a linguagem Solidity,  implementado na blockchain Ethereum. A escolha dessa tecnologia é fundamentada nos princípios de descentralização, segurança e transparência que ela oferece. Para compreender os aspectos técnicos e as vantagens do projeto, é necessário explorar os principais conceitos de uma blockchain, como consenso, validação, imutabilidade e execução descentralizada de contratos inteligentes.

### Blockchain: Estrutura e Funcionamento

Uma blockchain é uma estrutura de dados descentralizada que armazena informações de forma distribuída em uma rede de nós (computadores). Cada bloco contém um conjunto de transações validadas, um hash que identifica o bloco atual e o hash do bloco anterior, formando uma cadeia linear. Essa estrutura garante a imutabilidade das informações, pois qualquer alteração em um bloco invalida todos os subsequentes.

### Consenso
O mecanismo de consenso é o processo pelo qual os nós da rede concordam sobre o estado atual da blockchain. No Ethereum, o consenso é alcançado por meio do Proof of Stake (PoS), onde validadores são escolhidos com base na quantidade de tokens que possuem e estão dispostos a "bloquear" como garantia. Este modelo é eficiente energeticamente e reduz o risco de centralização em comparação ao Proof of Work (PoW). O consenso é fundamental para garantir que todos os participantes da rede tenham uma visão consistente do histórico de transações.

### Validação
Antes que uma transação seja incluída em um bloco, ela deve ser validada. Essa validação verifica, entre outros aspectos:
- A autenticidade da assinatura digital do remetente.
- Se o remetente possui saldo suficiente para realizar a transação.
- Se os dados da transação seguem os requisitos definidos pelo contrato inteligente.

Essas validações são essenciais para evitar fraudes, como tentativas de gastar mais do que o saldo disponível ou enviar transações malformadas.

### Imutabilidade 
Uma vez registrada na blockchain, uma transação não pode ser alterada ou excluída. Isso ocorre porque os hashes dos blocos dependem do conteúdo dos blocos anteriores. Essa característica é crucial para garantir a transparência e a confiabilidade do sistema, especialmente em um ambiente de apostas, onde os participantes precisam confiar que os resultados não podem ser manipulados.

### Contratos Inteligentes

Contratos inteligentes são programas autônomos que executam automaticamente as regras estabelecidas em seu código, eliminando a necessidade de intermediários. No caso da BET Distribuída, o contrato gerencia:
A criação de eventos de aposta, com suas respectivas opções e prazos.
O registro de apostas dos usuários, com controle de valores e opções escolhidas.
O encerramento de eventos e a distribuição de prêmios com base nos resultados definidos.
Essas funcionalidades são executadas diretamente na blockchain, garantindo que não possam ser alteradas por nenhuma parte envolvida.

## Segurança e Transparência

Os contratos inteligentes são auditáveis, pois todo o código e as transações são registrados na blockchain. Isso proporciona um alto nível de transparência, permitindo que os usuários verifiquem as regras do sistema e o histórico de operações. Para evitar vulnerabilidades como reentrância, foram implementadas boas práticas, como a atualização de saldos antes de transferências externas.

## Ferramentas de desenvolvimento
Para o desenvolvimento dos contratos inteligentes da BET Distribuída, foram utilizadas ferramentas específicas que simplificam o processo de criação, teste e implantação na blockchain Ethereum

#### Ganache
O Ganache é uma ferramenta que simula uma blockchain Ethereum local. Ele foi utilizado para criar um ambiente de teste seguro e controlado, onde foi possível:
- Realizar testes com transações sem custos associados.
- Depurar contratos inteligentes em tempo real, com logs detalhados.
- Ajustar parâmetros da blockchain local, como tempo de bloqueio e saldo inicial de contas, para reproduzir diferentes cenários.
  
#### Truffle
O Truffle é um framework que facilita o desenvolvimento de contratos inteligentes, oferecendo ferramentas para:
- Compilação e Migração: Automatizando o processo de converter contratos escritos em Solidity para bytecode e implantá-los na blockchain.
- Testes Automatizados: Permitindo a criação de testes usando JavaScript ou Solidity para verificar o comportamento dos contratos em diferentes cenários.
- Gerenciamento de Projetos: Fornecendo uma estrutura organizada para gerenciar os arquivos de contratos, scripts de implantação e dependências.

No contexto deste projeto, o Truffle foi utilizado para compilar, migrar e testar os contratos inteligentes no Ganache com JavaScript.

## Metodologia de Desenvolvimento
O desenvolvimento do projeto BET Distribuída seguiu uma abordagem estruturada que combinou conceitos teóricos de blockchain com práticas de implementação utilizando ferramentas citadas na seção anterior. 

#### **Planejamento e Definição de Requisitos**
O primeiro passo foi entender os requisitos funcionais e não funcionais do sistema, considerando:
- A criação de eventos de apostas por qualquer usuário.
- O registro de apostas com segurança e transparência.
- A determinação do resultado das apostas.
- Encerrar o evento.
- A redistribuição de valores apostados de forma justa aos vencedores.

Com base nesses requisitos, foi planejada a estrutura do contrato inteligente utilizando o modelo de dados descrito previamente, incluindo estruturas para armazenar eventos, apostas e saldos dos usuários.

#### **Implementação do Contrato**
A implementação foi realizada utilizando a linguagem Solidity, devido à sua compatibilidade com a blockchain Ethereum. As principais etapas incluíram:

1. Modelagem de Dados:
- Estruturas como Evento e Aposta foram definidas para representar os elementos principais do sistema.
- Mapeamentos foram usados para facilitar o armazenamento e a recuperação eficiente de informações.
2. Implementação das Funcionalidades:
- Funções foram desenvolvidas para permitir a criação de eventos, registro de apostas, encerramento de eventos e cálculo de prêmios.
- Eventos Solidity foram emitidos para registrar mudanças de estado e facilitar o monitoramento do contrato em tempo real.

3. **Ambiente de Testes**
O ambiente de testes foi criado utilizando o Ganache, que simulou uma blockchain local. Este ambiente possibilitou:
- A realização de testes em um ambiente seguro, sem custos associados a transações.
- A análise detalhada de logs de execução para depuração de problemas.

Além disso, o Truffle foi utilizado para:
- Compilar os contratos inteligentes.
- Implantá-los no Ganache.
- Executar testes automatizados escritos em JavaScript para verificar cenários como:
  - A criação de eventos.
  - A validação de apostas em diferentes opções.
  - A redistribuição correta de prêmios após o encerramento de eventos.
  - A consistência na distribuição de prêmios.
  - O comportamento do sistema em casos de erro, como tentar apostar após o prazo do evento.

## Resultados dos Testes
Os testes realizados no contrato inteligente da BET Distribuída confirmaram o funcionamento correto das funcionalidades principais, incluindo a criação de eventos, realização de apostas, depósito e saque de saldos, além de encerrar eventos e distribuir ganhos. Os resultados obtidos nos testes estão detalhados a seguir:

1. Criação de Eventos:
- Foi possível criar eventos com sucesso, incluindo opções de apostas e prazo de validade.
- O contrato emitiu corretamente o evento EventoCriado com os detalhes esperados, como descrição, prazo e opções.
2. Apostas:
- Apostas válidas foram processadas corretamente, com os valores sendo atualizados nos saldos do contrato.
- O evento ApostaFeita foi emitido com os parâmetros corretos, validando o apostador, o evento e o valor da aposta.
- Casos inválidos, como apostas com valor zero, após o prazo ou em opções inexistentes, foram rejeitados com mensagens de erro adequadas, demonstrando a robustez do contrato contra entradas incorretas.
3. Depósito e Saque:
- Os depósitos foram realizados com sucesso, atualizando os saldos dos usuários.
- O saque permitiu retirar o saldo disponível e zerar os valores armazenados no contrato. O evento SaldoSacado confirmou a operação, validando a transparência do sistema.
- Tentativas de saque com saldo insuficiente foram corretamente bloqueadas, garantindo a consistência dos dados financeiros.
4. Encerramento de Eventos:
- Após o término do prazo, os eventos puderam ser encerrados e os saldos dos vencedores foram atualizados adequadamente.
- A distribuição dos ganhos respeitou as proporções apostadas, refletindo a implementação correta da lógica de cálculo de odds e prêmios.

## Conclusão
Os resultados dos testes validaram a funcionalidade e segurança do contrato inteligente BET Distribuída. A implementação demonstrou ser robusta contra entradas inválidas, preservando a integridade dos dados financeiros e garantindo uma experiência confiável para os usuários.
A arquitetura descentralizada proporcionada pelo blockchain Ethereum assegurou a transparência e a imutabilidade das operações, tornando o sistema adequado para aplicações reais de apostas. Futuras melhorias podem incluir otimizações de gás, suporte a múltiplas moedas e interfaces mais amigáveis para usuários finais.
Essa abordagem reforça a aplicabilidade de contratos inteligentes em sistemas descentralizados e destaca o potencial da tecnologia blockchain em ambientes de alta confiabilidade.

