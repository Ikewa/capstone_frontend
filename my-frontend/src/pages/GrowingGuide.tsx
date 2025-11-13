import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  CircularProgress,
  Alert,
  LinearProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import axios from 'axios';
import Navbar from '../components/Navbar';

interface Crop {
  id: number;
  name: string;
  growing_duration: number;
  planting_time: string;
  spacing: string;
  water_requirement: string;
  soil_type: string;
  common_pests: string;
  pest_control: string;
  growing_tips: string;
}

interface GrowingStage {
  week: number;
  title: string;
  description: string;
  tasks: string[];
  tips?: string;
}

const GrowingGuide = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [crop, setCrop] = useState<Crop | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    fetchCrop();
  }, [id]);

  const fetchCrop = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get(`/api/crop-catalog/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCrop(response.data.crop);
      setLoading(false);
    } catch (err) {
      console.error('Error loading crop:', err);
      setLoading(false);
    }
  };

  const generateGrowingStages = (): GrowingStage[] => {
    if (!crop) return [];

    const duration = crop.growing_duration || 90;
    const stages: GrowingStage[] = [];

    // Week 0-1: Land Preparation
    stages.push({
      week: 0,
      title: 'Land Preparation',
      description: 'Prepare your land for planting',
      tasks: [
        'Clear the land of weeds and debris',
        `Ensure soil type is suitable: ${crop.soil_type || 'Well-drained soil'}`,
        'Test soil pH and fertility',
        'Add organic matter or compost if needed',
        'Create beds or ridges if required'
      ],
      tips: crop.growing_tips
    });

    // Week 1-2: Planting
    stages.push({
      week: 1,
      title: 'Planting',
      description: 'Plant your seeds or seedlings',
      tasks: [
        `Best planting time: ${crop.planting_time || 'Check seasonal guide'}`,
        `Plant with spacing: ${crop.spacing || '30cm x 30cm'}`,
        'Plant at proper depth (usually 2-3x seed diameter)',
        'Water immediately after planting',
        'Mark your planting area and date'
      ]
    });

    // Week 2-4: Early Growth
    stages.push({
      week: 2,
      title: 'Early Growth & Germination',
      description: 'Monitor seedling emergence and early growth',
      tasks: [
        `Maintain ${crop.water_requirement || 'regular'} water supply`,
        'Watch for germination (usually 5-10 days)',
        'Thin seedlings if overcrowded',
        'Remove weeds regularly',
        'Protect from birds and small animals'
      ]
    });

    // Week 4-6: Vegetative Growth
    if (duration > 30) {
      stages.push({
        week: 4,
        title: 'Vegetative Growth',
        description: 'Plants develop leaves and stems',
        tasks: [
          'Apply first dose of fertilizer',
          'Continue regular weeding',
          `Keep soil ${crop.water_requirement || 'moderately'} moist`,
          'Check for pest signs',
          'Stake or support tall plants if needed'
        ]
      });
    }

    // Mid-season: Flowering/Fruiting
    if (duration > 60) {
      const midWeek = Math.floor(duration / 14 / 2) * 2;
      stages.push({
        week: midWeek,
        title: 'Flowering & Development',
        description: 'Critical growth period',
        tasks: [
          'Apply second dose of fertilizer',
          'Increase watering during flowering',
          `Monitor for pests: ${crop.common_pests || 'Common pests'}`,
          `Pest control: ${crop.pest_control || 'Use appropriate methods'}`,
          'Remove diseased plants immediately'
        ]
      });
    }

    // Pre-harvest
    const preHarvestWeek = Math.floor((duration - 14) / 7);
    stages.push({
      week: preHarvestWeek,
      title: 'Pre-Harvest',
      description: 'Prepare for harvest',
      tasks: [
        'Reduce watering gradually',
        'Check for harvest maturity signs',
        'Prepare storage facilities',
        'Arrange harvest labor if needed',
        'Stop fertilizer application'
      ]
    });

    // Harvest
    const harvestWeek = Math.floor(duration / 7);
    stages.push({
      week: harvestWeek,
      title: 'Harvest',
      description: `Harvest after ${duration} days`,
      tasks: [
        'Harvest at proper maturity stage',
        'Use clean tools to prevent disease',
        'Handle produce carefully',
        'Sort and grade your harvest',
        'Store properly or sell immediately'
      ]
    });

    return stages;
  };

  const stages = generateGrowingStages();

  const handleStepComplete = (step: number) => {
    if (completedSteps.includes(step)) {
      setCompletedSteps(completedSteps.filter(s => s !== step));
    } else {
      setCompletedSteps([...completedSteps, step]);
    }
  };

  const progress = (completedSteps.length / stages.length) * 100;

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (!crop) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Crop not found</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/crop-catalog')} sx={{ mt: 2 }}>
          Back to Catalog
        </Button>
      </Container>
    );
  }

  return (
    <>
    <Navbar />
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate(`/crop-catalog/${id}`)}
        sx={{ mb: 3 }}
      >
        Back to Crop Details
      </Button>

      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            📖 Growing Guide: {crop.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Step-by-step guide from planting to harvest ({crop.growing_duration} days)
          </Typography>

          {/* Progress Bar */}
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" fontWeight="bold">
                Your Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {completedSteps.length} / {stages.length} stages completed
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Growing Stages */}
      <Stepper activeStep={activeStep} orientation="vertical">
        {stages.map((stage, index) => (
          <Step key={index} completed={completedSteps.includes(index)}>
            <StepLabel
              optional={
                <Typography variant="caption">Week {stage.week}</Typography>
              }
              StepIconComponent={() => 
                completedSteps.includes(index) ? 
                  <CheckCircleIcon color="success" /> : 
                  <RadioButtonUncheckedIcon color="action" />
              }
            >
              <Typography variant="h6" fontWeight="bold">
                {stage.title}
              </Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {stage.description}
              </Typography>

              {/* Tasks */}
              <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  ✓ Tasks to Complete:
                </Typography>
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                  {stage.tasks.map((task, taskIndex) => (
                    <li key={taskIndex}>
                      <Typography variant="body2">{task}</Typography>
                    </li>
                  ))}
                </Box>
              </Paper>

              {/* Tips */}
              {stage.tips && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>💡 Tip:</strong> {stage.tips}
                  </Typography>
                </Alert>
              )}

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button
                  variant={completedSteps.includes(index) ? 'outlined' : 'contained'}
                  size="small"
                  onClick={() => handleStepComplete(index)}
                  startIcon={completedSteps.includes(index) ? <RadioButtonUncheckedIcon /> : <CheckCircleIcon />}
                >
                  {completedSteps.includes(index) ? 'Mark Incomplete' : 'Mark Complete'}
                </Button>
                {index < stages.length - 1 && (
                  <Button
                    size="small"
                    onClick={() => setActiveStep(index + 1)}
                  >
                    Next Stage
                  </Button>
                )}
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>

      {/* Completion Message */}
      {completedSteps.length === stages.length && (
        <Alert severity="success" sx={{ mt: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            🎉 Congratulations!
          </Typography>
          <Typography variant="body2">
            You've completed all stages of growing {crop.name}. Time to enjoy your harvest!
          </Typography>
        </Alert>
      )}
    </Container>
    </>
  );
};

export default GrowingGuide;
