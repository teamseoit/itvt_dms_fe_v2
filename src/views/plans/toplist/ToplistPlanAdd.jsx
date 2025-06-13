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

import TOPLIST_PLAN_API from '../../../services/plans/toplistPlanService';
import usePermissions from '../../../hooks/usePermissions';
import { PERMISSIONS } from '../../../constants/permissions';
import { formatCurrencyInput, parseCurrency } from '../../../utils/formatConstants';

export default function ToplistPlanAdd() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    retailPrice: '',
    numberOfArticles: '',
    itemsPerArticle: '',
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

  const fetchToplistPlan = async () => {
    try {
      const response = await TOPLIST_PLAN_API.getById(id);
      if (response.data.success) {
        const toplistPlanData = response.data.data;
        setFormData({
          name: toplistPlanData.name || '',
          retailPrice: formatCurrencyInput(toplistPlanData.retailPrice?.toString() || '0'),
          numberOfArticles: toplistPlanData.numberOfArticles?.toString() || '',
          itemsPerArticle: toplistPlanData.itemsPerArticle?.toString() || '',
          deliveryTimeInDays: toplistPlanData.deliveryTimeInDays?.toString() || '',
          revisionTimes: toplistPlanData.revisionTimes || 1,
          description: toplistPlanData.description || '',
          isActive: toplistPlanData.isActive ?? true
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy thông tin gói dịch vụ toplist');
      navigate('/goi-dich-vu/toplist-vung-tau');
    }
  };

  useEffect(() => {
    if (isEdit) {
      fetchToplistPlan();
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

    if (!formData.itemsPerArticle) {
      toast.error('Vui lòng nhập số item mỗi bài viết');
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

    if (isEdit && !hasPermission(PERMISSIONS.TOPLIST_PLAN.UPDATE)) {
      toast.error('Bạn không có quyền cập nhật gói dịch vụ toplist');
      return;
    }

    if (!isEdit && !hasPermission(PERMISSIONS.TOPLIST_PLAN.ADD)) {
      toast.error('Bạn không có quyền thêm gói dịch vụ toplist mới');
      return;
    }

    try {
      setLoading(true);
      const toplistPlanData = {
        name: formData.name,
        retailPrice: parseCurrency(formData.retailPrice),
        numberOfArticles: parseInt(formData.numberOfArticles),
        itemsPerArticle: parseInt(formData.itemsPerArticle),
        deliveryTimeInDays: parseInt(formData.deliveryTimeInDays),
        revisionTimes: parseInt(formData.revisionTimes),
        description: formData.description,
        isActive: formData.isActive
      };

      const response = isEdit
        ? await TOPLIST_PLAN_API.update(id, toplistPlanData)
        : await TOPLIST_PLAN_API.create(toplistPlanData);

      if (response?.data?.success) {
        toast.success(isEdit ? 'Cập nhật gói dịch vụ toplist thành công' : 'Thêm gói dịch vụ toplist thành công');
        navigate('/goi-dich-vu/toplist-vung-tau');
      } else {
        toast.error(response?.data?.message || `Có lỗi xảy ra khi ${isEdit ? 'cập nhật' : 'thêm'} gói dịch vụ toplist`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || `Có lỗi xảy ra khi ${isEdit ? 'cập nhật' : 'thêm'} gói dịch vụ toplist`);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/goi-dich-vu/toplist-vung-tau');
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
        <Typography variant="h3">{isEdit ? 'Cập nhật gói dịch vụ toplist' : 'Thêm gói dịch vụ toplist mới'}</Typography>
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
            label="Top bài viết (*)"
            name="itemsPerArticle"
            type="number"
            value={formData.itemsPerArticle}
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
            label="Số lần sửa"
            name="revisionTimes"
            type="number"
            value={formData.revisionTimes}
            onChange={handleChange}
            sx={{ mb: 3 }}
            inputProps={{ min: 1 }}
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

          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={handleChange}
                name="isActive"
                color="primary"
              />
            }
            label="Hoạt động"
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={handleBack}
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