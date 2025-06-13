import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTheme } from '@mui/material/styles';
import {
  Box, Button, Typography, Paper, TextField,
  FormControl, InputLabel, Select, MenuItem, Switch,
  Chip, Stack
} from '@mui/material';
import { IconArrowLeft } from '@tabler/icons-react';

import MAINTENANCE_PLAN_API from '../../../services/plans/maintenancePlanService';
import usePermissions from '../../../hooks/usePermissions';
import { PERMISSIONS } from '../../../constants/permissions';

import { formatCurrencyInput, parseCurrency } from '../../../utils/formatConstants';

export default function MaintenancePlanAdd() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    scopeOfWork: [],
    price: '',
    isActive: true
  });
  const [scopeOfWorkInput, setScopeOfWorkInput] = useState('');

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

  const handleScopeOfWorkInputChange = (e) => {
    setScopeOfWorkInput(e.target.value);
  };

  const handleAddScopeOfWork = () => {
    const trimmedInput = scopeOfWorkInput.trim();
    if (trimmedInput) {
      if (formData.scopeOfWork.includes(trimmedInput)) {
        toast.error('Phạm vi công việc này đã tồn tại');
      } else {
        setFormData(prev => ({
          ...prev,
          scopeOfWork: [...prev.scopeOfWork, trimmedInput]
        }));
        setScopeOfWorkInput('');
      }
    }
  };

  const handleRemoveScopeOfWork = (index) => {
    setFormData(prev => ({
      ...prev,
      scopeOfWork: prev.scopeOfWork.filter((_, i) => i !== index)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddScopeOfWork();
    }
  };

  const fetchMaintenancePlan = async () => {
    try {
      const response = await MAINTENANCE_PLAN_API.getById(id);
      if (response.data.success) {
        const maintenancePlanData = response.data.data;
        setFormData({
          name: maintenancePlanData.name || '',
          description: maintenancePlanData.description || '',
          scopeOfWork: maintenancePlanData.scopeOfWork || [],
          price: formatCurrencyInput(maintenancePlanData.price?.toString() || '0'),
          isActive: maintenancePlanData.isActive ?? true
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy thông tin gói bảo trì');
      navigate('/goi-dich-vu/bao-tri');
    }
  };

  useEffect(() => {
    if (isEdit) {
      fetchMaintenancePlan();
    }
  }, [id]);

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên gói');
      return false;
    }

    if (!formData.price) {
      toast.error('Vui lòng nhập giá');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isEdit && !hasPermission(PERMISSIONS.MAINTENANCE_PLAN.UPDATE)) {
      toast.error('Bạn không có quyền cập nhật gói bảo trì');
      return;
    }

    if (!isEdit && !hasPermission(PERMISSIONS.MAINTENANCE_PLAN.ADD)) {
      toast.error('Bạn không có quyền thêm gói bảo trì mới');
      return;
    }

    try {
      setLoading(true);
      const maintenancePlanData = {
        name: formData.name,
        description: formData.description,
        scopeOfWork: formData.scopeOfWork,
        price: parseCurrency(formData.price),
        isActive: formData.isActive
      };

      const response = isEdit
        ? await MAINTENANCE_PLAN_API.update(id, maintenancePlanData)
        : await MAINTENANCE_PLAN_API.create(maintenancePlanData);

      if (response?.data?.success) {
        toast.success(isEdit ? 'Cập nhật gói bảo trì thành công' : 'Thêm gói bảo trì thành công');
        navigate('/goi-dich-vu/bao-tri');
      } else {
        toast.error(response?.data?.message || `Có lỗi xảy ra khi ${isEdit ? 'cập nhật' : 'thêm'} gói bảo trì`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || `Có lỗi xảy ra khi ${isEdit ? 'cập nhật' : 'thêm'} gói bảo trì`);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/goi-dich-vu/bao-tri');
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
        <Typography variant="h3">{isEdit ? 'Cập nhật gói bảo trì' : 'Thêm gói bảo trì mới'}</Typography>
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
            label="Mô tả"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={3}
            sx={{ mb: 3 }}
          />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Phạm vi công việc
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                label="Thêm phạm vi công việc"
                value={scopeOfWorkInput}
                onChange={handleScopeOfWorkInputChange}
                onKeyPress={handleKeyPress}
                size="small"
              />
              <Button
                variant="contained"
                onClick={handleAddScopeOfWork}
                disabled={!scopeOfWorkInput.trim()}
              >
                Thêm
              </Button>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {formData.scopeOfWork.map((scope, index) => (
                <Chip
                  key={index}
                  label={scope}
                  onDelete={() => handleRemoveScopeOfWork(index)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Box>

          <TextField
            fullWidth
            label="Giá (*)"
            name="price"
            value={formData.price}
            onChange={handlePriceChange}
            sx={{ mb: 3 }}
            inputProps={{ inputMode: 'numeric' }}
          />

          <FormControl sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mb: 3 }}>
            <Typography component="span" sx={{ mr: 2 }}>
              Hiển thị gói bảo trì
            </Typography>
            <Switch
              name="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  isActive: e.target.checked
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