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
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';

import DOMAIN_PLAN_API from '../../../services/plans/domainPlanService';
import usePermissions from '../../../hooks/usePermissions';
import { PERMISSIONS } from '../../../constants/permissions';
import { formatDateTime, formatPrice } from '../../../utils/formatConstants';

const columns = [
  { id: 'actions', label: 'Thao tác', minWidth: 100 },
  { id: 'extension', label: 'Đuôi tên miền', minWidth: 140 },
  { id: 'nameAction', label: 'Hàng động', minWidth: 180 },
  { id: 'purchasePrice', label: 'Giá vốn', minWidth: 300 },
  { id: 'retailPrice', label: 'Giá bán', minWidth: 160 },
  { id: 'vat', label: 'VAT(%)', minWidth: 80 },
  { id: 'supplier', label: 'Nhà cung cấp', minWidth: 160 },
  { id: 'createdAt', label: 'Ngày tạo', minWidth: 200 }
];

export default function DomainPlanList() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState({
    domainPlan: [],
    meta: {
      page: 1,
      limit: 10,
      totalDocs: 0,
      totalPages: 0
    }
  });

  const { hasPermission } = usePermissions();

  const fetchDomainPlan = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const response = await DOMAIN_PLAN_API.getAll({ page: pageNumber, limit: 10, nameAction: searchTerm });
      if (response.data.success) {
        setData({
          domainPlan: response.data.data,
          meta: response.data.meta
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách gói dịch vụ tên miền');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomainPlan(page + 1);
  }, [page, searchTerm]);

  const handleChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleAdd = () => {
    navigate('/goi-dich-vu/ten-mien/them-moi');
  };

  const handleEdit = (id) => {
    navigate(`/goi-dich-vu/ten-mien/${id}`);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setOpenDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      const response = await DOMAIN_PLAN_API.delete(deleteId);
      if (response.data.success) {
        toast.success('Xóa gói dịch vụ tên miền thành công');
        fetchDomainPlan(page + 1);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa gói dịch vụ tên miền');
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
        <Typography variant="h3">Danh sách gói dịch vụ tên miền</Typography>
        {hasPermission(PERMISSIONS.DOMAIN_PLAN.ADD) && (
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
      {hasPermission(PERMISSIONS.DOMAIN_PLAN.VIEW) ? (
        <>
          <FormControl sx={{ mb: 3, width: '200px', backgroundColor: 'white', borderRadius: '10px' }}>
            <InputLabel id="action-type-label">Hành động</InputLabel>
            <Select
              labelId="action-type-label"
              id="action-type-select" 
              name="nameAction"
              value={searchTerm}
              onChange={handleChange}
              label="Hành động"
            >
              <MenuItem value="">Tất cả</MenuItem>
              {[
                { value: "0", label: "Đăng ký mới" },
                { value: "1", label: "Duy trì" }, 
                { value: "2", label: "Chuyển nhà đăng ký" }
              ].map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer>
              <Table stickyHeader aria-label="bảng gói dịch vụ tên miền">
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
                    data.domainPlan.map((row) => (
                      <TableRow hover role="checkbox" tabIndex={-1} key={row._id || row.id}>
                        <TableCell>
                          {hasPermission(PERMISSIONS.DOMAIN_PLAN.UPDATE) && (
                            <IconButton 
                              color="primary" 
                              onClick={() => handleEdit(row._id || row.id)}
                              size="small"
                            >
                              <IconEdit size={18} />
                            </IconButton>
                          )}
                          {hasPermission(PERMISSIONS.DOMAIN_PLAN.DELETE) && (
                            <IconButton 
                              color="error" 
                              onClick={() => handleDeleteClick(row._id || row.id)}
                              size="small"
                            >
                              <IconTrash size={18} />
                            </IconButton>
                          )}
                        </TableCell>
                        <TableCell>{row.extension}</TableCell>
                        <TableCell>
                          {row.nameAction == 0 ? 'Đăng ký mới' : row.nameAction == 1 ? 'Duy trì' : 'Chuyển nhà đăng ký'}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1" fontWeight={600}>
                            {formatPrice(row.purchasePrice)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {row.vat > 0 ? `Giá đã bao gồm VAT: ${formatPrice(row.vatPrice)}` : `Giá chưa bao gồm VAT: ${formatPrice(row.purchasePrice)}`}
                          </Typography>
                        </TableCell>
                        <TableCell>{formatPrice(row.retailPrice)}</TableCell>
                        <TableCell>{row.vat}%</TableCell>
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
        </>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            Bạn không có quyền xem danh sách gói dịch vụ tên miền
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
            Bạn có chắc chắn muốn xóa gói dịch vụ tên miền này không?
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