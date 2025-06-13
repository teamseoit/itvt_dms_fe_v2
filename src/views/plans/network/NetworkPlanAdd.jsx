import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTheme } from '@mui/material/styles';
import {
  Box, Button, Typography, Paper, TextField,
  FormControl, InputLabel, Select, MenuItem, Switch
} from '@mui/material';
import { IconArrowLeft } from '@tabler/icons-react';

import NETWORK_PLAN_API from '../../../services/plans/networkPlanService';
import NETWORK_SUPPLIER_API from '../../../services/networkSupplierService';
import usePermissions from '../../../hooks/usePermissions';
import { PERMISSIONS } from '../../../constants/permissions';

import { formatCurrencyInput, parseCurrency } from '../../../utils/formatConstants';

export default function NetworkPlanAdd() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [networkSupplier, setNetworkSupplier] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    dataCapacityInGB: '',
    purchasePrice: '',
    retailPrice: '',
    validityInDays: '',
    esimSupported: false,
    description: '',
    supplier: ''
  });

  const { hasPermission } = usePermissions();

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    const formattedValue = formatCurrencyInput(value);
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const fetchNetworkSupplier = async () => {
    try {
      const response = await NETWORK_SUPPLIER_API.getAll({ limit: 1000 });
      if (response.data.success) {
        setNetworkSupplier(response.data.data || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách nhà cung cấp');
    }
  };

  const fetchNetworkPlan = async () => {
    try {
      const response = await NETWORK_PLAN_API.getById(id);
      if (response.data.success) {
        const networkPlanData = response.data.data;
        setFormData({
          name: networkPlanData.name || '',
          dataCapacityInGB: networkPlanData.dataCapacityInGB?.toString() || '',
          purchasePrice: formatCurrencyInput(networkPlanData.purchasePrice?.toString() || '0'),
          retailPrice: formatCurrencyInput(networkPlanData.retailPrice?.toString() || '0'),
          validityInDays: networkPlanData.validityInDays?.toString() || '',
          esimSupported: networkPlanData.esimSupported ?? false,
          description: networkPlanData.description || '',
          supplier: networkPlanData.supplier?._id || networkPlanData.supplier || ''
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy thông tin gói dịch vụ nhà mạng');
      navigate('/goi-dich-vu/nha-mang');
    }
  };

  useEffect(() => {
    fetchNetworkSupplier();
    if (isEdit) {
      fetchNetworkPlan();
    }
  }, [id]);

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên gói');
      return false;
    }

    if (!formData.dataCapacityInGB) {
      toast.error('Vui lòng nhập dung lượng dữ liệu');
      return false;
    }

    if (!formData.purchasePrice) {
      toast.error('Vui lòng nhập giá nhập');
      return false;
    }

    if (!formData.retailPrice) {
      toast.error('Vui lòng nhập giá bán');
      return false;
    }

    if (!formData.supplier) {
      toast.error('Vui lòng chọn nhà cung cấp');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isEdit && !hasPermission(PERMISSIONS.NETWORK_PLAN.UPDATE)) {
      toast.error('Bạn không có quyền cập nhật gói dịch vụ nhà mạng');
      return;
    }

    if (!isEdit && !hasPermission(PERMISSIONS.NETWORK_PLAN.ADD)) {
      toast.error('Bạn không có quyền thêm gói dịch vụ nhà mạng mới');
      return;
    }

    try {
      setLoading(true);
      const networkPlanData = {
        name: formData.name,
        dataCapacityInGB: parseFloat(formData.dataCapacityInGB),
        purchasePrice: parseCurrency(formData.purchasePrice),
        retailPrice: parseCurrency(formData.retailPrice),
        validityInDays: formData.validityInDays ? parseInt(formData.validityInDays) : undefined,
        esimSupported: formData.esimSupported,
        description: formData.description,
        supplier: formData.supplier
      };

      const response = isEdit
        ? await NETWORK_PLAN_API.update(id, networkPlanData)
        : await NETWORK_PLAN_API.create(networkPlanData);

      if (response?.data?.success) {
        toast.success(isEdit ? 'Cập nhật gói dịch vụ nhà mạng thành công' : 'Thêm gói dịch vụ nhà mạng thành công');
        navigate('/goi-dich-vu/nha-mang');
      } else {
        toast.error(response?.data?.message || `Có lỗi xảy ra khi ${isEdit ? 'cập nhật' : 'thêm'} gói dịch vụ nhà mạng`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || `Có lỗi xảy ra khi ${isEdit ? 'cập nhật' : 'thêm'} gói dịch vụ nhà mạng`);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/goi-dich-vu/nha-mang');
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
        <Typography variant="h3">{isEdit ? 'Cập nhật gói dịch vụ nhà mạng' : 'Thêm gói dịch vụ nhà mạng mới'}</Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Tên gói (*)"
            name="name"
            value={formData.name}
            onChange={handleChange}
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            label="Dung lượng dữ liệu (GB) (*)"
            name="dataCapacityInGB"
            type="number"
            value={formData.dataCapacityInGB}
            onChange={handleChange}
            sx={{ mb: 3 }}
            inputProps={{ min: 0, step: 0.1 }}
          />
          <TextField
            fullWidth
            label="Giá nhập (*)"
            name="purchasePrice"
            value={formData.purchasePrice}
            onChange={handlePriceChange}
            sx={{ mb: 3 }}
            inputProps={{ inputMode: 'numeric' }}
          />
          <TextField
            fullWidth
            label="Giá bán (*)"
            name="retailPrice"
            value={formData.retailPrice}
            onChange={handlePriceChange}
            sx={{ mb: 3 }}
            inputProps={{ inputMode: 'numeric' }}
          />
          <TextField
            fullWidth
            label="Thời hạn sử dụng (ngày)"
            name="validityInDays"
            type="number"
            value={formData.validityInDays}
            onChange={handleChange}
            sx={{ mb: 3 }}
            inputProps={{ min: 1 }}
            helperText="Để trống nếu không giới hạn thời gian"
          />
          <TextField
            fullWidth
            label="Mô tả"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={3}
            sx={{ mb: 3 }}
          />
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="supplier-label">Nhà cung cấp (*)</InputLabel>
            <Select
              labelId="supplier-label"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              label="Nhà cung cấp (*)"
            >
              {networkSupplier.map((supplier) => (
                <MenuItem key={supplier._id} value={supplier._id}>
                  {supplier.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mb: 3 }}>
            <Typography component="span" sx={{ mr: 2 }}>
              Hỗ trợ eSIM
            </Typography>
            <Switch
              name="esimSupported"
              checked={formData.esimSupported}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  esimSupported: e.target.checked
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