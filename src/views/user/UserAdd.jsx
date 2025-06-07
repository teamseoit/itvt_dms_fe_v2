import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { IconArrowLeft, IconEye, IconEyeOff } from '@tabler/icons-react';

import GROUP_USER_API from '../../services/groupUserService';
import USER_API from '../../services/userService';
import ROLE_API from '../../services/roleService';

const PERMISSIONS = {
  CHANGE_PASSWORD: '66746193cb45907845239f37'
};

export default function UserAdd() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [groups, setGroups] = useState([]);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    password: '',
    email: '',
    groupId: ''
  });

  const fetchPermissions = async () => {
    try {
      const response = await ROLE_API.getRoles();
      if (response.data.success) {
        setPermissions(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const hasPermission = (permissionId) => {
    return permissions.some(permission => permission.permission_id === permissionId);
  };

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

  const fetchUserData = async () => {
    try {
      const response = await USER_API.getById(id);
      if (response.data.success) {
        const userData = response.data.data;
        setFormData({
          username: userData.username || '',
          displayName: userData.display_name || '',
          password: '',
          email: userData.email || '',
          groupId: userData.group_user_id || ''
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy thông tin người dùng');
      navigate('/tai-khoan');
    }
  };

  useEffect(() => {
    fetchGroups();
    if (isEdit) {
      fetchUserData();
    }
    fetchPermissions();
  }, [id]);

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

    if (!isEdit && !formData.password.trim()) {
      toast.error('Vui lòng nhập mật khẩu');
      return false;
    }

    if (!isEdit && formData.password) {
      const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;
      if (!passwordRegex.test(formData.password)) {
        toast.error('Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ thường, chữ in hoa, số và ký tự đặc biệt');
        return false;
      }
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

  const validatePassword = () => {
    if (!newPassword.trim()) {
      toast.error('Vui lòng nhập mật khẩu mới');
      return false;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ thường, chữ in hoa, số và ký tự đặc biệt');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const userData = {
        display_name: formData.displayName,
        username: formData.username,
        email: formData.email,
        group_user_id: formData.groupId
      };

      if (!isEdit) {
        userData.password = formData.password;
      }

      const response = isEdit
        ? await USER_API.update(id, userData)
        : await USER_API.create(userData);

      if (response?.data?.success) {
        toast.success(isEdit ? 'Cập nhật tài khoản thành công' : 'Thêm tài khoản thành công');
        navigate('/tai-khoan');
      } else {
        toast.error(response?.data?.message || `Có lỗi xảy ra khi ${isEdit ? 'cập nhật' : 'thêm'} tài khoản`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || `Có lỗi xảy ra khi ${isEdit ? 'cập nhật' : 'thêm'} tài khoản`);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    try {
      setLoading(true);
      const response = await USER_API.changePassword(id, newPassword);
      if (response?.data?.success) {
        toast.success('Thay đổi mật khẩu thành công');
        setOpenPasswordDialog(false);
        setNewPassword('');
      } else {
        toast.error(response?.data?.message || 'Có lỗi xảy ra khi thay đổi mật khẩu');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi thay đổi mật khẩu');
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

  const toggleShowNewPassword = () => {
    setShowNewPassword(!showNewPassword);
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
        <Typography variant="h3">{isEdit ? 'Cập nhật tài khoản' : 'Thêm tài khoản mới'}</Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Tên đăng nhập (*)"
            name="username"
            value={formData.username}
            onChange={handleChange}
            disabled={isEdit}
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

          {!isEdit && (
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
          )}

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
            {isEdit && hasPermission(PERMISSIONS.CHANGE_PASSWORD) && (
              <Button
                variant="outlined"
                onClick={() => setOpenPasswordDialog(true)}
                disabled={loading}
              >
                Đổi mật khẩu
              </Button>
            )}
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

      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)}>
        <DialogTitle>Thay đổi mật khẩu</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Mật khẩu mới"
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin="dense"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={toggleShowNewPassword} edge="end">
                    {showNewPassword ? <IconEyeOff /> : <IconEye />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>Hủy</Button>
          <Button onClick={handleChangePassword} variant="contained" disabled={loading}>
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 