import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTheme } from '@mui/material/styles';
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
import TextField from '@mui/material/TextField';
import { IconPlus, IconTrash } from '@tabler/icons-react';

import IP_WHITELIST_API from '../../services/ipWhitelistService';
import usePermissions from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../constants/permissions';
import { formatDateTime } from '../../utils/formatConstants';

const columns = [
  { id: 'actions', label: 'Thao tác', minWidth: 100 },
  { id: 'ip', label: 'Địa chỉ IP', minWidth: 150 },
  { id: 'createdBy', label: 'Người tạo', minWidth: 200 },
  { id: 'createdAt', label: 'Ngày tạo', minWidth: 150 }
];

export default function IpWhitelistList() {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newIp, setNewIp] = useState('');
  const [data, setData] = useState({
    ipWhitelists: [],
    meta: {
      page: 1,
      limit: 10,
      totalDocs: 0,
      totalPages: 0
    }
  });

  const { hasPermission } = usePermissions();

  const fetchIpWhitelistData = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const response = await IP_WHITELIST_API.getAll({ page: pageNumber, limit: 10 });
      if (response.data.success) {
        setData({
          ipWhitelists: response.data.data,
          meta: response.data.meta
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách IP whitelist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIpWhitelistData(page + 1);
  }, [page]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleAddClick = () => {
    setOpenAddDialog(true);
    setNewIp('');
  };

  const handleAddConfirm = async () => {
    if (!newIp.trim()) {
      toast.error('Vui lòng nhập địa chỉ IP');
      return;
    }

    try {
      setLoading(true);
      const response = await IP_WHITELIST_API.create({ ip: newIp.trim() });
      if (response.data.success) {
        toast.success('Thêm IP whitelist thành công');
        setOpenAddDialog(false);
        setNewIp('');
        fetchIpWhitelistData(page + 1);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi thêm IP whitelist');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCancel = () => {
    setOpenAddDialog(false);
    setNewIp('');
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setOpenDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      const response = await IP_WHITELIST_API.delete(deleteId);
      if (response.data.success) {
        toast.success('Xóa IP whitelist thành công');
        fetchIpWhitelistData(page + 1);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa IP whitelist');
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
        <Typography variant="h3">Danh sách IP Whitelist</Typography>
        {hasPermission(PERMISSIONS.IP_WHITELIST.ADD) && (
          <Button
            variant="contained"
            startIcon={<IconPlus />}
            onClick={handleAddClick}
            sx={{ backgroundColor: theme.palette.primary.main }}
          >
            Thêm mới
          </Button>
        )}
      </Box>

      {hasPermission(PERMISSIONS.IP_WHITELIST.VIEW) ? (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table stickyHeader aria-label="bảng IP whitelist">
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
                  data.ipWhitelists.map((row) => (
                    <TableRow hover role="checkbox" tabIndex={-1} key={row._id || row.id}>
                      <TableCell>
                        {hasPermission(PERMISSIONS.IP_WHITELIST.DELETE) && (
                          <IconButton 
                            color="error" 
                            onClick={() => handleDeleteClick(row._id || row.id)}
                            size="small"
                          >
                            <IconTrash size={18} />
                          </IconButton>
                        )}
                      </TableCell>
                      <TableCell>{row.ip}</TableCell>
                      <TableCell>{row.createdBy?.display_name || row.createdBy?.username || 'N/A'}</TableCell>
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
      ) : (
        <Typography variant="h4">Bạn không có quyền xem danh sách IP whitelist!</Typography>
      )}

      {/* Dialog thêm mới */}
      <Dialog
        open={openAddDialog}
        onClose={handleAddCancel}
        aria-labelledby="add-dialog-title"
        aria-describedby="add-dialog-description"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="add-dialog-title">
          Thêm IP Whitelist mới
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="add-dialog-description" sx={{ mb: 2 }}>
            Vui lòng nhập địa chỉ IP cần thêm vào whitelist
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="ip"
            label="Địa chỉ IP"
            type="text"
            fullWidth
            variant="outlined"
            value={newIp}
            onChange={(e) => setNewIp(e.target.value)}
            placeholder="Ví dụ: 192.168.1.1"
            helperText="Nhập địa chỉ IP hợp lệ (IPv4)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddCancel} color="primary">
            Hủy
          </Button>
          <Button onClick={handleAddConfirm} color="primary" variant="contained">
            Thêm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận xóa */}
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
            Bạn có chắc chắn muốn xóa IP whitelist này không?
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
