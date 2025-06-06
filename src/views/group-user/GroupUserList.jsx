import { useState } from 'react';

import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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

import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';

const createData = (id, name, description, createdAt, updatedAt) => ({
  id,
  name,
  description,
  createdAt
});

const rows = [
  createData(1, 'Admin Group', 'Administrators', '2024-01-01'),
  createData(2, 'User Group', 'Regular users', '2024-01-01'),
  createData(3, 'Manager Group', 'Managers', '2024-01-01'),
];

const columns = [
  { id: 'actions', label: 'Thao tác', minWidth: 100 },
  { id: 'name', label: 'Tên nhóm', minWidth: 170 },
  { id: 'description', label: 'Mô tả', minWidth: 200 },
  { id: 'createdAt', label: 'Ngày tạo', minWidth: 150 }
];

export default function GroupUserList() {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleAdd = () => {
    console.log('Add new group');
  };

  const handleEdit = (id) => {
    console.log('Edit group', id);
  };

  const handleDelete = (id) => {
    console.log('Delete group', id);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h3">Danh sách nhóm quyền</Typography>
        <Button
          variant="contained"
          startIcon={<IconPlus />}
          onClick={handleAdd}
          sx={{ backgroundColor: theme.palette.primary.main }}
        >
          Thêm mới
        </Button>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
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
              {rows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                    <TableCell>
                      <IconButton 
                        color="primary" 
                        onClick={() => handleEdit(row.id)}
                        size="small"
                      >
                        <IconEdit size={18} />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDelete(row.id)}
                        size="small"
                      >
                        <IconTrash size={18} />
                      </IconButton>
                    </TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.description}</TableCell>
                    <TableCell>{row.createdAt}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}