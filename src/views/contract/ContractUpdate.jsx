// ContractUpdateRefactor.js
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
    contractCode: '', customer: '', services: [],
    financials: { totalAmount: 0, amountPaid: 0, amountRemaining: 0, isFullyPaid: false }
  });
  const [errors, setErrors] = useState({});
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [amountPaidNext, setAmountPaidNext] = useState('');

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
          const { contractCode, customer, services, financials } = res.data.data;
          setFormData({
            contractCode, customer, services,
            financials: {
              totalAmount: financials.totalAmount || 0,
              amountPaid: formatCurrencyInput((financials.amountPaid || 0).toString()),
              amountRemaining: financials.amountRemaining || 0,
              isFullyPaid: financials.isFullyPaid || false
            }
          });
        } else throw new Error();
      } catch {
        toast.error('Lỗi khi tải thông tin hợp đồng');
        navigate('/hop-dong');
      } finally {
        setLoading(false);
      }
    };

    const fetchPaymentHistory = async () => {
      try {
        const res = await CONTRACT_API.getPaymentHistory(id);
        if (res?.data?.success) setPaymentHistory(res.data.data);
        else throw new Error();
      } catch {
        toast.error('Lỗi khi tải lịch sử thanh toán');
      }
    };

    fetchContractData();
    fetchPaymentHistory();
  }, [id, isEdit, navigate]);

  useEffect(() => setAmountPaidNext(''), [paymentHistory]);

  const handleBack = () => navigate('/hop-dong');

  const calculatePaymentStatus = (total, paid, paidNext = 0, includePaidNext = false) => {
    const actualPaid = includePaidNext ? paid + paidNext : paid;
    const remaining = total - actualPaid;
    const isFullyPaid = actualPaid >= total;
    return { actualPaid, remaining, isFullyPaid };
  };

  const validateForm = () => {
    const { totalAmount, amountPaid } = formData.financials;
    const paid = parseCurrency(amountPaid || '0');
    const paidNext = parseCurrency(amountPaidNext || '0');
    const { actualPaid, remaining, isFullyPaid: expectedPaidStatus } = calculatePaymentStatus(totalAmount, paid, paidNext, true);

    const newErrors = {};
    if (totalAmount < 0) newErrors.totalAmount = 'Tổng tiền không được âm';
    if (paid < 0) newErrors.amountPaid = 'Số tiền đã thanh toán không được âm';
    if (paidNext < 0) newErrors.amountPaidNext = 'Số tiền thanh toán không được âm';
    if (actualPaid > totalAmount) newErrors.amountPaidNext = 'Tổng số tiền thanh toán không được lớn hơn tổng tiền hợp đồng';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'financials.amountPaid') {
      const formatted = formatCurrencyInput(value);
      const paid = parseCurrency(formatted);
      const total = formData.financials.totalAmount;
      const { remaining } = calculatePaymentStatus(total, paid);
      setFormData(prev => ({
        ...prev,
        financials: { ...prev.financials, amountPaid: formatted, amountRemaining: remaining }
      }));
    } else if (name === 'amountPaidNext') {
      const formatted = formatCurrencyInput(value);
      setAmountPaidNext(formatted);
      const paidNext = parseCurrency(formatted);
      const paid = parseCurrency(formData.financials.amountPaid || '0');
      const total = formData.financials.totalAmount;
      const { remaining } = calculatePaymentStatus(total, paid, paidNext, true);
      setFormData(prev => ({
        ...prev,
        financials: { ...prev.financials, amountRemaining: remaining }
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!canUpdate) return toast.error('Bạn không có quyền cập nhật hợp đồng');

    try {
      setLoading(true);
      let amountPaid = parseCurrency(formData.financials.amountPaid);
      const paidNext = parseCurrency(amountPaidNext || '0');
      if (paymentHistory.length > 0) amountPaid += paidNext;

      const { isFullyPaid } = calculatePaymentStatus(
        formData.financials.totalAmount,
        parseCurrency(formData.financials.amountPaid),
        paidNext,
        true
      );

      const res = await CONTRACT_API.update(id, { amountPaid, isFullyPaid });
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

  const paid = parseCurrency(formData.financials.amountPaid || '0');
  const paidNext = parseCurrency(amountPaidNext || '0');
  const calculatedStatus = calculatePaymentStatus(formData.financials.totalAmount, paid, paidNext, false);

  const renderPaymentStatus = () => {
    if (formData.financials.isFullyPaid) return { status: 'success', message: '✅ Đã thanh toán đầy đủ', desc: `${formatPrice(paid)} / ${formatPrice(formData.financials.totalAmount)}` };
    if (calculatedStatus.actualPaid > formData.financials.totalAmount) return { status: 'error', message: '❌ Lỗi: Số tiền vượt quá', desc: `Thanh toán ${formatPrice(calculatedStatus.actualPaid)} > ${formatPrice(formData.financials.totalAmount)}` };
    return { status: 'warning', message: '⚠️ Chưa thanh toán đủ', desc: `Còn nợ: ${formatPrice(calculatedStatus.remaining)}` };
  };

  const status = renderPaymentStatus();

  if (!canUpdate) return (
    <Box><BackHeader onBack={handleBack} />
      <Paper sx={{ p: 3 }}><Typography variant="h4" color="error">Bạn không có quyền cập nhật hợp đồng!</Typography></Paper>
    </Box>
  );

  if (loading) return <LoadingIndicator />;

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
                data={formData} errors={errors} onChange={handleChange}
                status={status} paymentHistory={paymentHistory} amountPaidNext={amountPaidNext}
              />
              <ContractServiceTable services={formData.services} theme={theme} loading={loading} />
              <PaymentHistoryTable paymentHistory={paymentHistory} theme={theme} />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="outlined" onClick={handleBack}>Hủy</Button>
                <Button type="submit" variant="contained" disabled={loading || formData.financials.isFullyPaid}>
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

const ContractFinancialInfo = ({ data, errors, onChange, status, paymentHistory, amountPaidNext }) => {
  const { totalAmount, amountPaid, amountRemaining, isFullyPaid } = data.financials;
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Thông tin tài chính</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}><TextField fullWidth label="Tổng tiền hợp đồng" value={formatPrice(totalAmount)} disabled /></Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth label="Số tiền đã thanh toán" name="financials.amountPaid"
            value={amountPaid} onChange={onChange} error={!!errors.amountPaid}
            helperText={errors.amountPaid || `Tối đa: ${formatPrice(totalAmount)}`}
            disabled={isFullyPaid || paymentHistory.length > 0}
          />
        </Grid>
        {paymentHistory.length > 0 && !isFullyPaid && (
          <Grid item xs={12}>
            <TextField
              fullWidth label="Số tiền còn lại để thanh toán" name="amountPaidNext"
              value={amountPaidNext} onChange={onChange} error={!!errors.amountPaidNext}
              helperText={errors.amountPaidNext || `Tối đa: ${formatPrice(totalAmount - parseCurrency(amountPaid || '0'))}`}
              disabled={isFullyPaid}
            />
          </Grid>
        )}
        {!isFullyPaid && (
          <Grid item xs={12}>
            <TextField
              fullWidth label="Số tiền còn lại" value={formatPrice(amountRemaining)} disabled
              sx={{ '& .MuiInputBase-input': {
                color: amountRemaining > 0 ? 'error.main' : 'success.main',
                fontWeight: 'bold' }}}
            />
          </Grid>
        )}
      </Grid>
      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="subtitle2">Trạng thái thanh toán:</Typography>
        <Typography variant="body2" color={`${status.status}.main`} fontWeight="bold">{status.message}</Typography>
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
              <TableCell key={col.id} sx={{ minWidth: col.minWidth, backgroundColor: theme.palette.primary.light }}>{col.label}</TableCell>
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
                      : row.serviceType === 'ssl'
                      ? row.serviceId.sslPlanId.name
                      : row.serviceType === 'email'
                      ? row.serviceId.emailPlanId.name
                      : row.serviceType === 'website'
                      ? row.serviceId.domainServiceId?.name || 'Website Service'
                      : row.serviceId.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  {formatDate(row.serviceType === 'website' 
                    ? row.serviceId.createdAt 
                    : row.serviceId.registeredAt)}
                </TableCell>
                <TableCell>
                  {formatDate(row.serviceType === 'website' 
                    ? row.serviceId.endDate || 'N/A'
                    : row.serviceId.expiredAt)}
                </TableCell>
                <TableCell>
                  {row.serviceType === 'website' 
                    ? 'N/A' 
                    : (row.serviceId.vatIncluded ? 'Có' : 'Không')}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);

const PaymentHistoryTable = ({ paymentHistory, theme }) => (
  paymentHistory.length > 0 && (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Lịch sử thanh toán</Typography>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: theme.palette.primary.light }}>Ngày thanh toán</TableCell>
              <TableCell sx={{ backgroundColor: theme.palette.primary.light }}>Số tiền</TableCell>
              <TableCell sx={{ backgroundColor: theme.palette.primary.light }}>Phương thức thanh toán</TableCell>
              <TableCell sx={{ backgroundColor: theme.palette.primary.light }}>Tạo bởi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paymentHistory.map((row) => (
              <TableRow hover key={row._id}>
                <TableCell>{formatDate(row.paymentDate)}</TableCell>
                <TableCell>{formatPrice(row.amount)}</TableCell>
                <TableCell>{row.method}</TableCell>
                <TableCell>{row.createdBy}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
);