import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Fade,
  Slide,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { 
  IconFileText,
  IconTrendingUp,
  IconAlertTriangle,
  IconX,
  IconEye,
  IconEdit
} from '@tabler/icons-react';
import CONTRACT_API from '../../services/contractService';
import { formatDateTime, formatDate, formatPrice } from '../../utils/formatConstants';

const ContractList = ({ serviceStats }) => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await CONTRACT_API.getAll({ page: 1, limit: 10 });
      if (response.data.success) {
        setContracts(response.data.data);
      }
    } catch (err) {
      setError('Không thể tải danh sách hợp đồng');
      console.error('Error fetching contracts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const getStatusText = (status) => {
    switch (status) {
      case 1:
        return 'Đã thanh toán';
      case 2:
        return 'Chưa thanh toán';
      default:
        return 'Không xác định';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 1:
        return '#4caf50';
      case 2:
        return '#ff9800';
      default:
        return '#9e9e9e';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Card sx={{ borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="h6" color="error">
            {error}
          </Typography>
          <Button onClick={fetchContracts} sx={{ mt: 2 }}>
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* Contract Table */}
      <Fade in timeout={1600}>
        <Card sx={{ 
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box 
                sx={{ 
                  p: 1.5, 
                  borderRadius: '12px', 
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  mr: 2
                }}
              >
                <IconFileText size={24} color="#667eea" />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#333' }}>
                Danh sách Hợp đồng
              </Typography>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Mã hợp đồng</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Khách hàng</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Tổng tiền</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Đã thanh toán</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Còn lại</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Ngày tạo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contracts.map((contract, index) => (
                    <Slide direction="up" in timeout={1800 + (index * 100)} key={contract._id}>
                      <TableRow hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {contract.contractCode || 'N/A'}
                          </Typography>
                        </TableCell>
                         <TableCell>
                           <Typography variant="body2">
                             {contract.customer?.fullName || 'N/A'}
                           </Typography>
                         </TableCell>
                         <TableCell>
                           <Typography variant="body2" sx={{ fontWeight: 500 }}>
                             {contract.financials?.totalAmount ? formatPrice(contract.financials?.totalAmount) : 'N/A'}
                           </Typography>
                         </TableCell>
                         <TableCell>
                           <Typography variant="body2" sx={{ fontWeight: 500, color: '#4caf50' }}>
                             {contract.financials?.amountPaid !== undefined ? formatPrice(contract.financials?.amountPaid) : 'N/A'}
                           </Typography>
                         </TableCell>
                         <TableCell>
                           <Typography variant="body2" sx={{ fontWeight: 500, color: '#ff9800' }}>
                            {contract.financials?.amountRemaining !== undefined ? formatPrice(contract.financials?.amountRemaining) : 'N/A'}
                           </Typography>
                         </TableCell>
                         <TableCell>
                           <Chip
                             label={getStatusText(contract.financials?.isFullyPaid ? 1 : 2)}
                             size="small"
                             sx={{
                               backgroundColor: getStatusColor(contract.financials?.isFullyPaid ? 1 : 2),
                               color: 'white',
                               fontWeight: 600
                             }}
                           />
                         </TableCell>
                         <TableCell>
                           <Typography variant="body2">
                             {contract.createdAt ? formatDateTime(contract.createdAt) : 'N/A'}
                           </Typography>
                         </TableCell>
                      </TableRow>
                    </Slide>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
};

export default ContractList;
