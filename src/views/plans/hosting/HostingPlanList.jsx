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

import HOSTING_PLAN_API from '../../../services/plans/hostingPlanService';
import usePermissions from '../../../hooks/usePermissions';
import { PERMISSIONS } from '../../../constants/permissions';
import { formatDateTime, formatPrice } from '../../../utils/formatConstants';

const columns = [
  { id: 'actions', label: 'Thao tác', minWidth: 100 },
  { id: 'name', label: 'Tên gói', minWidth: 150 },
  { id: 'purchasePrice', label: 'Giá vốn', minWidth: 120 },
  { id: 'vat', label: 'VAT(%)', minWidth: 80 },
  { id: 'vatPrice', label: 'Giá đã VAT', minWidth: 120 },
  { id: 'totalPrice', label: 'Thành tiền', minWidth: 120 },
  { id: 'supplier', label: 'Nhà cung cấp', minWidth: 200 },
  { id: 'createdAt', label: 'Ngày tạo', minWidth: 150 }
];

export default function HostingPlanList() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    hostingPlan: [],
    meta: {
      page: 1,
      limit: 10,
      totalDocs: 0,
      totalPages: 0
    }
  });

  const { hasPermission } = usePermissions();

  const fetchHostingPlan = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const response = await HOSTING_PLAN_API.getAll({ page: pageNumber, limit: 10 });
      if (response.data.success) {
        setData({
          hostingPlan: response.data.data,
          meta: response.data.meta
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách gói dịch vụ hosting');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostingPlan(page + 1);
  }, [page]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleAdd = () => {
    navigate('/goi-dich-vu/hosting/them-moi');
  };

  const handleEdit = (id) => {
    navigate(`/goi-dich-vu/hosting/${id}`);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setOpenDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      const response = await HOSTING_PLAN_API.delete(deleteId);
      if (response.data.success) {
        toast.success('Xóa gói dịch vụ hosting thành công');
        fetchHostingPlan(page + 1);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa gói dịch vụ hosting');
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
        <Typography variant="h3">Danh sách gói dịch vụ hosting</Typography>
        {hasPermission(PERMISSIONS.HOSTING_PLAN.ADD) && (
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

      {hasPermission(PERMISSIONS.HOSTING_PLAN.VIEW) ? (
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader aria-label="bảng gói dịch vụ hosting">
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
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                data.hostingPlan.map((row) => (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row._id || row.id}>
                    <TableCell>
                      {hasPermission(PERMISSIONS.HOSTING_PLAN.UPDATE) && (
                        <IconButton 
                          color="primary" 
                          onClick={() => handleEdit(row._id || row.id)}
                          size="small"
                        >
                          <IconEdit size={18} />
                        </IconButton>
                      )}
                      {hasPermission(PERMISSIONS.HOSTING_PLAN.DELETE) && (
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
                    <TableCell>{formatPrice(row.purchasePrice)}</TableCell>
                    <TableCell>{row.vat}%</TableCell>
                    <TableCell>{formatPrice(row.vatPrice)}</TableCell>
                    <TableCell>{formatPrice(row.totalPrice)}</TableCell>
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
            Bạn không có quyền xem danh sách gói dịch vụ hosting
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
            Bạn có chắc chắn muốn xóa gói dịch vụ hosting này không?
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