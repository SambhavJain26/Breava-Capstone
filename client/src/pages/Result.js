import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Stack,
  Divider
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export default function Result() {
  const navigate = useNavigate();
  const location = useLocation();
  const { result = [] } = location.state || {};
  const resultsList = Array.isArray(result) ? result : [result];

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 2.5, px: 3, textAlign: 'center' }}>
          <Typography variant="h5" fontWeight={700}>
            Diagnostic Evaluation Summary
          </Typography>
        </Box>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Gaussian Naive Bayes model inference completed on uploaded patient cytology samples.
          </Typography>

          <Stack spacing={2} sx={{ mb: 4 }}>
            {resultsList.map((r, idx) => {
              const isMalignant = String(r).toLowerCase() === 'malignant';
              return (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    borderRadius: 2,
                    bgcolor: isMalignant ? '#fef2f2' : '#f0fdf4',
                    border: '1px solid',
                    borderColor: isMalignant ? '#fecaca' : '#bbf7d0',
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                    Patient Sample #{idx + 1}
                  </Typography>
                  <Chip
                    icon={isMalignant ? <WarningAmberIcon /> : <CheckCircleOutlineIcon />}
                    label={isMalignant ? 'MALIGNANT' : 'BENIGN'}
                    color={isMalignant ? 'error' : 'success'}
                    variant="filled"
                    sx={{ fontWeight: 700, letterSpacing: 0.5 }}
                  />
                </Box>
              );
            })}
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="outlined"
              color="primary"
              size="large"
              onClick={() => navigate('/diagnose')}
            >
              New Diagnosis
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate('/records')}
            >
              View Records
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
