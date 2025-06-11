import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTheme } from '@mui/material/styles';
import { useNavigate, Link } from 'react-router-dom';

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

import SERVER_SUPPLIER_API from '../../../services/serverSupplierService';
import usePermissions from '../../../hooks/usePermissions';
import { PERMISSIONS } from '../../../constants/permissions';
import { formatDateTime, extractDomain, maskPhoneNumber } from '../../../utils/formatConstants';

const columns = [
  { id: 'actions', label: 'Thao tác', minWidth: 100 },
  { id: 'name', label: 'Tên nhà cung cấp', minWidth: 130 },
  { id: 'company', label: 'Tên công ty', minWidth: 150 },
  { id: 'phone', label: 'Số điện thoại', minWidth: 150 },
  { id: 'website', label: 'Website', minWidth: 150 },
  { id: 'address', label: 'Địa chỉ', minWidth: 170 },
  { id: 'createdAt', label: 'Ngày tạo', minWidth: 150 }
];

export default function ServerSupplierList() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    serverSuppliers: [],
    meta: {
      page: 1,
      limit: 10,
      totalDocs: 0,
      totalPages: 0
    }
  });

  const { hasPermission } = usePermissions();

  const fetchServerSuppliers = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const response = await SERVER_SUPPLIER_API.getAll({ page: pageNumber, limit: 10 });
      if (response.data.success) {
        setData({
          serverSuppliers: response.data.data,
          meta: response.data.meta
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách nhà cung cấp server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServerSuppliers(page + 1);
  }, [page]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleAdd = () => {
    navigate('/ncc/server/them-moi');
  };

  const handleEdit = (id) => {
    navigate(`/ncc/server/${id}`);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setOpenDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      const response = await SERVER_SUPPLIER_API.delete(deleteId);
      if (response.data.success) {
        toast.success('Xóa nhà cung cấp server thành công');
        fetchServerSuppliers(page + 1);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa nhà cung cấp server');
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
        <Typography variant="h3">Danh sách nhà cung cấp server</Typography>
        {hasPermission(PERMISSIONS.SERVER_SUPPLIER.ADD) && (
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

      {hasPermission(PERMISSIONS.SERVER_SUPPLIER.VIEW) ? (
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader aria-label="bảng server">
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
                data.serverSuppliers.map((row) => (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row._id || row.id}>
                    <TableCell>
                      {hasPermission(PERMISSIONS.SERVER_SUPPLIER.UPDATE) && (
                        <IconButton 
                          color="primary" 
                          onClick={() => handleEdit(row._id || row.id)}
                          size="small"
                        >
                          <IconEdit size={18} />
                        </IconButton>
                      )}
                      {hasPermission(PERMISSIONS.SERVER_SUPPLIER.DELETE) && (
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
                    <TableCell>{row.company}</TableCell>
                    <TableCell>{maskPhoneNumber(row.phone)}</TableCell>
                    <TableCell>
                      <Link to={row.website} target="_blank" rel="noopener noreferrer">
                        {extractDomain(row.website)}
                      </Link>
                    </TableCell>
                    <TableCell
                      sx={{
                        maxWidth: 170,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {row.address}
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
      ) : (
        <Typography variant="h4">Bạn không có quyền xem danh sách nhà cung cấp server!</Typography>
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
            Bạn có chắc chắn muốn xóa nhà cung cấp dịch vụ server này không?
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