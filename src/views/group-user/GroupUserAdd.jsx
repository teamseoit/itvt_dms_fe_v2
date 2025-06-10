import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { IconArrowLeft, IconChevronDown } from '@tabler/icons-react';

import PERMISSION_API from '../../services/permissionService';
import GROUP_USER_API from '../../services/groupUserService';
import usePermissions from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../constants/permissions';

export default function GroupUserAdd() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const { hasPermission } = usePermissions();

  const fetchPermissions = async () => {
    try {
      const response = await PERMISSION_API.getPermissions();
      if (response.data.success) {
        setPermissions(response.data.data || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách quyền');
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionChange = (permissionId) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      }
      return [...prev, permissionId];
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên nhóm');
      return false;
    }

    if (!formData.description.trim()) {
      toast.error('Vui lòng nhập mô tả');
      return false;
    }

    if (selectedPermissions.length === 0) {
      toast.error('Vui lòng chọn ít nhất một quyền');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await GROUP_USER_API.create({
        ...formData,
        permissions: selectedPermissions
      });
      if (response.data.success) {
        toast.success('Thêm nhóm quyền thành công');
        navigate('/nhom-quyen');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi thêm nhóm quyền');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/nhom-quyen');
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!permission.permission_parent_id) {
      acc[permission._id] = {
        parent: permission,
        children: []
      };
    } else {
      const parentGroup = acc[permission.permission_parent_id];
      if (parentGroup) {
        parentGroup.children.push(permission);
      }
    }
    return acc;
  }, {});

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
        <Typography variant="h3">Thêm nhóm quyền mới</Typography>
      </Box>

      {hasPermission(PERMISSIONS.GROUP_USER.ADD) ? (
        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Tên nhóm (*)"
              name="name"
              value={formData.name}
              onChange={handleChange}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Mô tả (*)"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              sx={{ mb: 3 }}
            />

            <Typography variant="h4" sx={{ mb: 2 }}>Phân quyền (*)</Typography>
            <Box 
              sx={{ 
                mb: 3,
                maxHeight: '40vh',
                overflowY: 'auto',
                '& .MuiAccordion-root': {
                  '&.Mui-expanded': {
                    '& .MuiAccordionSummary-root': {
                      position: 'sticky',
                      top: 0,
                      backgroundColor: theme.palette.background.paper,
                      zIndex: 1
                    }
                  }
                }
              }}
            >
              {Object.values(groupedPermissions).map(({ parent, children }) => (
                <Accordion key={parent._id} sx={{ mb: 1 }}>
                  <AccordionSummary 
                    expandIcon={<IconChevronDown />}
                    sx={{
                      minHeight: '48px !important',
                      height: '48px',
                      '& .MuiAccordionSummary-content': {
                        margin: '0 !important',
                      }
                    }}
                  >
                    <FormControlLabel
                      label={parent.name}
                      control={
                        <Checkbox
                          checked={children.every(child => selectedPermissions.includes(child._id))}
                          indeterminate={
                            children.some(child => selectedPermissions.includes(child._id)) &&
                            !children.every(child => selectedPermissions.includes(child._id))
                          }
                          onChange={() => {
                            const childIds = children.map(child => child._id);
                            if (children.every(child => selectedPermissions.includes(child._id))) {
                              setSelectedPermissions(prev => prev.filter(id => !childIds.includes(id)));
                            } else {
                              setSelectedPermissions(prev => [
                                ...new Set([...prev, ...childIds])
                              ]);
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      }
                      onClick={(e) => e.stopPropagation()}
                    />
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 3 }}>
                      {children.map(permission => (
                        <FormControlLabel
                          key={permission._id}
                          control={
                            <Checkbox
                              checked={selectedPermissions.includes(permission._id)}
                              onChange={() => handlePermissionChange(permission._id)}
                            />
                          }
                          label={permission.name}
                        />
                      ))}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                type="submit"
                disabled={loading}
                sx={{ backgroundColor: theme.palette.primary.main }}
              >
                {loading ? 'Đang xử lý...' : 'Thêm mới'}
              </Button>
            </Box>
          </form>
        </Paper>
      ) : (
        <Typography variant="h6">Bạn không có quyền thêm nhóm quyền</Typography>
      )}
    </Box>
  );
} 