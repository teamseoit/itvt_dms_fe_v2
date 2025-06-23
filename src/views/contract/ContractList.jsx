import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import {
  Box,
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  Chip,
} from '@mui/material';
import { IconEdit, IconTrash, IconSearch } from '@tabler/icons-react';

import CONTRACT_API from '../../services/contractService';
import usePermissions from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../constants/permissions';
import { formatDateTime, maskPhoneNumber, formatPrice } from '../../utils/formatConstants';

const ROWS_PER_PAGE = 30;
const SEARCH_DELAY = 500;
const MIN_SEARCH_LENGTH = 3;

const columns = [
  { id: 'actions', label: 'Thao tác', minWidth: 100 },
  { id: 'contractCode', label: 'Mã hợp đồng', minWidth: 150 },
  { id: 'customer', label: 'Khách hàng', minWidth: 280 },
  { id: 'totalAmount', label: 'Tổng tiền', minWidth: 180 },
  { id: 'amountPaid', label: 'Đã thanh toán', minWidth: 150 },
  { id: 'amountRemaining', label: 'Còn lại', minWidth: 150 },
  { id: 'status', label: 'Trạng thái', minWidth: 150 },
  { id: 'createdAt', label: 'Ngày tạo', minWidth: 180 }
];

const SearchField = ({ value, onChange }) => (
  <TextField
    variant="outlined"
    placeholder="Tìm theo mã hợp đồng hoặc tên khách hàng"
    value={value}
    onChange={onChange}
    size="small"
    sx={{
      width: '350px',
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
);

const DeleteConfirmDialog = ({ open, onClose, onConfirm }) => (
  <Dialog
    open={open}
    onClose={onClose}
    aria-labelledby="dialog-title"
    aria-describedby="dialog-description"
  >
    <DialogTitle id="dialog-title">
      Xác nhận xóa
    </DialogTitle>
    <DialogContent>
      <DialogContentText id="dialog-description">
        Bạn có chắc chắn muốn xóa hợp đồng này không?
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary">
        Hủy
      </Button>
      <Button onClick={onConfirm} color="error" autoFocus>
        Xóa
      </Button>
    </DialogActions>
  </Dialog>
);

export default function ContractList() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const warningToastId = useRef(null);

  const [page, setPage] = useState(0);
  const [deleteId, setDeleteId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isWarned, setIsWarned] = useState(false);
  const [data, setData] = useState({
    contracts: [],
    meta: {
      page: 1,
      limit: ROWS_PER_PAGE,
      totalDocs: 0,
      totalPages: 0
    }
  });

  const fetchContracts = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const response = await CONTRACT_API.getAll({ 
        page: pageNumber, 
        limit: ROWS_PER_PAGE, 
        keyword: debouncedSearchTerm 
      });
      
      if (response.data.success) {
        setData({
          contracts: response.data.data,
          meta: response.data.meta
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleEdit = (id) => {
    navigate(`/hop-dong/${id}`);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setOpenDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      const response = await CONTRACT_API.delete(deleteId);
      if (response.data.success) {
        toast.success('Xóa hợp đồng thành công');
        await fetchContracts(page + 1);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa hợp đồng');
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

    if (value.length < MIN_SEARCH_LENGTH) {
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
      if (searchTerm.length >= MIN_SEARCH_LENGTH || searchTerm.length === 0) {
        setDebouncedSearchTerm(searchTerm);
      }
    }, SEARCH_DELAY);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  useEffect(() => {
    fetchContracts(page + 1);
  }, [page, debouncedSearchTerm]);

  const renderTableContent = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={4} align="center">
            <CircularProgress />
          </TableCell>
        </TableRow>
      );
    }

    return data.contracts.map((row) => (
      <TableRow hover role="checkbox" tabIndex={-1} key={row._id || row.id}>
        <TableCell>
          {hasPermission(PERMISSIONS.CONTRACT.UPDATE) && (
            <IconButton 
              color="primary" 
              onClick={() => handleEdit(row._id || row.id)}
              size="small"
            >
              <IconEdit size={18} />
            </IconButton>
          )}
          {hasPermission(PERMISSIONS.CONTRACT.DELETE) && (
            <IconButton 
              color="error" 
              onClick={() => handleDeleteClick(row._id || row.id)}
              size="small"
            >
              <IconTrash size={18} />
            </IconButton>
          )}
        </TableCell>
        <TableCell>{row.contractCode}</TableCell>
        <TableCell>{row.customer?.fullName} / {maskPhoneNumber(row.customer?.phoneNumber)}</TableCell>
        <TableCell>{formatPrice(row.financials.totalAmount)}</TableCell>
        <TableCell>{formatPrice(row.financials.amountPaid)}</TableCell>
        <TableCell>{formatPrice(row.financials.amountRemaining)}</TableCell>
        <TableCell>
          {row.financials.isFullyPaid ? (
            <Chip label="Đã thanh toán" color="success" />
          ) : (
            <Chip label="Chưa thanh toán" color="error" />
          )}  
        </TableCell>
        <TableCell>{formatDateTime(row.createdAt)}</TableCell>
      </TableRow>
    ));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Danh sách hợp đồng</Typography>
        <SearchField value={searchTerm} onChange={handleSearchChange} />
      </Box>

      {hasPermission(PERMISSIONS.CONTRACT.VIEW) ? (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table stickyHeader aria-label="bảng hợp đồng">
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
                {renderTableContent()}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={data.meta.totalDocs}
            rowsPerPage={ROWS_PER_PAGE}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPageOptions={[]}
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} trên ${count}`}
          />
        </Paper>
      ) : (
        <Typography variant="h4">Bạn không có quyền xem danh sách hợp đồng!</Typography>
      )}

      <DeleteConfirmDialog
        open={openDialog}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
    </Box>
  );
}