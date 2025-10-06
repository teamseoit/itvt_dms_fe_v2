import { useState, useEffect, useRef } from 'react';
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
  Chip,
  Collapse,
  TextField,
  InputAdornment
} from '@mui/material';
import { IconPlus, IconEdit, IconTrash, IconChevronUp, IconChevronDown, IconSearch } from '@tabler/icons-react';

import EMAIL_SERVICE_API from '../../../services/services/emailService';
import usePermissions from '../../../hooks/usePermissions';
import { PERMISSIONS } from '../../../constants/permissions';
import { formatDateTime, formatDate, formatPrice, maskPhoneNumber } from '../../../utils/formatConstants';

const columns = [
  { id: 'info', label: 'Chi tiết', minWidth: 80 },
  { id: 'actions', label: 'Thao tác', minWidth: 100 },
  { id: 'name', label: 'Tên dịch vụ', minWidth: 200 },
  { id: 'registeredAt', label: 'Ngày đăng ký', minWidth: 130 },
  { id: 'expiredAt', label: 'Ngày hết hạn', minWidth: 130 },
  { id: 'periodValue', label: 'Thời hạn', minWidth: 100 },
  { id: 'totalPrice', label: 'Tổng tiền', minWidth: 150 },
  { id: 'status', label: 'Trạng thái', minWidth: 220 },
  { id: 'createdAt', label: 'Ngày tạo', minWidth: 180 }
];

export default function EmailServiceList() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    domainServices: [],
    meta: {
      page: 1,
      limit: 10,
      totalDocs: 0,
      totalPages: 0
    }
  });

  const [openInfoId, setOpenInfoId] = useState(null);
  const { hasPermission } = usePermissions();
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [counts, setCounts] = useState({ all: 0, nearExpired: 0, expired: 0 });

  // Search
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const debounceTimerRef = useRef(null);

  const fetchHostingServices = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const params = {
        page: pageNumber,
        limit: 10,
        ...(debouncedSearchTerm ? { keyword: debouncedSearchTerm } : {}),
        ...(statusFilter === '' || statusFilter === null || typeof statusFilter === 'undefined' ? {} : { status: statusFilter })
      };
      const response = await EMAIL_SERVICE_API.getAll(params);
      if (response.data.success) {
        setData({
          domainServices: response.data.data,
          meta: response.data.meta
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách dịch vụ Email');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostingServices(page + 1);
  }, [page, statusFilter, debouncedSearchTerm]);

  // Debounce search input
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setPage(0);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchTerm(value);
    }, 500);
  };

  // Fetch counts for status filters
  const fetchCounts = async () => {
    try {
      const [all, nearExpired, expired] = await Promise.all([
        EMAIL_SERVICE_API.getAll({ page: 1, limit: 1 }),
        EMAIL_SERVICE_API.getAll({ page: 1, limit: 1, status: 2 }),
        EMAIL_SERVICE_API.getAll({ page: 1, limit: 1, status: 3 })
      ]);
      setCounts({
        all: all.data.meta?.totalDocs || 0,
        nearExpired: nearExpired.data.meta?.totalDocs || 0,
        expired: expired.data.meta?.totalDocs || 0
      });
    } catch (err) {
      // Non-blocking
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const toggleCollapse = (id) => {
    setOpenInfoId(prev => (prev === id ? null : id));
  };

  const handleAdd = () => {
    navigate('/dich-vu/email/them-moi');
  };

  const handleEdit = (id) => {
    navigate(`/dich-vu/email/${id}`);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setOpenDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      const response = await EMAIL_SERVICE_API.delete(deleteId);
      if (response.data.success) {
        toast.success('Xóa dịch vụ Email thành công');
        fetchHostingServices(page + 1);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa dịch vụ Email');
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

  const getStatusText = (status, statusText) => {
    switch (status) {
      case 1:
        return statusText;
      case 2:
        return statusText;
      case 3:
        return statusText;
      default:
        return '';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 1:
        return '#4caf50';
      case 2:
        return '#ff9800';
      case 3:
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const getIpAddress = (serverPlan) => {
    if (!serverPlan) return 'N/A';
    
    if (serverPlan.ipAddress && Array.isArray(serverPlan.ipAddress) && serverPlan.ipAddress.length > 0) {
      return serverPlan.ipAddress[0];
    }
    
    if (typeof serverPlan === 'string') {
      return 'N/A';
    }
    
    return 'N/A';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h3">Danh sách dịch vụ Email</Typography>
        {hasPermission(PERMISSIONS.EMAIL_SERVICE.ADD) && (
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

      {hasPermission(PERMISSIONS.EMAIL_SERVICE.VIEW) ? (
      <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant={statusFilter === '' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => { setPage(0); setStatusFilter(''); }}
            sx={{
              borderRadius: '5px',
              textTransform: 'none',
              fontWeight: 500,
              boxShadow: 'none',
            }}
          >
            Tất cả: {counts.all}
          </Button>
          <Button
            variant={statusFilter === 2 ? 'contained' : 'outlined'}
            size="small"
            onClick={() => { setPage(0); setStatusFilter(2); }}
            sx={{
              borderRadius: '5px',
              textTransform: 'none',
              fontWeight: 500,
              boxShadow: 'none',
              ...(statusFilter === 2
                ? { backgroundColor: '#ff9800', color: '#fff', '&:hover': { backgroundColor: '#ff9800' } }
                : { color: '#ff9800', borderColor: '#ff9800' })
            }}
          >
            Sắp hết hạn: {counts.nearExpired}
          </Button>
          <Button
            variant={statusFilter === 3 ? 'contained' : 'outlined'}
            size="small"
            onClick={() => { setPage(0); setStatusFilter(3); }}
            sx={{
              borderRadius: '5px',
              textTransform: 'none',
              fontWeight: 500,
              boxShadow: 'none',
              ...(statusFilter === 3
                ? { backgroundColor: '#f44336', color: '#fff', '&:hover': { backgroundColor: '#f44336' } }
                : { color: '#f44336', borderColor: '#f44336' })
            }}
          >
            Hết hạn: {counts.expired}
          </Button>
        </Box>

        <Box>
          <TextField
            variant="outlined"
            placeholder="Tìm theo tên hoặc số điện thoại"
            value={searchTerm}
            onChange={handleSearchChange}
            size="small"
            sx={{
              width: '300px',
              backgroundColor: '#fff',
              borderRadius: '10px',
              borderColor: '#ccc',
              boxShadow: 'none',
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconSearch size={18} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader aria-label="bảng dịch vụ Email">
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
                  <TableCell colSpan={10} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                data.domainServices.map((row) => {
                  const isOpen = openInfoId === row._id;
                  return (
                    <>
                      <TableRow hover role="checkbox" tabIndex={-1} key={row._id || row.id}>
                        <TableCell>
                          <IconButton size="small" onClick={() => toggleCollapse(row._id)}>
                            {isOpen ? <IconChevronUp /> : <IconChevronDown />}
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          {hasPermission(PERMISSIONS.EMAIL_SERVICE.UPDATE) && (
                            <IconButton 
                              color="primary" 
                              onClick={() => handleEdit(row._id || row.id)}
                              size="small"
                            >
                              <IconEdit size={18} />
                            </IconButton>
                          )}
                          {hasPermission(PERMISSIONS.EMAIL_SERVICE.DELETE) && (
                            <IconButton 
                              color="error" 
                              onClick={() => handleDeleteClick(row._id || row.id)}
                              size="small"
                            >
                              <IconTrash size={18} />
                            </IconButton>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1">Tên miền: {row.domainServiceId.name}</Typography>
                          <Typography variant="body1">Gói Email: {row.emailPlanId.name}</Typography>
                        </TableCell>
                        <TableCell>{row.registeredAt ? formatDate(row.registeredAt) : 'N/A'}</TableCell>
                        <TableCell>{row.expiredAt ? formatDate(row.expiredAt) : 'N/A'}</TableCell>
                        <TableCell>{row.periodValue} {row.periodUnit}</TableCell>
                        <TableCell>{formatPrice(row.totalPrice)}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            size="small"
                            sx={{
                              borderRadius: '5px',
                              textTransform: 'none',
                              fontWeight: 500,
                              boxShadow: 'none',
                              backgroundColor: getStatusColor(row.status),
                              '&:hover': {
                                backgroundColor: getStatusColor(row.status),
                              },
                            }}
                          >
                            {getStatusText(row.status, row.statusText)}
                          </Button>
                        </TableCell>
                        <TableCell>{formatDateTime(row.createdAt)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={columns.length}>
                          <Collapse in={isOpen} timeout="auto" unmountOnExit>
                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                              <Box margin={1} sx={{ flex: 1 }}>
                                <Typography variant="subtitle1">Chi tiết dịch vụ Email</Typography>
                                <Typography variant="body2">- Khách hàng: {row.customerId?.fullName} / {maskPhoneNumber(row.customerId?.phoneNumber)}</Typography>
                                <Typography variant="body2">- Địa chỉ IP: {getIpAddress(row.serverPlanId)}</Typography>
                                <Typography variant="body2">- Xuất VAT: {row.vatIncluded ? 'Có' : 'Không'}</Typography>
                                <Typography variant="body2">- Tổng giá nhập {row.vatIncluded ? 'Có' : 'Không'} VAT: {formatPrice(row.vatPrice)} / {row.periodValue} năm</Typography>
                              </Box>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </>
                  );
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
      </>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            Bạn không có quyền xem danh sách dịch vụ Email
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
            Bạn có chắc chắn muốn xóa dịch vụ Email này không?
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