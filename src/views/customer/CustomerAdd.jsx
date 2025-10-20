import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useTheme } from '@mui/material/styles';
import { IconArrowLeft } from '@tabler/icons-react';
import { FileUploader } from 'react-drag-drop-files';

import {
  Box, Button, Typography, Paper, TextField,
  FormControlLabel, Switch, Grid, MenuItem
} from '@mui/material';

import CUSTOMER_API from '../../services/customerService';
import usePermissions from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../constants/permissions';
import { convertToFullUrl } from '../../utils/formatConstants';

const genderOptions = [
  { value: 0, label: 'Nam' },
  { value: 1, label: 'Nữ' },
];

const fileTypes = ['JPG', 'PNG', 'JPEG'];

export default function CustomerAdd() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const { hasPermission } = usePermissions();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    gender: 0,
    identityNumber: '',
    phoneNumber: '',
    dateOfBirth: '',
    address: '',
    companyName: '',
    taxCode: '',
    companyAddress: '',
    representativeName: '',
    representativePhone: '',
    vatEmail: '',
    identityCardFrontImage: '',
    identityCardBackImage: '',
    identityCardFrontImagePreview: '',
    identityCardBackImagePreview: '',
    typeCustomer: false,
  });

  const fetchCustomerData = async () => {
    try {
      const res = await CUSTOMER_API.getById(id);
      if (res.data.success) {
        const data = res.data.data;
        setFormData(prev => ({
          ...prev,
          ...data,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
          identityCardFrontImagePreview: data.identityCardFrontImage ? convertToFullUrl(data.identityCardFrontImage) : '',
          identityCardBackImagePreview: data.identityCardBackImage ? convertToFullUrl(data.identityCardBackImage) : '',
        }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi lấy dữ liệu');
      navigate('/khach-hang');
    }
  };

  useEffect(() => {
    if (isEdit) fetchCustomerData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (file, side) => {
    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({
        ...prev,
        [`${side}Preview`]: reader.result,
        [side]: file,
      }));
    };
    reader.readAsDataURL(file);
  };
  

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error('Vui lòng nhập tên khách hàng');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isEdit && !hasPermission(PERMISSIONS.CUSTOMER.UPDATE)) {
      toast.error('Bạn không có quyền cập nhật khách hàng');
      return;
    }

    if (!isEdit && !hasPermission(PERMISSIONS.CUSTOMER.ADD)) {
      toast.error('Bạn không có quyền thêm khách hàng mới');
      return;
    }

    try {
      setLoading(true);
      const payload = new FormData();
      for (const key in formData) {
        if (key.endsWith('Preview')) continue;
        if (formData[key] !== null && formData[key] !== undefined) {
          payload.append(key, formData[key]);
        }
      }

      const res = isEdit
        ? await CUSTOMER_API.update(id, payload)
        : await CUSTOMER_API.create(payload);

      if (res.data.success) {
        toast.success(isEdit ? 'Cập nhật thành công' : 'Thêm thành công');
        navigate('/khach-hang');
      } else {
        toast.error(res.data.message || 'Đã xảy ra lỗi');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi xử lý');
    } finally {
      setLoading(false);
    }
  };

  const canAdd = !isEdit && hasPermission(PERMISSIONS.CUSTOMER.ADD);
  const canUpdate = isEdit && hasPermission(PERMISSIONS.CUSTOMER.UPDATE);

  if (!canAdd && !canUpdate) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button onClick={() => navigate('/khach-hang')} startIcon={<IconArrowLeft />}>Quay lại</Button>
          <Typography variant="h4" ml={2}>{isEdit ? 'Cập nhật khách hàng' : 'Thêm khách hàng mới'}</Typography>
        </Box>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" color="error">
            {isEdit 
              ? 'Bạn không có quyền cập nhật khách hàng!' 
              : 'Bạn không có quyền thêm khách hàng mới!'
            }
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button onClick={() => navigate('/khach-hang')} startIcon={<IconArrowLeft />}>Quay lại</Button>
        <Typography variant="h4" ml={2}>{isEdit ? 'Cập nhật khách hàng' : 'Thêm khách hàng mới'}</Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <TextField fullWidth label="Họ tên (*)" name="fullName" value={formData.fullName} onChange={handleChange} />
              <TextField fullWidth label="Email" name="email" value={formData.email} onChange={handleChange} sx={{ mt: 2 }} />
              <TextField
                fullWidth
                select
                label="Giới tính"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                sx={{ mt: 2 }}
              >
                {genderOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                type="text"
                label="Số CMND (*)"
                name="identityNumber"
                value={formData.identityNumber}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) { 
                    handleChange(e);
                  }
                }}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                sx={{ mt: 2 }}
              />
              <TextField
                fullWidth
                label="Ngày sinh"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                sx={{ mt: 2 }}
              />
              <TextField
                fullWidth
                type="text"
                label="Số điện thoại (*)"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    handleChange(e);
                  }
                }}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                sx={{ mt: 2 }}
              />
              <TextField fullWidth label="Địa chỉ" name="address" value={formData.address} onChange={handleChange} sx={{ mt: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box mt={2}>
                    <Typography variant="body1" gutterBottom>Ảnh CMND mặt trước</Typography>
                    <FileUploader handleChange={(file) => handleFileChange(file, 'identityCardFrontImage')} name="front" types={fileTypes} />
                    {formData.identityCardFrontImagePreview ? (
                      <Box mt={2}>
                        <Typography variant="body2">Xem trước mặt trước:</Typography>
                        <img
                          src={formData.identityCardFrontImagePreview}
                          alt="Mặt trước CMND"
                          style={{ width: '330px', borderRadius: 8, marginTop: 8 }}
                        />
                      </Box>
                    ) : (
                      typeof formData.identityCardFrontImage === 'string' &&
                      formData.identityCardFrontImage !== '' && (
                        <Box mt={2}>
                          <Typography variant="body2">Xem hình mặt trước:</Typography>
                          <img
                            src={convertToFullUrl(formData.identityCardFrontImage)}
                            alt="Mặt trước CMND"
                            style={{ width: '330px', borderRadius: 8, marginTop: 8 }}
                          />
                        </Box>
                      )
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box mt={2}>
                    <Typography variant="body1" gutterBottom mt={2}>Ảnh CMND mặt sau</Typography>
                    <FileUploader handleChange={(file) => handleFileChange(file, 'identityCardBackImage')} name="back" types={fileTypes} />
                    {formData.identityCardBackImagePreview ? (
                      <Box mt={2}>
                        <Typography variant="body2">Xem trước mặt sau:</Typography>
                        <img
                          src={formData.identityCardBackImagePreview}
                          alt="Mặt sau CMND"
                          style={{ width: '330px', borderRadius: 8, marginTop: 8 }}
                        />
                      </Box>
                    ) : (
                      typeof formData.identityCardBackImage === 'string' &&
                      formData.identityCardBackImage !== '' && (
                        <Box mt={2}>
                          <Typography variant="body2">Xem hình mặt sau:</Typography>
                          <img
                            src={convertToFullUrl(formData.identityCardBackImage)}
                            alt="Mặt sau CMND"
                            style={{ width: '330px', borderRadius: 8, marginTop: 8 }}
                          />
                        </Box>
                      )
                    )}
                  </Box>
                </Grid>
              </Grid>

              <FormControlLabel
                control={<Switch checked={formData.typeCustomer} onChange={handleChange} name="typeCustomer" />}
                label="Khách hàng doanh nghiệp"
                sx={{ mt: 3 }}
              />

              {formData.typeCustomer && (
                <Grid item xs={12} sm={12}>
                  <TextField fullWidth label="Tên công ty" name="companyName" value={formData.companyName} onChange={handleChange} sx={{ mt: 2 }} />
                  <TextField
                    fullWidth
                    type="text"
                    label="Mã số thuế"
                    name="taxCode"
                    value={formData.taxCode}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) { 
                        handleChange(e);
                      }
                    }}
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                    sx={{ mt: 2 }}
                  />
                  <TextField fullWidth label="Địa chỉ công ty" name="companyAddress" value={formData.companyAddress} onChange={handleChange} sx={{ mt: 2 }} />
                  <TextField fullWidth label="Người đại diện" name="representativeName" value={formData.representativeName} onChange={handleChange} sx={{ mt: 2 }} />
                  <TextField
                    fullWidth
                    type="text"
                    label="Số điện thoại đại diện"
                    name="representativePhone"
                    value={formData.representativePhone}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) { 
                        handleChange(e);
                      }
                    }}
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                    sx={{ mt: 2 }}
                  />
                  <TextField fullWidth label="Email VAT" name="vatEmail" value={formData.vatEmail} onChange={handleChange} sx={{ mt: 2 }} />
                </Grid>
              )}
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            <Button type="submit" variant="contained" disabled={loading}>
              {isEdit ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
