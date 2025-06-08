import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTheme } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
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

import ACTION_LOG_API from '../../services/actionLogService';
import { formatDateTime } from '../../utils/formatConstants';

const columns = [
  { id: 'actions', label: 'Nguồn thông báo', minWidth: 100 },
  { id: 'content', label: 'Nội dung thông báo', minWidth: 160 },
  { id: 'createdAt', label: 'Ngày tạo', minWidth: 150 }
];

export default function ActionLogList() {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    actionLogs: [],
    meta: {
      page: 1,
      limit: 30,
      totalDocs: 0,
      totalPages: 0
    }
  });

  const fetchActionLogs = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const response = await ACTION_LOG_API.getAll({ page: pageNumber, limit: 30 });
      if (response.data.success) {
        setData({
          actionLogs: response.data.data,
          meta: response.data.meta
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách lịch sử thao tác');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActionLogs(page + 1);
  }, [page]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h3">Lịch sử thao tác</Typography>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader aria-label="bảng tài khoản">
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
                data.actionLogs.map((row) => (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row._id || row.id}>
                    <TableCell>Scloud.vn</TableCell>
                    <TableCell>
                      Tài khoản {row.user_id.display_name} đã {row.action} {row.object}
                      {row.link && (
                        <>
                          {' - '}
                          <Link to={row.link}>Xem chi tiết</Link>
                        </>
                      )}
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
          rowsPerPage={30}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[]}
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} trên ${count}`}
        />
      </Paper>
    </Box>
  );
}