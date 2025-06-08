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
  TextField,
  InputAdornment
} from '@mui/material';

import { IconPlus, IconEdit, IconTrash, IconSearch } from '@tabler/icons-react';

import CUSTOMER_API from '../../services/customerService';
import ROLE_API from '../../services/roleService';
import { formatDateTime, maskPhoneNumber } from '../../utils/formatConstants';  

const columns = [
  { id: 'actions', label: 'Thao tác', minWidth: 60 },
  { id: 'fullName', label: 'Tên khách hàng / Số điện thoại', minWidth: 180 },
  { id: 'email', label: 'Email', minWidth: 130 },
  { id: 'gender', label: 'Giới tính', minWidth: 60 },
  { id: 'address', label: 'Địa chỉ', minWidth: 220 },
  { id: 'type', label: 'Loại khách hàng', minWidth: 150 },
  { id: 'createdAt', label: 'Ngày tạo', minWidth: 130 }
];

const PERMISSIONS = {
  ADD: '667463d04bede188dfb46d7e',
  UPDATE: '667463d04bede188dfb46d7f',
  DELETE: '667463d04bede188dfb46b7f'
};

export default function CustomerList() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [data, setData] = useState({
    customers: [],
    meta: {
      page: 1,
      limit: 10,
      totalDocs: 0,
      totalPages: 0
    }
  });

  const [typeFilter, setTypeFilter] = useState('');
  const [counts, setCounts] = useState({ all: 0, personal: 0, business: 0 });

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isWarned, setIsWarned] = useState(false);
  const warningToastId = useRef(null);

  const fetchPermissions = async () => {
    try {
      const response = await ROLE_API.getRoles();
      if (response.data.success) {
        setPermissions(response.data.data || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách khách hàng');
    }
  };
  
  const hasPermission = (permissionId) => {
    return permissions.some(permission => permission.permission_id === permissionId);
  };

  const fetchCounts = async () => {
    try {
      const [all, personal, business] = await Promise.all([
        CUSTOMER_API.getAll({ page: 1, limit: 1 }),
        CUSTOMER_API.getAll({ page: 1, limit: 1, typeCustomer: false }),
        CUSTOMER_API.getAll({ page: 1, limit: 1, typeCustomer: true })
      ]);
      setCounts({
        all: all.data.meta.totalDocs,
        personal: personal.data.meta.totalDocs,
        business: business.data.meta.totalDocs
      });
    } catch (err) {
      console.error('Lỗi lấy thống kê khách hàng:', err);
      toast.error('Có lỗi xảy ra khi lấy thống kê khách hàng');
    }
  };

  const fetchCustomers = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const response = await CUSTOMER_API.getAll({
        page: pageNumber,
        limit: 10,
        typeCustomer: typeFilter,
        keyword: debouncedSearchTerm
      });

      if (response.data.success) {
        setData({
          customers: response.data.data,
          meta: response.data.meta
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setPage(0);
  
    if (value.length === 0) {
      setIsWarned(false);
      if (warningToastId.current) {
        toast.dismiss(warningToastId.current);
        warningToastId.current = null;
      }
      return;
    }
  
    if (value.length < 3) {
      if (!isWarned) {
        warningToastId.current = toast.warning('Từ khóa tìm kiếm phải có ít nhất 3 ký tự');
        setIsWarned(true);
      }
    } else {
      setIsWarned(false);
      if (warningToastId.current) {
        toast.dismiss(warningToastId.current);
        warningToastId.current = null;
      }
    }
  };
  
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.length >= 3 || searchTerm.length === 0) {
        setDebouncedSearchTerm(searchTerm);
      }
    }, 500);
  
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);
  

  useEffect(() => {
    fetchCustomers(page + 1);
  }, [page, typeFilter, debouncedSearchTerm]);  
  
  useEffect(() => {
    fetchCounts();
    fetchPermissions();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleAdd = () => {
    navigate('/khach-hang/them-moi');
  };

  const handleEdit = (id) => {
    navigate(`/khach-hang/${id}`);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setOpenDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      const response = await CUSTOMER_API.delete(deleteId);
      if (response.data.success) {
        toast.success('Xóa khách hàng thành công');
        await fetchCustomers(page + 1);
        await fetchCounts();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa khách hàng');
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
        <Typography variant="h3">Danh sách khách hàng</Typography>
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

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant={typeFilter === null ? 'contained' : 'outlined'}
            size="small"
            onClick={() => { setPage(0); setTypeFilter(null); }}
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
            variant={typeFilter === false ? 'contained' : 'outlined'}
            size="small"
            onClick={() => { setPage(0); setTypeFilter(false); }}
          >
            Cá nhân: {counts.personal}
          </Button>
          <Button
            variant={typeFilter === true ? 'contained' : 'outlined'}
            size="small"
            onClick={() => { setPage(0); setTypeFilter(true); }}
          >
            Doanh nghiệp: {counts.business}
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
          <Table stickyHeader aria-label="bảng khách hàng">
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
                data.customers.map((row) => (
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
                    <TableCell>{row.fullName}<br/>{maskPhoneNumber(row.phoneNumber)}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.gender === 0 ? 'Nam' : 'Nữ'}</TableCell>
                    <TableCell
                      sx={{
                        maxWidth: 220,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {row.address}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          borderRadius: '5px',
                          textTransform: 'none',
                          fontWeight: 500,
                          boxShadow: 'none',
                          backgroundColor: row.typeCustomer === true ? '#fbe581' : '#52e575',
                          color: '#000000',
                          '&:hover': {
                            backgroundColor: row.typeCustomer === true ? '#fbe581' : '#52e575',
                            color: '#000000',
                          },
                        }}
                      >
                        {row.typeCustomer === true ? 'Doanh nghiệp' : 'Cá nhân'}
                      </Button>
                    </TableCell>
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
            Bạn có chắc chắn muốn xóa khách hàng này không?
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