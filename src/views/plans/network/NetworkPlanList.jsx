import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { 
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  CircularProgress
} from '@mui/material';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';

import NETWORK_PLAN_API from '../../../services/plans/networkPlanService';
import usePermissions from '../../../hooks/usePermissions';
import { PERMISSIONS } from '../../../constants/permissions';
import { formatDateTime, formatPrice } from '../../../utils/formatConstants';

const columns = [
  { id: 'actions', label: 'Thao tác', minWidth: 100 },
  { id: 'name', label: 'Tên gói', minWidth: 120 },
  { id: 'dataCapacityInGB', label: 'Dung lượng', minWidth: 120 },
  { id: 'purchasePrice', label: 'Giá vốn', minWidth: 120 },
  { id: 'retailPrice', label: 'Giá bán', minWidth: 120 },
  { id: 'validityInDays', label: 'Thời hạn', minWidth: 120 },
  { id: 'esimSupported', label: 'Hỗ trợ eSIM', minWidth: 100 },
  { id: 'supplierId', label: 'Nhà cung cấp', minWidth: 200 },
  { id: 'createdAt', label: 'Ngày tạo', minWidth: 150 }
];

export default function NetworkPlanList() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    networkPlan: [],
    meta: {
      page: 1,
      limit: 10,
      totalDocs: 0,
      totalPages: 0
    }
  });

  const { hasPermission } = usePermissions();

  const fetchNetworkPlan = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const response = await NETWORK_PLAN_API.getAll({ page: pageNumber, limit: 10 });
      if (response.data.success) {
        setData({
          networkPlan: response.data.data,
          meta: response.data.meta
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách gói dịch vụ mạng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworkPlan(page + 1);
  }, [page]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleAdd = () => {
    navigate('/goi-dich-vu/nha-mang/them-moi');
  };

  const handleEdit = (id) => {
    navigate(`/goi-dich-vu/nha-mang/${id}`);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setOpenDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      const response = await NETWORK_PLAN_API.delete(deleteId);
      if (response.data.success) {
        toast.success('Xóa gói dịch vụ mạng thành công');
        fetchNetworkPlan(page + 1);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa gói dịch vụ mạng');
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
        <Typography variant="h3">Danh sách gói dịch vụ nhà mạng</Typography>
        {hasPermission(PERMISSIONS.NETWORK_PLAN.ADD) && (
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

      {hasPermission(PERMISSIONS.NETWORK_PLAN.VIEW) ? (
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader aria-label="bảng gói dịch vụ nhà mạng">
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
                  <TableCell colSpan={9} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                data.networkPlan.map((row) => (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row._id || row.id}>
                    <TableCell>
                      {hasPermission(PERMISSIONS.NETWORK_PLAN.UPDATE) && (
                        <IconButton 
                          color="primary" 
                          onClick={() => handleEdit(row._id || row.id)}
                          size="small"
                        >
                          <IconEdit size={18} />
                        </IconButton>
                      )}
                      {hasPermission(PERMISSIONS.NETWORK_PLAN.DELETE) && (
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
                    <TableCell>{row.dataCapacityInGB} GB</TableCell>
                    <TableCell>{formatPrice(row.purchasePrice)}</TableCell>
                    <TableCell>{formatPrice(row.retailPrice)}</TableCell>
                    <TableCell>{row.validityInDays || 'Không giới hạn'} ngày</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          borderRadius: '5px',
                          textTransform: 'none',
                          fontWeight: 500,
                          boxShadow: 'none',
                          backgroundColor: row.esimSupported ? '#4caf50' : '#f44336',
                          '&:hover': {
                            backgroundColor: row.esimSupported ? '#4caf50' : '#f44336',
                          },
                        }}
                      >
                        {row.esimSupported ? 'Có' : 'Không'}
                      </Button>
                    </TableCell>
                    <TableCell>{row.supplierId?.name}</TableCell>
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
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            Bạn không có quyền xem danh sách gói dịch vụ nhà mạng
          </Typography>
        </Paper>
      )}

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
            Bạn có chắc chắn muốn xóa gói dịch vụ nhà mạng này không?
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