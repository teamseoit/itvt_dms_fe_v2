import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTheme, styled } from '@mui/material/styles';
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
import CircularProgress from '@mui/material/CircularProgress';

import PERMISSION_API from '../../services/permissionService';
import GROUP_USER_API from '../../services/groupUserService';
import usePermissions from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../constants/permissions';

const ReadOnlyCheckbox = styled(Checkbox)(({ theme }) => ({
  '&.Mui-checked': {
    color: theme.palette.primary.main,
  },
  '&.Mui-disabled': {
    color: theme.palette.primary.main,
  },
  '&.MuiCheckbox-indeterminate': {
    color: theme.palette.primary.main,
  }
}));

export default function GroupUserDetail() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const { hasPermission } = usePermissions();

  const fetchData = async () => {
    try {
      setLoading(true);
      const permissionsResponse = await PERMISSION_API.getPermissions();
      if (permissionsResponse.data.success) {
        setPermissions(permissionsResponse.data.data || []);
      }

      const groupResponse = await GROUP_USER_API.getById(id);
      if (groupResponse.data.success) {
        const { name, description, permissions: groupPermissions } = groupResponse.data.data;
        setFormData({ name, description });
        setSelectedPermissions(groupPermissions);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

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

  const isParentChecked = (children) => {
    return children.length > 0 && children.every(child => selectedPermissions.includes(child._id));
  };

  const isParentIndeterminate = (children) => {
    return children.length > 0 && 
           children.some(child => selectedPermissions.includes(child._id)) &&
           !children.every(child => selectedPermissions.includes(child._id));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

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
        <Typography variant="h3">Chi tiết nhóm quyền</Typography>
      </Box>

      {hasPermission(PERMISSIONS.GROUP_USER.UPDATE) ? (
        <Paper sx={{ p: 3 }}>
        <TextField
          fullWidth
          label="Tên nhóm"
          name="name"
          value={formData.name}
          sx={{ mb: 3 }}
          InputProps={{
            readOnly: true,
          }}
        />
        <TextField
          fullWidth
          label="Mô tả"
          name="description"
          value={formData.description}
          multiline
          rows={4}
          sx={{ mb: 3 }}
          InputProps={{
            readOnly: true,
          }}
        />

        <Typography variant="h4" sx={{ mb: 2 }}>Phân quyền</Typography>
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
                    <ReadOnlyCheckbox
                      checked={isParentChecked(children)}
                      indeterminate={isParentIndeterminate(children)}
                      disabled
                      onClick={(e) => e.preventDefault()}
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
                        <ReadOnlyCheckbox
                          checked={selectedPermissions.includes(permission._id)}
                          disabled
                          onClick={(e) => e.preventDefault()}
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
        </Paper>
      ) : (
        <Typography variant="h4">Bạn không có quyền cập nhật nhóm quyền!</Typography>
      )}
    </Box>
  );
} 