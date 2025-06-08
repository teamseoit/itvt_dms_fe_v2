import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';

import GROUP_USER_API from '../../services/groupUserService';
import ROLE_API from '../../services/roleService';
import { formatDateTime } from '../../utils/formatConstants';

const columns = [
  { id: 'actions', label: 'Thao tác', minWidth: 100 },
  { id: 'name', label: 'Tên nhóm', minWidth: 170 },
  { id: 'description', label: 'Mô tả', minWidth: 200 },
  { id: 'createdAt', label: 'Ngày tạo', minWidth: 150 }
];

const PERMISSIONS = {
  ADD: '66746193cb45907845239f39',
  UPDATE: '66746193cb45907845239f3a',
  DELETE: '66746193cb45907845239f4a'
};

export default function GroupUserList() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [data, setData] = useState({
    groupUsers: [],
    meta: {
      page: 1,
      limit: 10,
      totalDocs: 0,
      totalPages: 0
    }
  });

  const fetchPermissions = async () => {
    try {
      const response = await ROLE_API.getRoles();
      if (response.data.success) {
        setPermissions(response.data.data || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách quyền');
    }
  };
  
  const hasPermission = (permissionId) => {
    return permissions.some(permission => permission.permission_id === permissionId);
  };

  const fetchGroupUsers = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const response = await GROUP_USER_API.getAll({ page: pageNumber, limit: 10 });
      if (response.data.success) {
        setData({
          groupUsers: response.data.data,
          meta: response.data.meta
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách nhóm người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupUsers(page + 1);
    fetchPermissions();
  }, [page]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleAdd = () => {
    navigate('/nhom-quyen/them-moi');
  };

  const handleEdit = (id) => {
    navigate(`/nhom-quyen/${id}`);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setOpenDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      const response = await GROUP_USER_API.delete(deleteId);
      if (response.data.success) {
        toast.success('Xóa nhóm người dùng thành công');
        fetchGroupUsers(page + 1);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa nhóm người dùng');
    } finally {
      setLoading(false);
      setOpenDialog(false);
      setDeleteId(null);
    }
  };

  const handleDeleteCancel = () => {
    setOpenDialog(false);
    setDeleteId(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h3">Danh sách nhóm quyền</Typography>
        {hasPermission(PERMISSIONS.ADD) && (
          <Button
            variant="contained"
            startIcon={<IconPlus />}
            onClick={handleAdd}
            sx={{ backgroundColor: theme.palette.primary.main }}
          >
            Thêm mới
          </Button>
        )}
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader aria-label="bảng nhóm quyền">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                    sx={{ backgroundColor: theme.palette.primary.light }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                data.groupUsers.map((row) => (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row._id || row.id}>
                    <TableCell>
                      {hasPermission(PERMISSIONS.UPDATE) && (
                        <IconButton 
                          color="primary" 
                          onClick={() => handleEdit(row._id || row.id)}
                          size="small"
                        >
                          <IconEdit size={18} />
                        </IconButton>
                      )}
                      {hasPermission(PERMISSIONS.DELETE) && (
                        <IconButton 
                          color="error" 
                          onClick={() => handleDeleteClick(row._id || row.id)}
                          size="small"
                        >
                          <IconTrash size={18} />
                        </IconButton>
                      )}
                    </TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.description}</TableCell>
                    <TableCell>{formatDateTime(row.createdAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={data.meta.totalDocs}
          rowsPerPage={10}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[]}
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} trên ${count}`}
        />
      </Paper>

      <Dialog
        open={openDialog}
        onClose={handleDeleteCancel}
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <DialogTitle id="dialog-title">
          Xác nhận xóa
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="dialog-description">
            Bạn có chắc chắn muốn xóa nhóm quyền này không?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Hủy
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}