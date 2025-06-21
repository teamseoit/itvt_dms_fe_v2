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
  CircularProgress,
  Collapse
} from '@mui/material';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconChevronDown,
  IconChevronUp
} from '@tabler/icons-react';

import EMAIL_PLAN_API from '../../../services/plans/emailPlanService';
import usePermissions from '../../../hooks/usePermissions';
import { PERMISSIONS } from '../../../constants/permissions';
import { formatDateTime, formatPrice } from '../../../utils/formatConstants';

const columns = [
  { id: 'info', label: 'Chi tiết', minWidth: 80 },
  { id: 'actions', label: 'Thao tác', minWidth: 100 },
  { id: 'name', label: 'Tên gói', minWidth: 200 },
  { id: 'nameAction', label: 'Hành động', minWidth: 170 },
  { id: 'dvt', label: 'ĐVT', minWidth: 50 },
  { id: 'sl', label: 'SL', minWidth: 50 },
  { id: 'vat', label: 'VAT(%)', minWidth: 80 },
  { id: 'purchasePrice', label: 'Giá vốn', minWidth: 130 },
  { id: 'retailPrice', label: 'Giá bán', minWidth: 130 },
  { id: 'supplier', label: 'Nhà cung cấp', minWidth: 150 },
  { id: 'createdAt', label: 'Ngày tạo', minWidth: 180 }
];

export default function EmailPlanList() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    emailPlan: [],
    meta: {
      page: 1,
      limit: 10,
      totalDocs: 0,
      totalPages: 0
    }
  });

  const [openInfoId, setOpenInfoId] = useState(null);
  const { hasPermission } = usePermissions();

  const fetchEmailPlan = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const response = await EMAIL_PLAN_API.getAll({ page: pageNumber, limit: 10 });
      if (response.data.success) {
        setData({
          emailPlan: response.data.data,
          meta: response.data.meta
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách gói dịch vụ email');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmailPlan(page + 1);
  }, [page]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const toggleCollapse = (id) => {
    setOpenInfoId(prev => (prev === id ? null : id));
  };

  const handleAdd = () => {
    navigate('/goi-dich-vu/email/them-moi');
  };

  const handleEdit = (id) => {
    navigate(`/goi-dich-vu/email/${id}`);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setOpenDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      const response = await EMAIL_PLAN_API.delete(deleteId);
      if (response.data.success) {
        toast.success('Xóa gói dịch vụ email thành công');
        fetchEmailPlan(page + 1);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa gói dịch vụ email');
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
        <Typography variant="h3">Danh sách gói dịch vụ email</Typography>
        {hasPermission(PERMISSIONS.EMAIL_PLAN.ADD) && (
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

      {hasPermission(PERMISSIONS.EMAIL_PLAN.VIEW) ? (
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader aria-label="bảng gói dịch vụ email">
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
                data.emailPlan.map((row) => {
                  const isOpen = openInfoId === row._id;
                  return (
                    <>
                      <TableRow hover role="checkbox" tabIndex={-1} key={row._id || row.id}>
                        <TableCell>
                          <IconButton size="small"onClick={() => toggleCollapse(row._id)}>
                            {isOpen ? <IconChevronUp /> : <IconChevronDown />}
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          {hasPermission(PERMISSIONS.EMAIL_PLAN.UPDATE) && (
                            <IconButton 
                              color="primary" 
                              onClick={() => handleEdit(row._id || row.id)}
                              size="small"
                            >
                              <IconEdit size={18} />
                            </IconButton>
                          )}
                          {hasPermission(PERMISSIONS.EMAIL_PLAN.DELETE) && (
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
                        <TableCell>
                          {row.nameAction == 0 ? 'Đăng ký mới' : row.nameAction == 1 ? 'Duy trì' : 'Chuyển nhà đăng ký'}
                        </TableCell>
                        <TableCell>Tháng</TableCell>
                        <TableCell>1</TableCell>
                        <TableCell>{row.vat}%</TableCell>
                        <TableCell>{formatPrice(row.purchasePrice)}</TableCell>
                        <TableCell>{formatPrice(row.retailPrice)}</TableCell>
                        <TableCell>{row.supplierId?.name}</TableCell>
                        <TableCell>{formatDateTime(row.createdAt)}</TableCell>
      
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={columns.length}>
                          <Collapse in={isOpen} timeout="auto" unmountOnExit>
                            <Box margin={1}>
                              <Typography variant="subtitle1">Chi tiết chi phí gói dịch vụ email</Typography>
                              <Typography variant="body2">- Tổng giá vốn chưa VAT: {formatPrice(row.totalPurchaseWithoutVAT)} / năm</Typography>
                              <Typography variant="body2">- Tổng giá vốn đã VAT: {formatPrice(row.totalPurchaseWithVAT)} / năm</Typography>
                              <Typography variant="body2">- Tổng giá bán chưa VAT: {formatPrice(row.totalRetailWithoutVAT)} / năm</Typography>
                              <Typography variant="body2">- Tổng giá bán đã VAT: {formatPrice(row.totalRetailWithVAT)} / năm</Typography>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </>
                  )
                })
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
            Bạn không có quyền xem danh sách gói dịch vụ email
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
            Bạn có chắc chắn muốn xóa gói dịch vụ email này không?
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