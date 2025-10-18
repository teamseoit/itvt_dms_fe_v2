import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Chip,
  TablePagination,
  Avatar,
  LinearProgress,
  Grid
} from '@mui/material';
import {
  Assessment,
  TrendingUp,
  MonetizationOn,
  Timeline
} from '@mui/icons-material';

const ExpenseTable = ({ data, period, isMonthly }) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  if (!data) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" color="text.secondary" align="center">
            Chưa có dữ liệu để hiển thị bảng
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Chuẩn bị dữ liệu cho bảng
  const prepareTableData = () => {
    if (isMonthly) {
      // Dữ liệu theo tháng - hiển thị các dịch vụ
      const services = Object.keys(data.data || {});
      return services.map(service => ({
        id: service,
        name: service,
        totalPrice: data.data[service]?.totalPrice || 0,
        count: data.data[service]?.count || 0,
        percentage: data.totalExpense > 0 
          ? ((data.data[service]?.totalPrice || 0) / data.totalExpense * 100).toFixed(1)
          : 0
      }));
    } else {
      // Dữ liệu theo năm - hiển thị theo tháng
      const monthlyData = data.monthlyData || [];
      return monthlyData.map((monthData, index) => ({
        id: index,
        name: monthData.month,
        monthNumber: monthData.monthNumber,
        totalPrice: monthData.monthlyTotal,
        count: Object.values(monthData.services).reduce((sum, service) => sum + service.count, 0),
        percentage: data.grandTotal > 0 
          ? (monthData.monthlyTotal / data.grandTotal * 100).toFixed(1)
          : 0,
        services: monthData.services
      }));
    }
  };

  const tableData = prepareTableData();
  const paginatedData = tableData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getServiceBreakdown = (services) => {
    if (!services) return null;
    
    return Object.keys(services).map(service => (
      <Box key={service} display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
          {service}:
        </Typography>
        <Typography variant="body2" fontWeight="medium" sx={{ fontSize: '0.75rem' }}>
          {formatCurrency(services[service].totalPrice)}
        </Typography>
      </Box>
    ));
  };

  const getServiceIcon = (serviceName) => {
    const icons = {
      'Domain': <Assessment />,
      'Hosting': <TrendingUp />,
      'Email': <MonetizationOn />,
      'SSL': <Timeline />,
      'Website': <Assessment />
    };
    return icons[serviceName] || <Assessment />;
  };

  return (
    <Box>
      {/* Header với thống kê tổng quan */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 1 }}>
                <Assessment />
              </Avatar>
              <Typography variant="h6" color="primary.main" fontWeight="bold">
                {formatCurrency(isMonthly ? data.totalExpense : data.grandTotal)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng chi phí
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1 }}>
                <TrendingUp />
              </Avatar>
              <Typography variant="h6" color="success.main" fontWeight="bold">
                {isMonthly ? data.summary?.totalServices : data.summary?.totalServices}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Số dịch vụ
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 1 }}>
                <MonetizationOn />
              </Avatar>
              <Typography variant="h6" color="secondary.main" fontWeight="bold">
                {isMonthly ? data.summary?.totalRecords : data.summary?.totalRecords}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng bản ghi
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'secondary.main', mx: 'auto', mb: 1 }}>
                <Timeline />
              </Avatar>
              <Typography variant="h6" color="secondary.main" fontWeight="bold">
                {period}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Khoảng thời gian
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bảng dữ liệu */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Assessment sx={{ mr: 1, color: 'primary.main' }} />
            Bảng dữ liệu chi tiết - {period}
          </Typography>
          
          <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Table>
              <TableHead sx={{ backgroundColor: 'grey.100' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    {isMonthly ? 'Dịch vụ' : 'Tháng'}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    Tổng chi phí
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    Số lượng
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    Tỷ lệ (%)
                  </TableCell>
                  {!isMonthly && (
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                      Chi tiết dịch vụ
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((row, index) => (
                  <TableRow 
                    key={row.id} 
                    hover
                    sx={{ 
                      '&:nth-of-type(odd)': { backgroundColor: 'grey.50' },
                      '&:hover': { backgroundColor: 'primary.lighter' }
                    }}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {isMonthly && (
                          <Avatar sx={{ bgcolor: 'primary.light', mr: 2, width: 32, height: 32 }}>
                            {getServiceIcon(row.name)}
                          </Avatar>
                        )}
                        <Typography variant="body2" fontWeight="medium">
                          {row.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold" color="primary.main">
                        {formatCurrency(row.totalPrice)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {row.count}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box display="flex" alignItems="center" justifyContent="flex-end">
                        <LinearProgress
                          variant="determinate"
                          value={parseFloat(row.percentage)}
                          sx={{ 
                            width: 60, 
                            mr: 1, 
                            height: 6, 
                            borderRadius: 3,
                            backgroundColor: 'grey.300'
                          }}
                        />
                        <Chip 
                          label={`${row.percentage}%`}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ minWidth: 50 }}
                        />
                      </Box>
                    </TableCell>
                    {!isMonthly && (
                      <TableCell>
                        <Box sx={{ maxWidth: 200 }}>
                          {getServiceBreakdown(row.services)}
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                
                {/* Tổng cộng */}
                <TableRow sx={{ backgroundColor: 'primary.lighter', '& td': { borderTop: '2px solid', borderTopColor: 'primary.main' } }}>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
                      <Assessment sx={{ mr: 1, color: 'primary.main' }} />
                      TỔNG CỘNG
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                      {formatCurrency(isMonthly ? data.totalExpense : data.grandTotal)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2" fontWeight="bold">
                      {isMonthly ? data.summary?.totalRecords : data.summary?.totalRecords}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip 
                      label="100%"
                      size="small"
                      color="primary"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  {!isMonthly && (
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        Tất cả dịch vụ
                      </Typography>
                    </TableCell>
                  )}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={tableData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số dòng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) => 
              `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
            }
            sx={{ mt: 2 }}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default ExpenseTable;