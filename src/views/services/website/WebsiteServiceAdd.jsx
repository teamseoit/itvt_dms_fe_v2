import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTheme } from '@mui/material/styles';
import {
  Box, Button, Typography, Paper, TextField,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { IconArrowLeft } from '@tabler/icons-react';

import WEBSITE_SERVICE_API from '../../../services/websiteService';
import CUSTOMER_API from '../../../services/customerService';
import DOMAIN_SERVICE_API from '../../../services/domainService';
import usePermissions from '../../../hooks/usePermissions';
import { PERMISSIONS } from '../../../constants/permissions';

import { formatCurrencyInput, parseCurrency } from '../../../utils/formatConstants';

export default function WebsiteServiceAdd() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [domainServices, setDomainServices] = useState([]);
  const [formData, setFormData] = useState({
    domainServiceId: '',
    price: '',
    customerId: '',
    status: 1
  });

  const { hasPermission } = usePermissions();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

  const fetchDomainServices = async () => {
    try {
      const response = await DOMAIN_SERVICE_API.getAll({ limit: 1000 });
      if (response.data.success) {
        setDomainServices(response.data.data || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách dịch vụ tên miền');
    }
  };

  const fetchWebsiteService = async () => {
    try {
      const response = await WEBSITE_SERVICE_API.getById(id);
      if (response.data.success) {
        const websiteServiceData = response.data.data;
        
        setFormData({
          domainServiceId: websiteServiceData.domainServiceId?._id || websiteServiceData.domainServiceId || '',
          price: websiteServiceData.price ? formatCurrencyInput(websiteServiceData.price.toString()) : '',
          customerId: websiteServiceData.customerId?._id || websiteServiceData.customerId || '',
          status: websiteServiceData.status || 1
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy thông tin dịch vụ website');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!hasPermission(isEdit ? PERMISSIONS.WEBSITE_SERVICE.UPDATE : PERMISSIONS.WEBSITE_SERVICE.ADD)) {
      toast.error('Bạn không có quyền thực hiện thao tác này');
      return;
    }

    try {
      setLoading(true);
      
      const submitData = {
        ...formData,
        price: parseCurrency(formData.price)
      };

      let response;
      if (isEdit) {
        response = await WEBSITE_SERVICE_API.update(id, submitData);
      } else {
        response = await WEBSITE_SERVICE_API.create(submitData);
      }

      if (response.data.success) {
        toast.success(isEdit ? 'Cập nhật dịch vụ website thành công' : 'Thêm dịch vụ website thành công');
        navigate('/dich-vu/thiet-ke-website');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Có lỗi xảy ra khi ${isEdit ? 'cập nhật' : 'thêm'} dịch vụ website`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchDomainServices();
    if (isEdit) {
      fetchWebsiteService();
    }
  }, [isEdit, id]);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<IconArrowLeft />}
          onClick={() => navigate('/dich-vu/thiet-ke-website')}
          sx={{ mr: 2 }}
        >
          Quay lại
        </Button>
        <Typography variant="h3">
          {isEdit ? 'Cập nhật dịch vụ website' : 'Thêm dịch vụ website'}
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
            <FormControl fullWidth required>
              <InputLabel>Chọn tên miền</InputLabel>
              <Select
                name="domainServiceId"
                value={formData.domainServiceId}
                onChange={handleChange}
                label="Chọn tên miền"
              >
                {domainServices.map((domainService) => (
                  <MenuItem key={domainService._id} value={domainService._id}>
                    {domainService.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Khách hàng</InputLabel>
              <Select
                name="customerId"
                value={formData.customerId}
                onChange={handleChange}
                label="Khách hàng"
              >
                {customers.map((customer) => (
                  <MenuItem key={customer._id} value={customer._id}>
                    {customer.fullName} - {customer.phoneNumber}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              name="price"
              label="Giá"
              value={formData.price}
              onChange={(e) => {
                const formatted = formatCurrencyInput(e.target.value);
                setFormData(prev => ({ ...prev, price: formatted }));
              }}
              required
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                label="Trạng thái"
              >
                <MenuItem value={1}>Đang hoạt động</MenuItem>
                <MenuItem value={2}>Đã đóng</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/dich-vu/thiet-ke-website')}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ backgroundColor: theme.palette.primary.main }}
            >
              {loading ? 'Đang xử lý...' : (isEdit ? 'Cập nhật' : 'Thêm mới')}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
