import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  CircularProgress, 
  Fade
} from '@mui/material';
import ServiceChart from '../../components/dashboard/ServiceChart';
import ContractList from '../../components/dashboard/ContractList';
import EmptyState from '../../components/dashboard/EmptyState';
import DASHBOARD_API from '../../services/dashboardService';

const Dashboard = () => {
  const [serviceStats, setServiceStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await DASHBOARD_API.getServiceStats();
      setServiceStats(stats);
    } catch (err) {
      setError('Không thể tải dữ liệu thống kê');
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);


  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="text.secondary">
          Đang tải dữ liệu...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        py: 4
      }}>
        <Container maxWidth="xl">
          <EmptyState onRefresh={fetchStats} loading={loading} />
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh'
    }}>
      <Container maxWidth="xl">
        {/* Service Chart */}
        <ServiceChart serviceStats={serviceStats} />
        
        {/* Contract List */}
        <Box sx={{ mt: 6 }}>
          <ContractList serviceStats={serviceStats} />
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;