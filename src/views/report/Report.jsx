import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  Paper,
  Divider,
  Avatar
} from '@mui/material';
import { Assessment, TrendingUp, Timeline } from '@mui/icons-material';
import REPORT_API from '../../services/reportService';
import ReportFilters from './components/ReportFilters';
import ExpenseSummary from './components/ExpenseSummary';
import ExpenseChart from './components/ExpenseChart';
import ExpenseTable from './components/ExpenseTable';

const Report = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    year: [new Date().getFullYear().toString()],
    months: undefined,
    services: [1, 2, 3, 4, 5] // Default to all services
  });

  // Load initial data
  useEffect(() => {
    handleFilterChange(filters);
  }, []);

  const handleFilterChange = async (newFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        year: newFilters.year.join(','),
        services: newFilters.services.join(',')
      };
      
      if (newFilters.months && newFilters.months.length > 0) {
        params.months = newFilters.months.join(',');
      }

      const response = await REPORT_API.getExpenseReport(params);
      setReportData(response.data);
      setFilters(newFilters);
    } catch (err) {
      console.error('Lỗi tải báo cáo:', err);
      setError('Không thể tải báo cáo. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const isMonthly = filters.month !== undefined && filters.month !== '';
  const period = isMonthly 
    ? `${filters.year} - Tháng ${filters.month}`
    : `Năm ${filters.year}`;

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh',
      py: 3
    }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box mb={4}>
          <Paper 
            elevation={3}
            sx={{ 
              p: 4, 
              background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
              color: 'white',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar 
                sx={{ 
                  mr: 2, 
                  width: 56, 
                  height: 56, 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Assessment sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h3" component="h1" fontWeight="bold" color="white" mb={1}>
                  Báo cáo thống kê chi phí
                </Typography>
                <Typography variant="h5" sx={{ opacity: 0.9, fontWeight: 400, color: 'white' }}>
                  Thống kê và phân tích chi phí của các dịch vụ theo tháng và năm
                </Typography>
              </Box>
            </Box>
            
            {/* Decorative elements */}
            <Box
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                zIndex: 1
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -30,
                left: -30,
                width: 150,
                height: 150,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                zIndex: 1
              }}
            />
          </Paper>
        </Box>

        {/* Filters */}
        <Box mb={4}>
          <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <ReportFilters 
              onFilterChange={handleFilterChange}
              loading={loading}
            />
          </Paper>
        </Box>

        {/* Error Alert */}
        {error && (
          <Box mb={3}>
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </Box>
        )}

        {/* Loading */}
        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress size={40} />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Đang tải dữ liệu...
            </Typography>
          </Box>
        )}

        {/* Report Content */}
        {!loading && reportData && (
          <Box>
            {/* Summary Cards */}
            {/* <Box mb={4}>
              <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ p: 3, backgroundColor: 'white' }}>
                  <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Assessment sx={{ mr: 1, color: 'primary.main' }} />
                    Tổng quan thống kê
                  </Typography>
                  <ExpenseSummary 
                    data={reportData}
                    period={period}
                    isMonthly={isMonthly}
                  />
                </Box>
              </Paper>
            </Box> */}

            {/* Charts */}
            <Box mb={4}>
              <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ p: 3, backgroundColor: 'white' }}>
                  <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
                    Biểu đồ thống kê
                  </Typography>
                  <ExpenseChart 
                    data={reportData}
                    period={period}
                    isMonthly={isMonthly}
                  />
                </Box>
              </Paper>
            </Box>

            {/* Data Table */}
            <Box mb={4}>
              <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ p: 3, backgroundColor: 'white' }}>
                  <ExpenseTable 
                    data={reportData}
                    period={period}
                    isMonthly={isMonthly}
                  />
                </Box>
              </Paper>
            </Box>

            {/* Additional Info */}
            <Paper 
              elevation={2} 
              sx={{ 
                p: 4, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                border: '1px solid #dee2e6'
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Timeline sx={{ mr: 1, color: 'primary.main' }} />
                Thông tin bổ sung
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, backgroundColor: 'white', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Khoảng thời gian:</strong>
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {period}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, backgroundColor: 'white', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Số dịch vụ được chọn:</strong>
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {filters.services.length} dịch vụ
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, backgroundColor: 'white', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Tổng số bản ghi:</strong>
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {reportData.summary?.totalRecords || 0} bản ghi
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, backgroundColor: 'white', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Tổng giá mua:</strong>
                    </Typography>
                    <Typography variant="body1" fontWeight="medium" color="success.main">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(isMonthly ? reportData.monthlyPurchaseTotal || 0 : reportData.grandPurchaseTotal || 0)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, backgroundColor: 'white', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Loại báo cáo:</strong>
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {isMonthly ? 'Theo tháng' : 'Theo năm'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        )}

        {/* Empty State */}
        {!loading && !reportData && !error && (
          <Paper 
            elevation={2}
            sx={{ 
              p: 6, 
              textAlign: 'center', 
              borderRadius: 3,
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
            }}
          >
            <Avatar sx={{ bgcolor: 'grey.300', mx: 'auto', mb: 3, width: 80, height: 80 }}>
              <TrendingUp sx={{ fontSize: 40, color: 'grey.600' }} />
            </Avatar>
            <Typography variant="h5" color="text.secondary" gutterBottom fontWeight="bold">
              Chưa có dữ liệu báo cáo
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
              Vui lòng chọn bộ lọc và nhấn "Áp dụng" để xem báo cáo thống kê chi tiết
            </Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default Report;
