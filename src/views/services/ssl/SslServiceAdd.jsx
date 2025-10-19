import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTheme } from '@mui/material/styles';
import {
  Box, Button, Typography, Paper, TextField,
  FormControl, InputLabel, Select, MenuItem, Switch
} from '@mui/material';
import { IconArrowLeft } from '@tabler/icons-react';

import SSL_SERVICE_API from '../../../services/services/sslService';
import SSL_PLAN_API from '../../../services/plans/sslPlanService';
import DOMAIN_SERVICE_API from '../../../services/services/domainService';
import usePermissions from '../../../hooks/usePermissions';
import { PERMISSIONS } from '../../../constants/permissions';
import CustomerAutocomplete from '../../../components/CustomerAutocomplete';

import { phoneNumber } from '../../../utils/formatConstants';

export default function SslServiceAdd() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [sslPlans, setSslPlans] = useState([]);
  const [domainServices, setDomainServices] = useState([]);
  const [formData, setFormData] = useState({
    domainServiceId: '',
    sslPlanId: '',
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


  const fetchSslPlans = async () => {
    try {
      const response = await SSL_PLAN_API.getAll({ limit: 1000 });
      if (response.data.success) {
        setSslPlans(response.data.data || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách gói SSL');
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

  const fetchSslService = async () => {
    try {
      const response = await SSL_SERVICE_API.getById(id);
      if (response.data.success) {
        const sslServiceData = response.data.data;
        
        setFormData({
          domainServiceId: sslServiceData.domainServiceId?._id || sslServiceData.domainServiceId || '',
          sslPlanId: sslServiceData.sslPlanId?._id || sslServiceData.sslPlanId || '',
          customerId: sslServiceData.customerId?._id || sslServiceData.customerId || '',
          periodValue: sslServiceData.periodValue?.toString() || '',
          periodUnit: sslServiceData.periodUnit || 'năm',
          status: sslServiceData.status || 1,
          registeredAt: sslServiceData.registeredAt ? new Date(sslServiceData.registeredAt).toISOString().split('T')[0] : '',
          expiredAt: sslServiceData.expiredAt ? new Date(sslServiceData.expiredAt).toISOString().split('T')[0] : '',
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy thông tin dịch vụ SSL');
      navigate('/dich-vu/ssl');
    }
  };

  useEffect(() => {
    fetchSslPlans();
    fetchDomainServices();
    if (isEdit) {
      fetchSslService();
    }
  }, [id]);

  const validateForm = () => {
    if (!formData.domainServiceId) {
      toast.error('Vui lòng chọn tên miền');
      return false;
    }

    if (!formData.sslPlanId) {
      toast.error('Vui lòng chọn gói SSL');
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

    if (isEdit && !hasPermission(PERMISSIONS.SSL_SERVICE.UPDATE)) {
      toast.error('Bạn không có quyền cập nhật dịch vụ SSL');
      return;
    }

    if (!isEdit && !hasPermission(PERMISSIONS.SSL_SERVICE.ADD)) {
      toast.error('Bạn không có quyền thêm dịch vụ SSL mới');
      return;
    }

    try {
      setLoading(true);

      const sslServiceData = {
        domainServiceId: formData.domainServiceId,
        sslPlanId: formData.sslPlanId,
        customerId: formData.customerId,
        periodValue: parseInt(formData.periodValue),
        periodUnit: formData.periodUnit,
        vatIncluded: formData.vatIncluded,
        registeredAt: formData.registeredAt ? new Date(formData.registeredAt) : null,
        expiredAt: formData.expiredAt ? new Date(formData.expiredAt) : null,
        status: parseInt(formData.status)
      };

      const response = isEdit
        ? await SSL_SERVICE_API.update(id, sslServiceData)
        : await SSL_SERVICE_API.create(sslServiceData);

      if (response?.data?.success) {
        toast.success(isEdit ? 'Cập nhật dịch vụ SSL thành công' : 'Thêm dịch vụ SSL thành công');
        navigate('/dich-vu/ssl');
      } else {
        toast.error(response?.data?.message || `Có lỗi xảy ra khi ${isEdit ? 'cập nhật' : 'thêm'} dịch vụ SSL`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || `Có lỗi xảy ra khi ${isEdit ? 'cập nhật' : 'thêm'} dịch vụ SSL`);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dich-vu/ssl');
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
        <Typography variant="h3">{isEdit ? 'Cập nhật dịch vụ SSL' : 'Thêm dịch vụ SSL mới'}</Typography>
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
              <InputLabel id="ssl-plan-label">Gói SSL</InputLabel>
              <Select
                labelId="ssl-plan-label"
                name="sslPlanId"
                value={formData.sslPlanId}
                onChange={handleChange}
                label="Gói SSL"
              >
                {sslPlans.map((plan) => (
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

          <CustomerAutocomplete
            value={formData.customerId}
            onChange={(customerId) => {
              setFormData(prev => ({
                ...prev,
                customerId: customerId
              }));
            }}
          />
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