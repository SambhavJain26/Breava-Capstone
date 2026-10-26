import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Alert,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export default function Records() {
  const { user, isLoggedIn } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      if (!isLoggedIn) {
        setError('You must be signed in to view records.');
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get('/api/records');
        setRecords(res.data);
      } catch (err) {
        console.error('Error fetching records:', err);
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [isLoggedIn]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  const userName = user?.name ? `${user.name}'s ` : '';

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Card elevation={3} sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            color="primary"
            fontWeight={700}
          >
            {userName}Clinical Diagnostic Records
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {records.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="textSecondary">
                No diagnostic records found on file.
              </Typography>
            </Box>
          ) : (
            <List sx={{ mt: 2 }}>
              {records.map((record) => {
                const date = new Date(record.createdAt).toLocaleString();
                const isMalignant = String(record.result).toLowerCase() === 'malignant';
                return (
                  <ListItem
                    key={record._id}
                    divider
                    secondaryAction={
                      <Chip
                        icon={isMalignant ? <WarningAmberIcon /> : <CheckCircleOutlineIcon />}
                        label={isMalignant ? 'MALIGNANT' : 'BENIGN'}
                        color={isMalignant ? 'error' : 'success'}
                        size="small"
                        sx={{ fontWeight: 700 }}
                      />
                    }
                  >
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight={600}>
                          {record.filename}
                        </Typography>
                      }
                      secondary={date}
                    />
                  </ListItem>
                );
              })}
            </List>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
