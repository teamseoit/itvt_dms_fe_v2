import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTheme } from '@mui/material/styles';
import {
  Box, Button, Typography, Paper, TextField,
  FormControl, InputLabel, Select, MenuItem, Switch
} from '@mui/material';
import { IconArrowLeft } from '@tabler/icons-react';

import EMAIL_SERVICE_API from '../../../services/services/emailService';
import CUSTOMER_API from '../../../services/customerService';
import EMAIL_PLAN_API from '../../../services/plans/emailPlanService';
import DOMAIN_SERVICE_API from '../../../services/services/domainService';
import usePermissions from '../../../hooks/usePermissions';
import { PERMISSIONS } from '../../../constants/permissions';

import { phoneNumber } from '../../../utils/formatConstants';

export default function EmailServiceAdd() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [emailPlans, setEmailPlans] = useState([]);
  const [domainServices, setDomainServices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    domainServiceId: '',
    emailPlanId: '',
    customerId: '',
    periodValue: '',
    periodUnit: 'năm',
    vatIncluded: false,
    registeredAt: '',
    expiredAt: '',
    status: 1
  });

  const { hasPermission } = usePermissions();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const fetchCustomers = async () => {
    try {
      const response = await CUSTOMER_API.getAll({ limit: 1000 });
      if (response.data.success) {
        setCustomers(response.data.data || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách khách hàng');
    }
  };

  const fetchEmailPlans = async () => {
    try {
      const response = await EMAIL_PLAN_API.getAll({ limit: 1000 });
      if (response.data.success) {
        setEmailPlans(response.data.data || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách gói Email');
    }
  };

  const fetchDomainServices = async () => {
    try {
      const response = await DOMAIN_SERVICE_API.getAll({ limit: 1000 });
      if (response.data.success) {
        setDomainServices(response.data.data || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách dịch vụ domain');
    }
  };

  const fetchEmailService = async () => {
    try {
      const response = await EMAIL_SERVICE_API.getById(id);
      if (response.data.success) {
        const emailServiceData = response.data.data;
        
        setFormData({
          domainServiceId: emailServiceData.domainServiceId?._id || emailServiceData.domainServiceId || '',
          emailPlanId: emailServiceData.emailPlanId?._id || emailServiceData.emailPlanId || '',
          customerId: emailServiceData.customerId?._id || emailServiceData.customerId || '',
          periodValue: emailServiceData.periodValue?.toString() || '',
          periodUnit: emailServiceData.periodUnit || 'năm',
          status: emailServiceData.status || 1,
          registeredAt: emailServiceData.registeredAt ? new Date(emailServiceData.registeredAt).toISOString().split('T')[0] : '',
          expiredAt: emailServiceData.expiredAt ? new Date(emailServiceData.expiredAt).toISOString().split('T')[0] : '',
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy thông tin dịch vụ Email');
      navigate('/dich-vu/email');
    }
  };

  useEffect(() => {
    fetchEmailPlans();
    fetchCustomers();
    fetchDomainServices();
    if (isEdit) {
      fetchEmailService();
    }
  }, [id]);

  const validateForm = () => {
    if (!formData.domainServiceId) {
      toast.error('Vui lòng chọn tên miền');
      return false;
    }

    if (!formData.emailPlanId) {
      toast.error('Vui lòng chọn gói Email');
      return false;
    }

    if (!formData.periodValue || formData.periodValue <= 0) {
      toast.error('Vui lòng nhập giá trị hợp lệ');
      return false;
    }

    if (!formData.customerId) {
      toast.error('Vui lòng chọn khách hàng');
      return false;
    }

    if (!formData.registeredAt) {
      toast.error('Vui lòng chọn hoặc nhập ngày đăng ký');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isEdit && !hasPermission(PERMISSIONS.EMAIL_SERVICE.UPDATE)) {
      toast.error('Bạn không có quyền cập nhật dịch vụ Email');
      return;
    }

    if (!isEdit && !hasPermission(PERMISSIONS.EMAIL_SERVICE.ADD)) {
      toast.error('Bạn không có quyền thêm dịch vụ Email mới');
      return;
    }

    try {
      setLoading(true);

      const emailServiceData = {
        domainServiceId: formData.domainServiceId,
        emailPlanId: formData.emailPlanId,
        customerId: formData.customerId,
        periodValue: parseInt(formData.periodValue),
        periodUnit: formData.periodUnit,
        vatIncluded: formData.vatIncluded,
        registeredAt: formData.registeredAt ? new Date(formData.registeredAt) : null,
        expiredAt: formData.expiredAt ? new Date(formData.expiredAt) : null,
        status: parseInt(formData.status)
      };

      const response = isEdit
        ? await EMAIL_SERVICE_API.update(id, emailServiceData)
        : await EMAIL_SERVICE_API.create(emailServiceData);

      if (response?.data?.success) {
        toast.success(isEdit ? 'Cập nhật dịch vụ Email thành công' : 'Thêm dịch vụ Email thành công');
        navigate('/dich-vu/email');
      } else {
        toast.error(response?.data?.message || `Có lỗi xảy ra khi ${isEdit ? 'cập nhật' : 'thêm'} dịch vụ Email`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || `Có lỗi xảy ra khi ${isEdit ? 'cập nhật' : 'thêm'} dịch vụ Email`);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dich-vu/email');
  };

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
        <Typography variant="h3">{isEdit ? 'Cập nhật dịch vụ Email' : 'Thêm dịch vụ Email mới'}</Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel id="domain-service-label">Tên miền</InputLabel>
              <Select
                labelId="domain-service-label"
                name="domainServiceId"
                value={formData.domainServiceId}
                onChange={handleChange}
                label="Tên miền"
                disabled={isEdit}
              >
                {domainServices.map((domainService) => (
                  <MenuItem key={domainService._id} value={domainService._id}>
                    {domainService.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="email-plan-label">Gói Email</InputLabel>
              <Select
                labelId="email-plan-label"
                name="emailPlanId"
                value={formData.emailPlanId}
                onChange={handleChange}
                label="Gói Email"
              >
                {emailPlans.map((plan) => (
                  <MenuItem key={plan._id} value={plan._id}>
                    {plan.name} - {plan.supplierId.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              label="Thời hạn (*)"
              name="periodValue"
              type="number"
              value={formData.periodValue}
              onChange={handleChange}
              inputProps={{ min: 1 }}
            />
            <FormControl fullWidth>
              <InputLabel id="period-unit-label">Đơn vị</InputLabel>
              <Select
                labelId="period-unit-label"
                name="periodUnit"
                value={formData.periodUnit}
                onChange={handleChange}
                label="Đơn vị"
                disabled
              >
                <MenuItem value="năm">Năm</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="customer-label">Khách hàng (*)</InputLabel>
            <Select
              labelId="customer-label"
              name="customerId"
              value={formData.customerId}
              onChange={handleChange}
              label="Khách hàng (*)"
            >
              {customers.map((customer) => (
                <MenuItem key={customer._id} value={customer._id}>
                  {customer.fullName} / {phoneNumber(customer.phoneNumber)} / {customer.email} / {customer.address}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              label="Ngày đăng ký"
              name="registeredAt"
              type="date"
              value={formData.registeredAt}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              disabled={isEdit}
            />
            {isEdit && <TextField
              fullWidth
              label="Ngày hết hạn"
              name="expiredAt"
              type="date"
              value={formData.expiredAt}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />}
          </Box>

          {isEdit && <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="status-label">Trạng thái</InputLabel>
            <Select
              labelId="status-label"
              name="status"
              value={formData.status}
              onChange={handleChange}
              label="Trạng thái"
              disabled={isEdit}
            >
              <MenuItem value={1}>Hoạt động</MenuItem>
              <MenuItem value={2}>Sắp hết hạn</MenuItem>
              <MenuItem value={3}>Hết hạn</MenuItem>
            </Select>
          </FormControl>}

          <FormControl sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mb: 3 }}>
            <Typography component="span" sx={{ mr: 2 }}>
              Bao gồm VAT
            </Typography>
            <Switch
              name="vatIncluded"
              checked={formData.vatIncluded}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  vatIncluded: e.target.checked
                }))
              }
            />
          </FormControl>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {isEdit ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
} 