import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { IconArrowLeft, IconEye, IconEyeOff } from '@tabler/icons-react';

import GROUP_USER_API from '../../services/groupUserService';
import USER_API from '../../services/userService';

export default function UserAdd() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [groups, setGroups] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    password: '',
    email: '',
    groupId: ''
  });

  const fetchGroups = async () => {
    try {
      const response = await GROUP_USER_API.getAll({ limit: 1000 });
      if (response.data.success) {
        setGroups(response.data.data || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách nhóm quyền');
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      toast.error('Vui lòng nhập tên đăng nhập');
      return false;
    }

    if (!formData.displayName.trim()) {
      toast.error('Vui lòng nhập tên hiển thị');
      return false;
    }

    if (!formData.password.trim()) {
      toast.error('Vui lòng nhập mật khẩu');
      return false;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;
    if (!passwordRegex.test(formData.password)) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ thường, chữ in hoa, số và ký tự đặc biệt');
      return false;
    }

    if (!formData.email.trim()) {
      toast.error('Vui lòng nhập email');
      return false;
    }

    if (!formData.groupId) {
      toast.error('Vui lòng chọn nhóm quyền');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error('Email không hợp lệ');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const newUser = {
        display_name: formData.displayName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        group_user_id: formData.groupId
      };

      const response = await USER_API.create(newUser);
      if (response.data.success) {
        toast.success('Thêm tài khoản thành công');
        navigate('/tai-khoan');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi thêm tài khoản');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/tai-khoan');
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
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
        <Typography variant="h3">Thêm tài khoản mới</Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Tên đăng nhập (*)"
            name="username"
            value={formData.username}
            onChange={handleChange}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Tên hiển thị (*)"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Mật khẩu (*)"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={toggleShowPassword} edge="end">
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Email (*)"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            sx={{ mb: 3 }}
          />

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="group-label">Nhóm quyền (*)</InputLabel>
            <Select
              labelId="group-label"
              name="groupId"
              value={formData.groupId}
              onChange={handleChange}
              label="Nhóm quyền (*)"
            >
              {groups.map((group) => (
                <MenuItem key={group._id} value={group._id}>
                  {group.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              Thêm mới
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
} 