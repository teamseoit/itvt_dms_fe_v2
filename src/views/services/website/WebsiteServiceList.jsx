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

import WEBSITE_SERVICE_API from '../../../services/services/websiteService';
import usePermissions from '../../../hooks/usePermissions';
import { PERMISSIONS } from '../../../constants/permissions';
import { formatDateTime, formatDate, formatPrice, maskPhoneNumber } from '../../../utils/formatConstants';

const columns = [
  { id: 'actions', label: 'Thao tác', minWidth: 100 },
  { id: 'domain', label: 'Tên miền', minWidth: 120 },
  { id: 'customer', label: 'Khách hàng', minWidth: 150 },
  { id: 'price', label: 'Giá', minWidth: 150 },
  { id: 'createdAt', label: 'Ngày tạo', minWidth: 130 },
  { id: 'status', label: 'Trạng thái', minWidth: 220 },
];

export default function WebsiteServiceList() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    websiteServices: [],
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
  const [statusFilter, setStatusFilter] = useState(''); // 1: all, 2: expired
  const [counts, setCounts] = useState({ all: 0, expired: 0 });

  // Search
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const debounceTimerRef = useRef(null);

  const fetchWebsiteServices = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const params = {
        page: pageNumber,
        limit: 10,
        ...(debouncedSearchTerm ? { keyword: debouncedSearchTerm } : {}),
        ...(statusFilter === '' || statusFilter === null || typeof statusFilter === 'undefined' ? {} : { status: statusFilter })
      };
      const response = await WEBSITE_SERVICE_API.getAll(params);
      if (response.data.success) {
        setData({
          websiteServices: response.data.data,
          meta: response.data.meta
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách dịch vụ website');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsiteServices(page + 1);
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
      const [all, expired] = await Promise.all([
        WEBSITE_SERVICE_API.getAll({ page: 1, limit: 1 }),
        WEBSITE_SERVICE_API.getAll({ page: 1, limit: 1, status: 2 })
      ]);
      setCounts({
        all: all.data.meta?.totalDocs || 0,
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

  const handleAdd = () => {
    navigate('/dich-vu/thiet-ke-website/them-moi');
  };

  const handleEdit = (id) => {
    navigate(`/dich-vu/thiet-ke-website/${id}`);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setOpenDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      const response = await WEBSITE_SERVICE_API.delete(deleteId);
      if (response.data.success) {
        toast.success('Xóa dịch vụ website thành công');
        fetchWebsiteServices(page + 1);
        fetchCounts();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa dịch vụ website');
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

  const getStatusText = (status) => {
    switch (status) {
      case 1:
        return 'Đang hoạt động';
      case 2:
        return 'Đã đóng';
      default:
        return '';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 1:
        return '#4caf50';
      case 2:
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h3">Danh sách dịch vụ website</Typography>
        {hasPermission(PERMISSIONS.WEBSITE_SERVICE.ADD) && (
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

      {hasPermission(PERMISSIONS.WEBSITE_SERVICE.VIEW) ? (
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
                 ? { backgroundColor: '#f44336', color: '#fff', '&:hover': { backgroundColor: '#f44336' } }
                 : { color: '#f44336', borderColor: '#f44336' })
             }}
           >
             Đã đóng: {counts.expired}
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
          <Table stickyHeader aria-label="bảng dịch vụ website">
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
                data.websiteServices.map((row) => {
                  return (
                    <>
                      <TableRow hover role="checkbox" tabIndex={-1} key={row._id || row.id}>
                        <TableCell>
                          {hasPermission(PERMISSIONS.WEBSITE_SERVICE.UPDATE) && (
                            <IconButton 
                              color="primary" 
                              onClick={() => handleEdit(row._id || row.id)}
                              size="small"
                            >
                              <IconEdit size={18} />
                            </IconButton>
                          )}
                          {hasPermission(PERMISSIONS.WEBSITE_SERVICE.DELETE) && (
                            <IconButton 
                              color="error" 
                              onClick={() => handleDeleteClick(row._id || row.id)}
                              size="small"
                            >
                              <IconTrash size={18} />
                            </IconButton>
                          )}
                        </TableCell>
                         <TableCell>{row.domainServiceId?.name || 'N/A'}</TableCell>
                         <TableCell>{row.customerId?.fullName} / {maskPhoneNumber(row.customerId?.phoneNumber)}</TableCell>
                         <TableCell>{formatPrice(row.price)}</TableCell>
                         <TableCell>{row.createdAt ? formatDate(row.createdAt) : 'N/A'}</TableCell>
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
                            {getStatusText(row.status)}
                          </Button>
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
            Bạn không có quyền xem danh sách dịch vụ website
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
            Bạn có chắc chắn muốn xóa dịch vụ website này không?
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
