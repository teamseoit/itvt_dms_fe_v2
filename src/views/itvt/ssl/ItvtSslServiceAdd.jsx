import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTheme } from '@mui/material/styles';
import {
  Box, Button, Typography, Paper, TextField,
  FormControl, InputLabel, Select, MenuItem, Switch
} from '@mui/material';
import { IconArrowLeft } from '@tabler/icons-react';

import SSL_SERVICE_API from '../../../services/itvt/sslService';
import SSL_PLAN_API from '../../../services/plans/sslPlanService';
import SERVER_PLAN_API from '../../../services/plans/serverPlanService';
import DOMAIN_SERVICE_API from '../../../services/itvt/domainService';
import usePermissions from '../../../hooks/usePermissions';
import { PERMISSIONS } from '../../../constants/permissions';
import CustomerAutocomplete from '../../../components/CustomerAutocomplete';

import { formatCurrencyInput, parseCurrency, phoneNumber } from '../../../utils/formatConstants';

export default function ItvtSslServiceAdd() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [sslPlans, setSslPlans] = useState([]);
  const [serverPlans, setServerPlans] = useState([]);
  const [domainServices, setDomainServices] = useState([]);
  const [originalServerPlanId, setOriginalServerPlanId] = useState('');
  const [formData, setFormData] = useState({
    domainServiceId: '',
    periodValue: '',
    periodUnit: 'năm',
    customerId: '',
    sslPlanId: '',
    serverPlanId: '',
    vatIncluded: false,
    totalPrice: '',
    registeredAt: '',
    expiredAt: '',
    pingCloudflare: false,
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

  const fetchServerPlans = async () => {
    try {
      const response = await SERVER_PLAN_API.getAll({ limit: 1000 });
      if (response.data.success) {
        setServerPlans(response.data.data || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách gói server');
    }
  };

  const fetchDomainServices = async () => {
    try {
      const response = await DOMAIN_SERVICE_API.getAll({ limit: 1000 });
      if (response.data.success) {
        setDomainServices(response.data.data || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách dịch vụ domain ITVT');
    }
  };

  const fetchSslService = async () => {
    try {
      const response = await SSL_SERVICE_API.getById(id);
      if (response.data.success) {
        const sslServiceData = response.data.data;
        
        let serverPlanValue = '';
        if (sslServiceData.serverPlanId) {
          const serverPlanId = sslServiceData.serverPlanId?._id || sslServiceData.serverPlanId;
          setOriginalServerPlanId(serverPlanId);
          serverPlanValue = serverPlanId;
        }
        
        setFormData({
          domainServiceId: sslServiceData.domainServiceId?._id || sslServiceData.domainServiceId || '',
          periodValue: sslServiceData.periodValue?.toString() || '',
          periodUnit: sslServiceData.periodUnit || 'năm',
          customerId: sslServiceData.customerId?._id || sslServiceData.customerId || '',
          sslPlanId: sslServiceData.sslPlanId?._id || sslServiceData.sslPlanId || '',
          serverPlanId: serverPlanValue,
          vatIncluded: sslServiceData.vatIncluded ?? false,
          registeredAt: sslServiceData.registeredAt ? new Date(sslServiceData.registeredAt).toISOString().split('T')[0] : '',
          expiredAt: sslServiceData.expiredAt ? new Date(sslServiceData.expiredAt).toISOString().split('T')[0] : '',
          pingCloudflare: sslServiceData.pingCloudflare ?? false,
          status: sslServiceData.status ?? 1
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy thông tin dịch vụ SSL ITVT');
      navigate('/itvt/ssl');
    }
  };

  useEffect(() => {
    fetchSslPlans();
    fetchServerPlans();
    fetchDomainServices();
    if (isEdit) {
      fetchSslService();
    }
  }, [id]);

  useEffect(() => {
    if (isEdit && serverPlans.length > 0 && originalServerPlanId && !formData.serverPlanId.includes(':')) {
      const serverPlan = serverPlans.find(plan => plan._id === originalServerPlanId);
      if (serverPlan && serverPlan.ipAddress.length > 0) {
        setFormData(prev => ({
          ...prev,
          serverPlanId: `${serverPlan._id}:${serverPlan.ipAddress[0]}`
        }));
      }
    }
  }, [serverPlans, isEdit, originalServerPlanId]);

  const validateForm = () => {
    if (!formData.domainServiceId) {
      toast.error('Vui lòng chọn tên miền');
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

    if (isEdit && !hasPermission(PERMISSIONS.SSL_SERVICE_ITVT.UPDATE)) {
      toast.error('Bạn không có quyền cập nhật dịch vụ SSL ITVT');
      return;
    }

    if (!isEdit && !hasPermission(PERMISSIONS.SSL_SERVICE_ITVT.ADD)) {
      toast.error('Bạn không có quyền thêm dịch vụ SSL ITVT mới');
      return;
    }

    try {
      setLoading(true);
      
      const serverPlanId = formData.serverPlanId.includes(':') 
        ? formData.serverPlanId.split(':')[0] 
        : formData.serverPlanId;

      const sslServiceData = {
        domainServiceId: formData.domainServiceId,
        periodValue: parseInt(formData.periodValue),
        periodUnit: formData.periodUnit,
        customerId: formData.customerId,
        sslPlanId: formData.sslPlanId || null,
        serverPlanId: serverPlanId || null,
        vatIncluded: formData.vatIncluded,
        registeredAt: formData.registeredAt ? new Date(formData.registeredAt) : null,
        expiredAt: formData.expiredAt ? new Date(formData.expiredAt) : null,
        pingCloudflare: formData.pingCloudflare,
        status: parseInt(formData.status)
      };

      const response = isEdit
        ? await SSL_SERVICE_API.update(id, sslServiceData)
        : await SSL_SERVICE_API.create(sslServiceData);

      if (response?.data?.success) {
        toast.success(isEdit ? 'Cập nhật dịch vụ SSL ITVT thành công' : 'Thêm dịch vụ SSL ITVT thành công');
        navigate('/itvt/ssl');
      } else {
        toast.error(response?.data?.message || `Có lỗi xảy ra khi ${isEdit ? 'cập nhật' : 'thêm'} dịch vụ SSL ITVT`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || `Có lỗi xảy ra khi ${isEdit ? 'cập nhật' : 'thêm'} dịch vụ SSL ITVT`);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/itvt/ssl');
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
        <Typography variant="h3">{isEdit ? 'Cập nhật dịch vụ SSL ITVT' : 'Thêm dịch vụ SSL ITVT mới'}</Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="domain-service-label">Tên miền (*)</InputLabel>
            <Select
              labelId="domain-service-label"
              name="domainServiceId"
              value={formData.domainServiceId}
              onChange={handleChange}
              label="Tên miền (*)"
              disabled={isEdit}
            >
              {domainServices.map((domainService) => (
                <MenuItem key={domainService._id} value={domainService._id}>
                  {domainService.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
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
            disabled={isEdit}
          />

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="ssl-plan-label">Gói SSL</InputLabel>
            <Select
              labelId="ssl-plan-label"
              name="sslPlanId"
              value={formData.sslPlanId}
              onChange={handleChange}
              label="Gói SSL"
              disabled={isEdit}
            >
              {sslPlans.map((plan) => (
                <MenuItem key={plan._id} value={plan._id}>
                  {plan.name} - {plan.supplierId.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="server-plan-label">Địa chỉ IP</InputLabel>
            <Select
              labelId="server-plan-label"
              name="serverPlanId"
              value={formData.serverPlanId}
              onChange={handleChange}
              label="Địa chỉ IP"
            >
              {serverPlans.map((plan) => 
                plan.ipAddress.map((ip, index) => (
                  <MenuItem key={`${plan._id}-${index}`} value={`${plan._id}:${ip}`}>
                    {ip} - {plan.name}
                  </MenuItem>
                ))
              )}
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

          <FormControl sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mb: 3 }}>
            <Typography component="span" sx={{ mr: 2 }}>
              Ping Cloudflare
            </Typography>
            <Switch
              name="pingCloudflare"
              checked={formData.pingCloudflare}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  pingCloudflare: e.target.checked
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
