import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
  Box, Button, Typography, Paper, TextField, Grid, CircularProgress,
  TableContainer, Table, TableHead, TableBody, TableRow, TableCell
} from '@mui/material';
import { IconArrowLeft } from '@tabler/icons-react';
import { toast } from 'react-toastify';

import CONTRACT_API from '../../services/contractService';
import usePermissions from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../constants/permissions';
import {
  phoneNumber, formatPrice, formatCurrencyInput,
  parseCurrency, formatDate
} from '../../utils/formatConstants';

const columns = [
  { id: 'name', label: 'Tên dịch vụ', minWidth: 200 },
  { id: 'registeredAt', label: 'Ngày đăng ký', minWidth: 110 },
  { id: 'expiredAt', label: 'Ngày hết hạn', minWidth: 110 },
  { id: 'vat', label: 'VAT', minWidth: 10 }
];

export default function ContractUpdate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const theme = useTheme();
  const isEdit = Boolean(id);

  const { hasPermission } = usePermissions();
  const canUpdate = isEdit && hasPermission(PERMISSIONS.CONTRACT.UPDATE);

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

  useEffect(() => {
    if (!isEdit) {
      toast.error('Không tìm thấy hợp đồng cần cập nhật');
      navigate('/hop-dong');
      return;
    }

    const fetchContractData = async () => {
      try {
        setLoading(true);
        const res = await CONTRACT_API.getById(id);
        if (res?.data?.success) {
          const contract = res.data.data;
          const { contractCode, customer, services, financials } = contract;
          const paid = formatCurrencyInput((financials?.amountPaid || 0).toString());

          setFormData({
            contractCode,
            customer,
            services,
            financials: {
              totalAmount: financials?.totalAmount || 0,
              amountPaid: paid,
              amountRemaining: financials?.amountRemaining || 0,
              isFullyPaid: financials?.isFullyPaid || false
            }
          });
        } else {
          throw new Error();
        }
      } catch (err) {
        toast.error('Lỗi khi tải thông tin hợp đồng');
        navigate('/hop-dong');
      } finally {
        setLoading(false);
      }
    };

    fetchContractData();
  }, [id, isEdit, navigate]);

  const handleBack = () => navigate('/hop-dong');

  const validateForm = () => {
    const { totalAmount, amountPaid, amountRemaining, isFullyPaid } = formData.financials;
    const paid = parseCurrency(amountPaid || '0');
    const calcRemaining = totalAmount - paid;
    const expectedIsPaid = paid <= totalAmount && calcRemaining <= 0;

    const newErrors = {};
    if (totalAmount < 0) newErrors.totalAmount = 'Tổng tiền không được âm';
    if (paid < 0) newErrors.amountPaid = 'Số tiền đã thanh toán không được âm';
    if (paid > totalAmount) newErrors.amountPaid = 'Số tiền đã thanh toán không được lớn hơn tổng tiền hợp đồng';
    if (isFullyPaid !== expectedIsPaid) newErrors.isFullyPaid = 'Trạng thái thanh toán không khớp với số tiền đã thanh toán';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'financials.amountPaid') {
      const formatted = formatCurrencyInput(value);
      const paid = parseCurrency(formatted);
      const total = formData.financials.totalAmount;
      const remaining = total - paid;
      const isFullyPaid = paid <= total && remaining <= 0;

      setFormData((prev) => ({
        ...prev,
        financials: {
          ...prev.financials,
          amountPaid: formatted,
          amountRemaining: remaining,
          isFullyPaid
        }
      }));

      if (paid < 0) {
        setErrors((prev) => ({ ...prev, amountPaid: 'Số tiền đã thanh toán không được âm' }));
      } else if (paid > total) {
        setErrors((prev) => ({ ...prev, amountPaid: 'Số tiền đã thanh toán không được lớn hơn tổng tiền hợp đồng' }));
      } else {
        setErrors((prev) => ({ ...prev, amountPaid: '' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!canUpdate) {
      toast.error('Bạn không có quyền cập nhật hợp đồng');
      return;
    }

    try {
      setLoading(true);
      const payload = { amountPaid: parseCurrency(formData.financials.amountPaid) };
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

  const renderPaymentStatus = () => {
    const { totalAmount, amountPaid, amountRemaining, isFullyPaid } = formData.financials;
    const paid = parseCurrency(amountPaid || '0');

    if (isFullyPaid) {
      return { status: 'success', message: '✅ Đã thanh toán đầy đủ', desc: `${formatPrice(paid)} / ${formatPrice(totalAmount)}` };
    }
    if (paid > totalAmount) {
      return { status: 'error', message: '❌ Lỗi: Số tiền vượt quá', desc: `Thanh toán ${formatPrice(paid)} > ${formatPrice(totalAmount)}` };
    }
    return { status: 'warning', message: '⚠️ Chưa thanh toán đủ', desc: `Còn nợ: ${formatPrice(amountRemaining)}` };
  };

  const status = renderPaymentStatus();

  if (!canUpdate) {
    return (
      <Box>
        <BackHeader onBack={handleBack} />
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" color="error">Bạn không có quyền cập nhật hợp đồng!</Typography>
        </Paper>
      </Box>
    );
  }

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <Box>
      <BackHeader onBack={handleBack} />
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h3" sx={{ mb: 3 }}>Chi tiết hợp đồng</Typography>

              <ContractBasicInfo data={formData} />
              <ContractFinancialInfo
                data={formData}
                errors={errors}
                onChange={handleChange}
                status={status}
              />
              <ContractServiceTable services={formData.services} theme={theme} loading={loading} />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="outlined" onClick={handleBack}>Hủy</Button>
                <Button type="submit" variant="contained" disabled={formData.financials.isFullyPaid || loading}>
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

const BackHeader = ({ onBack }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
    <Button variant="text" startIcon={<IconArrowLeft />} onClick={onBack}>Quay lại</Button>
    <Typography variant="h3" sx={{ ml: 2 }}>Cập nhật hợp đồng</Typography>
  </Box>
);

const LoadingIndicator = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
    <CircularProgress />
  </Box>
);

const ContractBasicInfo = ({ data }) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="h4" sx={{ mb: 2 }}>Thông tin cơ bản</Typography>
    <Typography variant="subtitle1">- Mã hợp đồng: {data.contractCode}</Typography>
    <Typography variant="subtitle1">
      - Khách hàng: {data.customer?.gender === 0 ? 'Anh' : 'Chị'} {data.customer?.fullName} / {phoneNumber(data.customer?.phoneNumber)} / {data.customer?.email}
    </Typography>
  </Box>
);

const ContractFinancialInfo = ({ data, errors, onChange, status }) => {
  const { totalAmount, amountPaid, amountRemaining, isFullyPaid } = data.financials;
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Thông tin tài chính</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField fullWidth label="Tổng tiền hợp đồng" value={formatPrice(totalAmount)} disabled />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Số tiền đã thanh toán"
            name="financials.amountPaid"
            value={amountPaid}
            onChange={onChange}
            error={!!errors.amountPaid}
            helperText={errors.amountPaid || `Tối đa: ${formatPrice(totalAmount)}`}
            disabled={isFullyPaid}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Số tiền còn lại"
            value={formatPrice(amountRemaining)}
            disabled
            sx={{
              '& .MuiInputBase-input': {
                color: amountRemaining > 0 ? 'error.main' : 'success.main',
                fontWeight: 'bold'
              }
            }}
          />
        </Grid>
      </Grid>
      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="subtitle2">Trạng thái thanh toán:</Typography>
        <Typography variant="body2" color={`${status.status}.main`} fontWeight="bold">
          {status.message}
        </Typography>
        <Typography variant="body2" color="text.secondary">{status.desc}</Typography>
      </Box>
    </Box>
  );
};

const ContractServiceTable = ({ services, theme, loading }) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="h4" sx={{ mb: 2 }}>Thông tin dịch vụ</Typography>
    <TableContainer>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            {columns.map(col => (
              <TableCell key={col.id} sx={{ minWidth: col.minWidth, backgroundColor: theme.palette.primary.light }}>
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={4} align="center"><CircularProgress /></TableCell></TableRow>
          ) : (
            services.map((row) => (
              <TableRow hover key={row._id}>
                <TableCell>
                  <Typography variant="subtitle1">
                    {row.serviceType === 'hosting'
                      ? row.serviceId.hostingPlanId.name
                      : row.serviceId.name}
                  </Typography>
                </TableCell>
                <TableCell>{formatDate(row.serviceId.registeredAt)}</TableCell>
                <TableCell>{formatDate(row.serviceId.expiredAt)}</TableCell>
                <TableCell>{row.serviceId.vatIncluded ? 'Có' : 'Không'}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);
