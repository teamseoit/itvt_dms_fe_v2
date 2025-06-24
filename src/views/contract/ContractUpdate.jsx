import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  Grid,
  CircularProgress
} from '@mui/material';
import { IconArrowLeft } from '@tabler/icons-react';

import CONTRACT_API from '../../services/contractService';
import usePermissions from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../constants/permissions';
import { phoneNumber, formatPrice, formatCurrencyInput, parseCurrency } from '../../utils/formatConstants';

export default function ContractUpdate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    contractCode: '',
    customer: '',
    services: [],
    financials: {
      totalAmount: 0,
      amountPaid: 0,
      amountRemaining: 0,
      isFullyPaid: false
    }
  });

  const [errors, setErrors] = useState({});

  const { hasPermission } = usePermissions();

  useEffect(() => {
    if (!isEdit) {
      toast.error('Không tìm thấy hợp đồng cần cập nhật');
      navigate('/hop-dong');
      return;
    }
  }, [isEdit, navigate]);

  const fetchContractData = async () => {
    try {
      setLoading(true);
      const res = await CONTRACT_API.getById(id);
      if (res?.data?.success) {
        const contract = res.data.data;
        setFormData({
          contractCode: contract.contractCode || '',
          customer: contract.customer || '',
          services: contract.services || [],
          financials: {
            totalAmount: contract.financials?.totalAmount || 0,
            amountPaid: formatCurrencyInput((contract.financials?.amountPaid || 0).toString()),
            amountRemaining: contract.financials?.amountRemaining || 0,
            isFullyPaid: contract.financials?.isFullyPaid || false
          }
        });
      } else {
        toast.error('Không tìm thấy thông tin hợp đồng');
        navigate('/hop-dong');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi tải thông tin hợp đồng');
      navigate('/hop-dong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEdit) {
      fetchContractData();
    }
  }, [id]);

  const validateForm = () => {
    const newErrors = {};

    if (formData.financials.totalAmount < 0) {
      newErrors.totalAmount = 'Tổng tiền không được âm';
    }

    const parsedAmountPaid = parseCurrency(formData.financials.amountPaid || '0');
    if (parsedAmountPaid < 0) {
      newErrors.amountPaid = 'Số tiền đã thanh toán không được âm';
    }

    if (parsedAmountPaid > formData.financials.totalAmount) {
      newErrors.amountPaid = 'Số tiền đã thanh toán không được lớn hơn tổng tiền hợp đồng';
    }

    // Validation cho isFullyPaid
    const calculatedAmountRemaining = formData.financials.totalAmount - parsedAmountPaid;
    const calculatedIsFullyPaid = parsedAmountPaid <= formData.financials.totalAmount && calculatedAmountRemaining <= 0;
    
    if (formData.financials.isFullyPaid !== calculatedIsFullyPaid) {
      newErrors.isFullyPaid = 'Trạng thái thanh toán không khớp với số tiền đã thanh toán';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      
      // Xử lý đặc biệt cho amountPaid với định dạng tiền tệ
      if (parent === 'financials' && child === 'amountPaid') {
        const formattedValue = formatCurrencyInput(value);
        setFormData((prev) => {
          const newData = {
            ...prev,
            [parent]: {
              ...prev[parent],
              [child]: formattedValue
            }
          };
          
          // Tự động tính toán amountRemaining và isFullyPaid khi thay đổi amountPaid
          const parsedAmountPaid = parseCurrency(formattedValue);
          const newTotalAmount = newData.financials.totalAmount;
          
          newData.financials.amountRemaining = newTotalAmount - parsedAmountPaid;
          newData.financials.isFullyPaid = parsedAmountPaid <= newTotalAmount && newData.financials.amountRemaining <= 0;
          
          return newData;
        });

        // Validation real-time cho amountPaid
        const parsedAmountPaid = parseCurrency(formattedValue);
        const totalAmount = formData.financials.totalAmount;
        
        if (parsedAmountPaid < 0) {
          setErrors((prev) => ({
            ...prev,
            amountPaid: 'Số tiền đã thanh toán không được âm'
          }));
        } else if (parsedAmountPaid > totalAmount) {
          setErrors((prev) => ({
            ...prev,
            amountPaid: 'Số tiền đã thanh toán không được lớn hơn tổng tiền hợp đồng'
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            amountPaid: ''
          }));
        }
        return;
      }
      
      // Xử lý cho các trường khác trong financials
      setFormData((prev) => {
        const newData = {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: Number(value) || 0
          }
        };
        
        // Tự động tính toán amountRemaining và isFullyPaid khi thay đổi totalAmount
        if (parent === 'financials' && child === 'totalAmount') {
          const newTotalAmount = Number(value) || 0;
          const currentAmountPaid = parseCurrency(newData.financials.amountPaid || '0');
          
          newData.financials.amountRemaining = newTotalAmount - currentAmountPaid;
          newData.financials.isFullyPaid = currentAmountPaid <= newTotalAmount && newData.financials.amountRemaining <= 0;
        }
        
        return newData;
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing (cho các trường khác)
    if (errors[name] && !name.includes('.')) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!hasPermission(PERMISSIONS.CONTRACT.UPDATE)) {
      toast.error('Bạn không có quyền cập nhật hợp đồng');
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        amountPaid: parseCurrency(formData.financials.amountPaid)
      }
      
      const res = await CONTRACT_API.update(id, payload);

      if (res?.data?.success) {
        toast.success('Cập nhật hợp đồng thành công');
        navigate('/hop-dong');
      } else {
        toast.error(res?.data?.message || 'Đã có lỗi xảy ra');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate('/hop-dong');

  const canUpdate = isEdit && hasPermission(PERMISSIONS.CONTRACT.UPDATE);

  // Hàm tính toán trạng thái thanh toán
  const getPaymentStatus = () => {
    const { totalAmount, amountPaid, amountRemaining, isFullyPaid } = formData.financials;
    const parsedAmountPaid = parseCurrency(amountPaid || '0');
    
    // Kiểm tra tính nhất quán
    const calculatedRemaining = totalAmount - parsedAmountPaid;
    const calculatedIsFullyPaid = parsedAmountPaid <= totalAmount && calculatedRemaining <= 0;
    
    // Kiểm tra lỗi khi amountPaid > totalAmount
    if (parsedAmountPaid > totalAmount) {
      return {
        status: 'error',
        message: '❌ Lỗi: Số tiền thanh toán vượt quá tổng tiền',
        description: `Đã thanh toán ${formatPrice(parsedAmountPaid)} vượt quá tổng tiền ${formatPrice(totalAmount)}`
      };
    }
    
    if (Math.abs(calculatedRemaining - amountRemaining) > 0.01) {
      return {
        status: 'error',
        message: '❌ Dữ liệu không nhất quán',
        description: 'Số tiền còn lại không khớp với tính toán'
      };
    }
    
    if (isFullyPaid !== calculatedIsFullyPaid) {
      return {
        status: 'error',
        message: '❌ Trạng thái thanh toán không chính xác',
        description: 'Trạng thái thanh toán không khớp với số tiền'
      };
    }
    
    if (isFullyPaid && parsedAmountPaid <= totalAmount) {
      return {
        status: 'success',
        message: '✅ Đã thanh toán đầy đủ',
        description: `Đã thanh toán: ${formatPrice(parsedAmountPaid)} / ${formatPrice(totalAmount)}`
      };
    } else {
      return {
        status: 'warning',
        message: '⚠️ Chưa thanh toán đầy đủ',
        description: `Còn nợ: ${formatPrice(amountRemaining)} (${((amountRemaining / totalAmount) * 100).toFixed(1)}%)`
      };
    }
  };

  const paymentStatus = getPaymentStatus();

  if (!canUpdate) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            variant="text"
            color="primary"
            onClick={handleBack}
            startIcon={<IconArrowLeft />}
            sx={{ mr: 2 }}
          >
            Quay lại
          </Button>
          <Typography variant="h3">Cập nhật hợp đồng</Typography>
        </Box>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" color="error">Bạn không có quyền cập nhật hợp đồng!</Typography>
        </Paper>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          variant="text"
          color="primary"
          onClick={handleBack}
          startIcon={<IconArrowLeft />}
          sx={{ mr: 2 }}
        >
          Quay lại
        </Button>
        <Typography variant="h3">Cập nhật hợp đồng</Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h3" sx={{ mb: 3 }}>Chi tiết hợp đồng</Typography>
              
              {/* Thông tin cơ bản */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ mb: 2 }}>Thông tin cơ bản</Typography>
                <Typography variant="subtitle1">- Mã hợp đồng: {formData.contractCode}</Typography>
                <Typography variant="subtitle1">- Khách hàng: {formData.customer?.fullName} / {phoneNumber(formData.customer?.phoneNumber)} / {formData.customer?.email}</Typography>
              </Box>

              {/* Thông tin tài chính */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ mb: 2 }}>Thông tin tài chính</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Tổng tiền hợp đồng"
                      name="financials.totalAmount"
                      value={formatPrice(formData.financials.totalAmount)}
                      helperText={errors.totalAmount || `Giá trị: ${formatPrice(formData.financials.totalAmount)}`}
                      disabled
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Số tiền đã thanh toán"
                      name="financials.amountPaid"
                      value={formData.financials.amountPaid}
                      onChange={handleChange}
                      error={!!errors.amountPaid}
                      helperText={
                        errors.amountPaid 
                          ? errors.amountPaid 
                          : `Giá trị: ${formatPrice(parseCurrency(formData.financials.amountPaid || '0'))} | Tối đa: ${formatPrice(formData.financials.totalAmount)}`
                      }
                      disabled={formData.financials.isFullyPaid || loading}
                      InputProps={{
                        inputMode: 'numeric',
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Số tiền còn lại"
                      value={formatPrice(formData.financials.amountRemaining)}
                      disabled
                      sx={{
                        '& .MuiInputBase-input': {
                          color: formData.financials.amountRemaining > 0 ? 'error.main' : 'success.main',
                          fontWeight: 'bold'
                        }
                      }}
                    />
                  </Grid>
                </Grid>

                {/* Thông tin trạng thái thanh toán */}
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Trạng thái thanh toán:
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color={
                      paymentStatus.status === 'success' ? 'success.main' : 
                      paymentStatus.status === 'warning' ? 'warning.main' : 
                      'error.main'
                    }
                    sx={{ fontWeight: 'bold', mb: 1 }}
                  >
                    {paymentStatus.message}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color={
                      paymentStatus.status === 'success' ? 'success.main' : 
                      paymentStatus.status === 'warning' ? 'error.main' : 
                      'error.main'
                    }
                  >
                    {paymentStatus.description}
                  </Typography>
                  
                  {/* Hiển thị thông tin chi tiết */}
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">
                      Chi tiết:
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      • Tổng tiền: {formatPrice(formData.financials.totalAmount)}
                    </Typography>
                    <Typography variant="body2">
                      • Đã thanh toán: {formatPrice(parseCurrency(formData.financials.amountPaid || '0'))}
                    </Typography>
                    <Typography variant="body2">
                      • Còn lại: {formatPrice(formData.financials.amountRemaining)}
                    </Typography>
                    <Typography variant="body2">
                      • Trạng thái: {formData.financials.isFullyPaid ? 'Đã thanh toán đầy đủ' : 'Chưa thanh toán đầy đủ'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Nút điều khiển */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  disabled={loading}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={formData.financials.isFullyPaid || loading}
                >
                  {loading ? <CircularProgress size={20} /> : 'Cập nhật'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}
