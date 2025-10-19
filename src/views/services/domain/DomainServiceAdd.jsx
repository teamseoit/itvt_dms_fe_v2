import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTheme } from '@mui/material/styles';
import {
  Box, Button, Typography, Paper, TextField,
  FormControl, InputLabel, Select, MenuItem, Switch
} from '@mui/material';
import { IconArrowLeft } from '@tabler/icons-react';

import DOMAIN_SERVICE_API from '../../../services/services/domainService';
import DOMAIN_PLAN_API from '../../../services/plans/domainPlanService';
import SERVER_PLAN_API from '../../../services/plans/serverPlanService';
import usePermissions from '../../../hooks/usePermissions';
import { PERMISSIONS } from '../../../constants/permissions';
import CustomerAutocomplete from '../../../components/CustomerAutocomplete';

import { formatCurrencyInput, parseCurrency, phoneNumber } from '../../../utils/formatConstants';

export default function DomainServiceAdd() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [domainPlans, setDomainPlans] = useState([]);
  const [serverPlans, setServerPlans] = useState([]);
  const [originalServerPlanId, setOriginalServerPlanId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    periodValue: '',
    periodUnit: 'năm',
    customerId: '',
    domainPlanId: '',
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


  const fetchDomainPlans = async () => {
    try {
      const response = await DOMAIN_PLAN_API.getAll({ limit: 1000 });
      if (response.data.success) {
        setDomainPlans(response.data.data || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách gói domain');
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

  const fetchDomainService = async () => {
    try {
      const response = await DOMAIN_SERVICE_API.getById(id);
      if (response.data.success) {
        const domainServiceData = response.data.data;
        
        let serverPlanValue = '';
        if (domainServiceData.serverPlanId) {
          const serverPlanId = domainServiceData.serverPlanId?._id || domainServiceData.serverPlanId;
          setOriginalServerPlanId(serverPlanId);
          serverPlanValue = serverPlanId;
        }
        
        const customerId = domainServiceData.customerId?._id || domainServiceData.customerId || '';
        setFormData({
          name: domainServiceData.name || '',
          periodValue: domainServiceData.periodValue?.toString() || '',
          periodUnit: domainServiceData.periodUnit || 'năm',
          customerId: customerId,
          domainPlanId: domainServiceData.domainPlanId?._id || domainServiceData.domainPlanId || '',
          serverPlanId: serverPlanValue,
          vatIncluded: domainServiceData.vatIncluded ?? false,
          registeredAt: domainServiceData.registeredAt ? new Date(domainServiceData.registeredAt).toISOString().split('T')[0] : '',
          expiredAt: domainServiceData.expiredAt ? new Date(domainServiceData.expiredAt).toISOString().split('T')[0] : '',
          pingCloudflare: domainServiceData.pingCloudflare ?? false,
          status: domainServiceData.status ?? 1
        });
        
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy thông tin dịch vụ domain');
      navigate('/dich-vu/domain');
    }
  };

  useEffect(() => {
    fetchDomainPlans();
    fetchServerPlans();
    if (isEdit) {
      fetchDomainService();
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
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên dịch vụ');
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

    if (isEdit && !hasPermission(PERMISSIONS.DOMAIN_SERVICE.UPDATE)) {
      toast.error('Bạn không có quyền cập nhật dịch vụ tên miền');
      return;
    }

    if (!isEdit && !hasPermission(PERMISSIONS.DOMAIN_SERVICE.ADD)) {
      toast.error('Bạn không có quyền thêm dịch vụ tên miền mới');
      return;
    }

    try {
      setLoading(true);
      
      const serverPlanId = formData.serverPlanId.includes(':') 
        ? formData.serverPlanId.split(':')[0] 
        : formData.serverPlanId;

      const domainServiceData = {
        name: formData.name,
        periodValue: parseInt(formData.periodValue),
        periodUnit: formData.periodUnit,
        customerId: formData.customerId,
        domainPlanId: formData.domainPlanId || null,
        serverPlanId: serverPlanId || null,
        vatIncluded: formData.vatIncluded,
        registeredAt: formData.registeredAt ? new Date(formData.registeredAt) : null,
        expiredAt: formData.expiredAt ? new Date(formData.expiredAt) : null,
        pingCloudflare: formData.pingCloudflare,
        status: parseInt(formData.status)
      };

      const response = isEdit
        ? await DOMAIN_SERVICE_API.update(id, domainServiceData)
        : await DOMAIN_SERVICE_API.create(domainServiceData);

      if (response?.data?.success) {
        toast.success(isEdit ? 'Cập nhật dịch vụ tên miền thành công' : 'Thêm dịch vụ tên miền thành công');
        navigate('/dich-vu/ten-mien');
      } else {
        toast.error(response?.data?.message || `Có lỗi xảy ra khi ${isEdit ? 'cập nhật' : 'thêm'} dịch vụ tên miền`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || `Có lỗi xảy ra khi ${isEdit ? 'cập nhật' : 'thêm'} dịch vụ tên miền`);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dich-vu/ten-mien');
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
        <Typography variant="h3">{isEdit ? 'Cập nhật dịch vụ tên miền' : 'Thêm dịch vụ tên miền mới'}</Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Tên miền (*)"
            name="name"
            value={formData.name}
            onChange={handleChange}
            sx={{ mb: 3 }}
            disabled={isEdit}
          />
          
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
            <InputLabel id="domain-plan-label">Gói tên miền</InputLabel>
            <Select
              labelId="domain-plan-label"
              name="domainPlanId"
              value={formData.domainPlanId}
              onChange={handleChange}
              label="Gói tên miền"
              disabled={isEdit}
            >
              {domainPlans.map((plan) => (
                <MenuItem key={plan._id} value={plan._id}>
                  {plan.extension} - {plan.supplierId.name}
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