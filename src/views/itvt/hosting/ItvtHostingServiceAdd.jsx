import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTheme } from '@mui/material/styles';
import {
  Box, Button, Typography, Paper, TextField,
  FormControl, InputLabel, Select, MenuItem, Switch
} from '@mui/material';
import { IconArrowLeft } from '@tabler/icons-react';

import HOSTING_SERVICE_API from '../../../services/itvt/hostingService';
import CUSTOMER_API from '../../../services/customerService';
import HOSTING_PLAN_API from '../../../services/plans/hostingPlanService';
import SERVER_PLAN_API from '../../../services/plans/serverPlanService';
import DOMAIN_SERVICE_API from '../../../services/itvt/domainService';
import usePermissions from '../../../hooks/usePermissions';
import { PERMISSIONS } from '../../../constants/permissions';

import { formatCurrencyInput, parseCurrency } from '../../../utils/formatConstants';

export default function ItvtHostingServiceAdd() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [hostingPlans, setHostingPlans] = useState([]);
  const [serverPlans, setServerPlans] = useState([]);
  const [domainServices, setDomainServices] = useState([]);
  const [originalServerPlanId, setOriginalServerPlanId] = useState('');
  const [formData, setFormData] = useState({
    domainServiceId: '',
    periodValue: '',
    periodUnit: 'năm',
    customerId: '',
    hostingPlanId: '',
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

  const fetchHostingPlans = async () => {
    try {
      const response = await HOSTING_PLAN_API.getAll({ limit: 1000 });
      if (response.data.success) {
        setHostingPlans(response.data.data || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách gói hosting');
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

  const fetchHostingService = async () => {
    try {
      const response = await HOSTING_SERVICE_API.getById(id);
      if (response.data.success) {
        const hostingServiceData = response.data.data;
        
        let serverPlanValue = '';
        if (hostingServiceData.serverPlanId) {
          const serverPlanId = hostingServiceData.serverPlanId?._id || hostingServiceData.serverPlanId;
          setOriginalServerPlanId(serverPlanId);
          serverPlanValue = serverPlanId;
        }
        
        setFormData({
          domainServiceId: hostingServiceData.domainServiceId?._id || hostingServiceData.domainServiceId || '',
          periodValue: hostingServiceData.periodValue?.toString() || '',
          periodUnit: hostingServiceData.periodUnit || 'năm',
          customerId: hostingServiceData.customerId?._id || hostingServiceData.customerId || '',
          hostingPlanId: hostingServiceData.hostingPlanId?._id || hostingServiceData.hostingPlanId || '',
          serverPlanId: serverPlanValue,
          vatIncluded: hostingServiceData.vatIncluded ?? false,
          registeredAt: hostingServiceData.registeredAt ? new Date(hostingServiceData.registeredAt).toISOString().split('T')[0] : '',
          expiredAt: hostingServiceData.expiredAt ? new Date(hostingServiceData.expiredAt).toISOString().split('T')[0] : '',
          pingCloudflare: hostingServiceData.pingCloudflare ?? false,
          status: hostingServiceData.status ?? 1
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy thông tin dịch vụ hosting ITVT');
      navigate('/itvt/hosting');
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchHostingPlans();
    fetchServerPlans();
    fetchDomainServices();
    if (isEdit) {
      fetchHostingService();
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

    if (isEdit && !hasPermission(PERMISSIONS.HOSTING_SERVICE_ITVT.UPDATE)) {
      toast.error('Bạn không có quyền cập nhật dịch vụ hosting ITVT');
      return;
    }

    if (!isEdit && !hasPermission(PERMISSIONS.HOSTING_SERVICE_ITVT.ADD)) {
      toast.error('Bạn không có quyền thêm dịch vụ hosting ITVT mới');
      return;
    }

    try {
      setLoading(true);
      
      const serverPlanId = formData.serverPlanId.includes(':') 
        ? formData.serverPlanId.split(':')[0] 
        : formData.serverPlanId;

      const hostingServiceData = {
        domainServiceId: formData.domainServiceId,
        periodValue: parseInt(formData.periodValue),
        periodUnit: formData.periodUnit,
        customerId: formData.customerId,
        hostingPlanId: formData.hostingPlanId || null,
        serverPlanId: serverPlanId || null,
        vatIncluded: formData.vatIncluded,
        registeredAt: formData.registeredAt ? new Date(formData.registeredAt) : null,
        expiredAt: formData.expiredAt ? new Date(formData.expiredAt) : null,
        pingCloudflare: formData.pingCloudflare,
        status: parseInt(formData.status)
      };

      const response = isEdit
        ? await HOSTING_SERVICE_API.update(id, hostingServiceData)
        : await HOSTING_SERVICE_API.create(hostingServiceData);

      if (response?.data?.success) {
        toast.success(isEdit ? 'Cập nhật dịch vụ hosting ITVT thành công' : 'Thêm dịch vụ hosting ITVT thành công');
        navigate('/itvt/hosting');
      } else {
        toast.error(response?.data?.message || `Có lỗi xảy ra khi ${isEdit ? 'cập nhật' : 'thêm'} dịch vụ hosting ITVT`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || `Có lỗi xảy ra khi ${isEdit ? 'cập nhật' : 'thêm'} dịch vụ hosting ITVT`);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/itvt/hosting');
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
        <Typography variant="h3">{isEdit ? 'Cập nhật dịch vụ hosting ITVT' : 'Thêm dịch vụ hosting ITVT mới'}</Typography>
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
                  {customer.fullName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="hosting-plan-label">Gói hosting</InputLabel>
            <Select
              labelId="hosting-plan-label"
              name="hostingPlanId"
              value={formData.hostingPlanId}
              onChange={handleChange}
              label="Gói hosting"
              disabled={isEdit}
            >
              {hostingPlans.map((plan) => (
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
