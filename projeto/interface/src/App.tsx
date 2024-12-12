import { useEffect, useState } from 'react';
import { 
  createEvent, 
  placeBet, 
  closeEvent, 
  getAllEventos, 
  getEvento,
  withdrawFunds,
  depositFunds,
  getUserBalance,
} from './web3/web3';
import { 
  Container, 
  TextField, 
  Button, 
  Typography, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Grid, 
  Chip, 
  Box, 
  Paper,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Tabs,
  Tab
} from '@mui/material';

// Define an interface for the Event structure
interface BettingEvent {
  id: unknown;
  description: string;
  options: string[];
  deadline: number;
  encerrado?: boolean;
  resultado?: number;
}

function App() {
  const [events, setEvents] = useState<BettingEvent[]>([]);
  const [closedEvents, setClosedEvents] = useState<BettingEvent[]>([]);
  const [openCreateEventDialog, setOpenCreateEventDialog] = useState(false);
  const [openResultDialog, setOpenResultDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state for creating an event
  const [eventDescription, setEventDescription] = useState('');
  const [eventOptions, setEventOptions] = useState('');
  const [eventDeadline, setEventDeadline] = useState('');

  // Bet form state
  const [betEventId, setBetEventId] = useState('');
  const [betOption, setBetOption] = useState('');
  const [betValue, setBetValue] = useState('');

  // Result selection state
  const [selectedEventForResult, setSelectedEventForResult] = useState<BettingEvent | null>(null);
  const [selectedResultOption, setSelectedResultOption] = useState<number | null>(null);

  // Tab state
  const [currentTab, setCurrentTab] = useState(0);

  // New state for deposit and withdraw
  const [openDepositDialog, setOpenDepositDialog] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [userBalance, setUserBalance] = useState('0');

  // Fetch user balance
  const fetchUserBalance = async () => {
    try {
      const balance = await getUserBalance();
      setUserBalance(balance);
    } catch (error) {
      console.error("Erro ao buscar saldo:", error);
      setError("Erro ao buscar saldo");
    }
  };

  // Update useEffect to fetch balance
  useEffect(() => {
    fetchEventos();
    fetchUserBalance();
  }, []);

  // Handle deposit
  const handleDeposit = async () => {
    try {
      const amount = parseFloat(depositAmount);
      if (isNaN(amount) || amount <= 0) {
        setError("Por favor, insira um valor válido");
        return;
      }

      await depositFunds(amount);
      await fetchUserBalance();
      
      setOpenDepositDialog(false);
      setDepositAmount('');
      setError("Depósito realizado com sucesso!");
    } catch (error) {
      console.error("Erro no depósito:", error);
      setError("Erro ao realizar depósito");
    }
  };

  // Handle withdraw
  const handleWithdraw = async () => {
    try {
      await withdrawFunds();
      await fetchUserBalance();
      
      setError("Saque realizado com sucesso!");
    } catch (error) {
      console.error("Erro no saque:", error);
      setError("Erro ao realizar saque");
    }
  };
  
  const fetchEventos = async () => {
    try {
      const fetchedEventos = await getAllEventos() || [];
      
      // Separate active and closed events
      const activeEvents = fetchedEventos.filter(evento => !evento.encerrado);
      const closedEventsList = fetchedEventos.filter(evento => evento.encerrado);

      setEvents(activeEvents);
      setClosedEvents(closedEventsList);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Erro ao buscar eventos");
      setEvents([]);
      setClosedEvents([]);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  const handleCreateEvent = async () => {
    try {
      const optionsArray = eventOptions.split(',').map(opt => opt.trim());
      const deadlineTimestamp = eventDeadline 
        ? Math.floor(new Date(eventDeadline).getTime() / 1000) 
        : Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      
      const result = await createEvent(eventDescription, optionsArray, deadlineTimestamp);

      const newEvent: BettingEvent = {
        id: result,  
        description: eventDescription,
        options: optionsArray,
        deadline: deadlineTimestamp,
      };

      setEvents([...events, newEvent]);
      
      // Reset form and close dialog
      setEventDescription('');
      setEventOptions('');
      setEventDeadline('');
      setOpenCreateEventDialog(false);
    } catch (error) {
      console.error("Erro ao criar o evento:", error);
      setError("Erro ao criar evento");
    }
  };

  // In the handlePlaceBet function
const handlePlaceBet = async () => {
  try {
    if (!betOption || !betValue || !betEventId) {
      setError("Por favor, forneça todos os campos necessários para fazer a aposta.");
      return;
    }

    // Convert betOption and betValue to numbers
    const optionNum = Number(betOption);
    const valueNum = Number(betValue);

    // Validate inputs
    if (isNaN(optionNum) || isNaN(valueNum) || valueNum <= 0) {
      setError("Valores de aposta inválidos. Verifique a opção e o valor.");
      return;
    }

    await placeBet(Number(betEventId), optionNum, valueNum);
    
    // Clear bet fields after successful bet
    setBetOption('');
    setBetValue('');
    setBetEventId('');

    // Fetch updated events and balance
    await fetchEventos();
    await fetchUserBalance();

    setError("Aposta realizada com sucesso!");
  } catch (error: unknown) {
    console.error("Erro ao fazer aposta:", error);
    
    // Handle different types of errors
    if (error instanceof Error) {
      // Map specific error messages
      const errorMessage = error.message.includes('Saldo insuficiente') 
        ? "Saldo insuficiente para realizar a aposta. Por favor, faça um depósito."
        : error.message.includes('Apostas encerradas') 
        ? "Prazo de apostas encerrado para este evento."
        : error.message.includes('Opção de aposta inválida')
        ? "Opção de aposta inválida. Verifique as opções disponíveis."
        : "Erro ao realizar aposta. Tente novamente.";
      
      setError(errorMessage);
    } else {
      setError("Erro desconhecido ao fazer aposta");
    }
  }
};

  const handleCloseEvent = async (event: BettingEvent) => {
    try {
      // Open result selection dialog
      setSelectedEventForResult(event);
      setOpenResultDialog(true);
    } catch (error) {
      console.error("Erro ao encerrar evento:", error);
      setError("Erro ao encerrar evento. Verifique se o prazo foi atingido.");
    }
  };

  const handleSelectResult = async () => {
    try {
      if (selectedEventForResult && selectedResultOption !== null) {
        await closeEvent(Number(selectedEventForResult.id), selectedResultOption);
        
        // Remove from active events and add to closed events
        const updatedEvents = events.filter(e => e.id !== selectedEventForResult.id);
        const closedEvent = {
          ...selectedEventForResult, 
          encerrado: true, 
          resultado: selectedResultOption
        };
        
        setEvents(updatedEvents);
        setClosedEvents([...closedEvents, closedEvent]);
        
        setOpenResultDialog(false);
        setSelectedEventForResult(null);
        setSelectedResultOption(null);
        setError("Evento encerrado com sucesso!");
      } else {
        setError("Por favor, selecione um resultado");
      }
    } catch (error) {
      console.error("Erro ao selecionar resultado:", error);
      setError("Erro ao selecionar resultado");
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const renderEventList = (eventList: BettingEvent[]) => (
    <Grid container spacing={3}>
      {eventList.length === 0 && (
        <Grid item xs={12}>
          <Card 
            sx={{ 
              maxWidth: 600, 
              margin: '0 auto', 
              textAlign: 'center',
              backgroundColor: '#f9fafb',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            <CardContent>
              <Typography 
                variant="h5" 
                color="textSecondary" 
                gutterBottom
              >
                {currentTab === 0 
                  ? "Nenhum evento ativo" 
                  : "Nenhum evento encerrado"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      )}
      {eventList.map((event) => (
        <Grid item xs={12} md={6} lg={4} key={event.id}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              borderRadius: '10px',
              background: 'linear-gradient(145deg, #f3f4f6, #e7e9ee)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.02)'
              }
            }}
          >
            {/* Event Details */}
            <Typography variant="h6" gutterBottom>
              {event.description}
            </Typography>
            <Box mb={2}>
              <Typography variant="body2" color="textSecondary">
                Prazo: {new Date(Number(event.deadline) * 1000).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Opções:
              </Typography>
              <Box display="flex" gap={1}>
                {event.options.map((option, index) => (
                  <Chip 
                    key={index} 
                    label={option} 
                    variant="outlined" 
                    color="primary" 
                    size="small" 
                  />
                ))}
              </Box>
              {event.encerrado && event.resultado !== undefined && (
                <Box mt={2}>
                  <Typography variant="body2" color="primary">
                    Resultado: {event.options[event.resultado]}
                  </Typography>
                </Box>
              )}
            </Box>

            {!event.encerrado && (
              <>
                {/* Bet Section */}
                <Box display="flex" flexDirection="column" gap={1}>
                  <TextField
                    label="Opção"
                    value={betOption}
                    onChange={(e) => {
                      setBetOption(e.target.value);
                      setBetEventId(String(event.id));
                    }}
                    size="small"
                    fullWidth
                    type="number"
                  />
                  <TextField
                    label="Valor (ETH)"
                    value={betValue}
                    onChange={(e) => setBetValue(e.target.value)}
                    size="small"
                    fullWidth
                    type="number"
                  />
                </Box>

                {/* Action Buttons */}
                <Box display="flex" gap={1} mt={2}>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    onClick={handlePlaceBet} 
                    fullWidth
                  >
                    Fazer Aposta
                  </Button>
                  <Button 
                    variant="contained" 
                    color="error" 
                    onClick={() => handleCloseEvent(event)} 
                    fullWidth
                  >
                    Encerrar Evento
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  return (
      <Container 
        maxWidth="lg" 
        sx={{ 
          marginTop: '20px', 
          backgroundColor: '#f0f4f8', 
          padding: '20px', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}
      >
        <Typography 
          variant="h4" 
          gutterBottom 
          align="center" 
          sx={{ 
            color: '#2c3e50', 
            fontWeight: 'bold',
            marginBottom: '30px'
          }}
        >
          Casa de Apostas 🎲
        </Typography>
  
        {/* User Balance and Deposit/Withdraw Section */}
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          gap={2} 
          mb={3}
        >
          <Typography variant="h6">
            Saldo: {userBalance} ETH
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => setOpenDepositDialog(true)}
          >
            Depositar
          </Button>
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={handleWithdraw}
            disabled={parseFloat(userBalance) === 0}
          >
            Sacar
          </Button>
        </Box>
  
        {/* Rest of the existing code... */}
  
        {/* Deposit Dialog */}
        <Dialog 
          open={openDepositDialog} 
          onClose={() => setOpenDepositDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Depositar Fundos</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Valor do Depósito (ETH)"
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              margin="normal"
              inputProps={{ min: "0.000001", step: "0.000001" }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDepositDialog(false)} color="secondary">
              Cancelar
            </Button>
            <Button 
              onClick={handleDeposit} 
              color="primary" 
              variant="contained"
              disabled={!depositAmount || parseFloat(depositAmount) <= 0}
            >
              Depositar
            </Button>
          </DialogActions>
        </Dialog>

      {/* Tabs for Current and Closed Events */}
      <Tabs 
        value={currentTab} 
        onChange={handleTabChange} 
        centered 
        sx={{ marginBottom: 3 }}
      >
        <Tab label="Eventos Atuais" />
        <Tab label="Eventos Encerrados" />
      </Tabs>

      <Box display="flex" justifyContent="center" mb={3}>
        {currentTab === 0 && (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => setOpenCreateEventDialog(true)}
            sx={{ 
              padding: '10px 20px',
              backgroundColor: '#3498db',
              '&:hover': {
                backgroundColor: '#2980b9'
              }
            }}
          >
            Criar Novo Evento
          </Button>
        )}
      </Box>

      {/* Render Events based on current tab */}
      {currentTab === 0 
        ? renderEventList(events) 
        : renderEventList(closedEvents)}

      {/* Create Event Dialog */}
      <Dialog 
        open={openCreateEventDialog} 
        onClose={() => setOpenCreateEventDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Criar Novo Evento</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Descrição do Evento"
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Opções (separadas por vírgula)"
            value={eventOptions}
            onChange={(e) => setEventOptions(e.target.value)}
            margin="normal"
            helperText="Digite as opções separadas por vírgula, por exemplo: Sim, Não, Talvez"
          />
          <TextField
            fullWidth
            label="Prazo"
            type="datetime-local"
            value={eventDeadline}
            onChange={(e) => setEventDeadline(e.target.value)}
            InputLabelProps={{ shrink: true }}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateEventDialog(false)} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleCreateEvent} color="primary" variant="contained">
            Criar Evento
          </Button>
        </DialogActions>
      </Dialog>

      {/* Result Selection Dialog */}
      <Dialog 
        open={openResultDialog} 
        onClose={() => setOpenResultDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Selecionar Resultado do Evento</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            {selectedEventForResult?.description}
          </Typography>
          <Grid container spacing={2}>
            {selectedEventForResult?.options.map((option, index) => (
              <Grid item xs={12} key={index}>
                <Button
                  variant={selectedResultOption === index ? "contained" : "outlined"}
                  color="primary"
                  onClick={() => setSelectedResultOption(index)}
                  fullWidth
                >
                  {option}
                </Button>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenResultDialog(false)} color="secondary">
            Cancelar
          </Button>
          <Button 
            onClick={handleSelectResult} 
            color="primary" 
            variant="contained"
            disabled={selectedResultOption === null}
          >
            Confirmar Resultado
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Handling Snackbar */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseError} 
          severity={error?.includes('sucesso') ? 'success' : 'error'} 
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default App;