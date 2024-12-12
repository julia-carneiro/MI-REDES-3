import { useEffect, useState } from 'react';
import { 
  createEvent, 
  placeBet, 
  closeEvent, 
  getAllEventos, 
  getEvento
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
  CardContent
} from '@mui/material';

// Define an interface for the Event structure
interface BettingEvent {
  id: unknown;
  description: string;
  options: string[];
  deadline: number;
  encerrado?: boolean;
}

function App() {
  const [events, setEvents] = useState<BettingEvent[]>([]);
  const [openCreateEventDialog, setOpenCreateEventDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state for creating an event
  const [eventDescription, setEventDescription] = useState('');
  const [eventOptions, setEventOptions] = useState('');
  const [eventDeadline, setEventDeadline] = useState('');

  // Bet form state
  const [betEventId, setBetEventId] = useState('');
  const [betOption, setBetOption] = useState('');
  const [betValue, setBetValue] = useState('');

  const fetchEventos = async () => {
    try {

      const fetchedEventos = await getAllEventos() || [];
      setEvents(fetchedEventos);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Erro ao buscar eventos");
      setEvents([]);
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

  const handlePlaceBet = async () => {
    try {
      if (!betOption || !betValue || !betEventId) {
        setError("Por favor, forneça todos os campos necessários para fazer a aposta.");
        return;
      }
      await placeBet(Number(betEventId), Number(betOption), Number(betValue));
      setError("Aposta realizada com sucesso!");
    } catch (error) {
      console.error("Erro ao fazer aposta:", error);
      setError("Erro ao fazer aposta");
    }
  };

  const handleCloseEvent = async (eventId: number) => {
    try {
      // First, fetch the event details
      const evento = await getEvento(eventId);
      
      // Check if the event is past its deadline
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (evento.deadline > currentTimestamp) {
        setError("O evento ainda não atingiu seu prazo");
        return;
      }
  
      await closeEvent(eventId);
      setError("Evento encerrado com sucesso!");
    } catch (error) {
      console.error("Erro ao encerrar evento:", error);
      setError("Erro ao encerrar evento. Verifique se o prazo foi atingido.");
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

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

      <Box display="flex" justifyContent="center" mb={3}>
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
      </Box>

      {/* Empty State */}
      {events.length === 0 && (
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
              Nenhum evento cadastrado ainda
            </Typography>
            <Typography 
              variant="body1" 
              color="textSecondary" 
              paragraph
            >
              Crie seu primeiro evento de apostas clicando no botão "Criar Novo Evento"
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => setOpenCreateEventDialog(true)}
            >
              Criar Primeiro Evento
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Eventos Grid */}
      <Grid container spacing={3}>
        {(events || []).map((event) => (
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
              </Box>

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
                  onClick={() => handleCloseEvent(event.id)} 
                  fullWidth
                >
                  Encerrar Evento
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

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