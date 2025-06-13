import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTheme } from '@mui/material/styles';
import {
  Box, Button, Typography, Paper, TextField,
  FormControl, InputLabel, Select, MenuItem, Switch,
  FormControlLabel, OutlinedInput
} from '@mui/material';
import { IconArrowLeft } from '@tabler/icons-react';

import CONTENT_PLAN_API from '../../../services/plans/contentPlanService';
import usePermissions from '../../../hooks/usePermissions';
import { PERMISSIONS } from '../../../constants/permissions';
import { formatCurrencyInput, parseCurrency } from '../../../utils/formatConstants';

export default function ContentPlanAdd() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    retailPrice: '',
    numberOfArticles: '',
    deliveryTimeInDays: '',
    revisionTimes: 1,
    description: '',
    isActive: true
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

  const fetchContentPlan = async () => {
    try {
      const response = await CONTENT_PLAN_API.getById(id);
      if (response.data.success) {
        const contentPlanData = response.data.data;
        setFormData({
          name: contentPlanData.name || '',
          retailPrice: formatCurrencyInput(contentPlanData.retailPrice?.toString() || '0'),
          numberOfArticles: contentPlanData.numberOfArticles?.toString() || '',
          deliveryTimeInDays: contentPlanData.deliveryTimeInDays?.toString() || '',
          revisionTimes: contentPlanData.revisionTimes || 1,
          description: contentPlanData.description || '',
          isActive: contentPlanData.isActive ?? true
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy thông tin gói dịch vụ viết bài content');
      navigate('/goi-dich-vu/viet-bai-content');
    }
  };

  useEffect(() => {
    if (isEdit) {
      fetchContentPlan();
    }
  }, [id]);

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên gói');
      return false;
    }

    if (!formData.retailPrice) {
      toast.error('Vui lòng nhập giá bán');
      return false;
    }

    if (!formData.numberOfArticles) {
      toast.error('Vui lòng nhập số bài viết');
      return false;
    }

    if (!formData.deliveryTimeInDays) {
      toast.error('Vui lòng nhập thời gian bàn giao');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isEdit && !hasPermission(PERMISSIONS.CONTENT_PLAN.UPDATE)) {
      toast.error('Bạn không có quyền cập nhật gói dịch vụ viết bài content');
      return;
    }

    if (!isEdit && !hasPermission(PERMISSIONS.CONTENT_PLAN.ADD)) {
      toast.error('Bạn không có quyền thêm gói dịch vụ viết bài content mới');
      return;
    }

    try {
      setLoading(true);
      const contentPlanData = {
        name: formData.name,
        retailPrice: parseCurrency(formData.retailPrice),
        numberOfArticles: parseInt(formData.numberOfArticles),
        deliveryTimeInDays: parseInt(formData.deliveryTimeInDays),
        revisionTimes: parseInt(formData.revisionTimes),
        description: formData.description,
        isActive: formData.isActive
      };

      const response = isEdit
        ? await CONTENT_PLAN_API.update(id, contentPlanData)
        : await CONTENT_PLAN_API.create(contentPlanData);

      if (response?.data?.success) {
        toast.success(isEdit ? 'Cập nhật gói dịch vụ viết bài content thành công' : 'Thêm gói dịch vụ viết bài content thành công');
        navigate('/goi-dich-vu/viet-bai-content');
      } else {
        toast.error(response?.data?.message || `Có lỗi xảy ra khi ${isEdit ? 'cập nhật' : 'thêm'} gói dịch vụ viết bài content`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || `Có lỗi xảy ra khi ${isEdit ? 'cập nhật' : 'thêm'} gói dịch vụ viết bài content`);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/goi-dich-vu/viet-bai-content');
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
        <Typography variant="h3">{isEdit ? 'Cập nhật gói dịch vụ viết bài content' : 'Thêm gói dịch vụ viết bài content mới'}</Typography>
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
            label="Giá bán (*)"
            name="retailPrice"
            value={formData.retailPrice}
            onChange={handlePriceChange}
            sx={{ mb: 3 }}
            inputProps={{ inputMode: 'numeric' }}
          />
          
          <TextField
            fullWidth
            label="Số bài viết (*)"
            name="numberOfArticles"
            type="number"
            value={formData.numberOfArticles}
            onChange={handleChange}
            sx={{ mb: 3 }}
            inputProps={{ min: 1 }}
          />
          
          <TextField
            fullWidth
            label="Thời gian bàn giao (ngày) (*)"
            name="deliveryTimeInDays"
            type="number"
            value={formData.deliveryTimeInDays}
            onChange={handleChange}
            sx={{ mb: 3 }}
            inputProps={{ min: 1 }}
          />
          
          <TextField
            fullWidth
            label="Số lần sửa đổi"
            name="revisionTimes"
            type="number"
            value={formData.revisionTimes}
            onChange={handleChange}
            sx={{ mb: 3 }}
            inputProps={{ min: 0 }}
          />
          
          <TextField
            fullWidth
            label="Mô tả"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={4}
            sx={{ mb: 3 }}
          />
          
          <FormControlLabel
            control={
              <Switch
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
            }
            label="Hiển thị gói dịch vụ"
            sx={{ mb: 3 }}
          />
          
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