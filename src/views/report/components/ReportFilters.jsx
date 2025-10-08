import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Autocomplete,
  TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';
import REPORT_API from '../../../services/reportService';

const ReportFilters = ({ onFilterChange, loading }) => {
  const [services, setServices] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedYears, setSelectedYears] = useState([new Date().getFullYear().toString()]);
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      setError(null);
      
      const [servicesResponse, yearsResponse] = await Promise.all([
        REPORT_API.getServices(),
        REPORT_API.getExpenseReportYears()
      ]);

      setServices(servicesResponse.data);
      setYears(yearsResponse.data);
      
      // Set default selected services (all services)
      setSelectedServices(servicesResponse.data.map(service => service.id));
      // Set default selected years (current year)
      setSelectedYears([new Date().getFullYear().toString()]);
    } catch (err) {
      console.error('Lỗi tải dữ liệu:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoadingData(false);
    }
  };

  const handleServiceChange = (event, newValue) => {
    setSelectedServices(newValue ? newValue.map(service => service.id) : []);
  };

  const handleYearChange = (event, newValue) => {
    setSelectedYears(newValue || []);
  };

  const handleMonthChange = (event, newValue) => {
    setSelectedMonths(newValue || []);
  };

  const handleApplyFilter = () => {
    const filters = {
      year: selectedYears,
      months: selectedMonths.length > 0 ? selectedMonths : undefined,
      services: selectedServices
    };
    
    onFilterChange(filters);
  };

  const handleResetFilter = () => {
    setSelectedServices(services.map(service => service.id));
    setSelectedYears([new Date().getFullYear().toString()]);
    setSelectedMonths([]);
    
    const filters = {
      year: [new Date().getFullYear().toString()],
      months: undefined,
      services: services.map(service => service.id)
    };
    
    onFilterChange(filters);
  };

  const getMonthName = (monthNumber) => {
    const months = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    return months[monthNumber - 1];
  };

  if (loadingData) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Đang tải dữ liệu...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Bộ lọc báo cáo
        </Typography>
        
        <Box display="flex" mt={3} gap={2} alignItems="flex-end" flexWrap="wrap">
          {/* Dịch vụ */}
          <Box sx={{ minWidth: 300, flex: '1 1 300px' }}>
            <Autocomplete
              multiple
              options={services}
              getOptionLabel={(option) => option.name}
              value={services.filter(service => selectedServices.includes(service.id))}
              onChange={handleServiceChange}
              limitTags={3}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option.id}
                    label={option.name}
                    size="small"
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Dịch vụ"
                  placeholder="Chọn dịch vụ"
                />
              )}
            />
          </Box>

          {/* Năm */}
          <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
            <Autocomplete
              multiple
              options={years}
              getOptionLabel={(option) => option}
              value={selectedYears}
              onChange={handleYearChange}
              limitTags={4}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option}
                    label={option}
                    size="small"
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Năm"
                  placeholder="Chọn năm"
                />
              )}
            />
          </Box>

          {/* Tháng */}
          <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
            <Autocomplete
              multiple
              options={Array.from({ length: 12 }, (_, i) => i + 1)}
              getOptionLabel={(option) => getMonthName(option)}
              value={selectedMonths.map(month => parseInt(month))}
              onChange={(event, newValue) => {
                setSelectedMonths(newValue.map(month => month.toString()));
              }}
              limitTags={4}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option}
                    label={getMonthName(option)}
                    size="small"
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tháng (tùy chọn)"
                  placeholder="Chọn tháng"
                />
              )}
            />
          </Box>

          {/* Nút hành động */}
          <Box sx={{ minWidth: 200, display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              onClick={handleApplyFilter}
              disabled={loading}
              sx={{ 
                minWidth: 100,
                whiteSpace: 'nowrap',
                px: 2
              }}
            >
              {loading ? <CircularProgress size={20} /> : 'Áp dụng'}
            </Button>
            <Button
              variant="outlined"
              onClick={handleResetFilter}
              disabled={loading}
              sx={{ 
                minWidth: 100,
                whiteSpace: 'nowrap',
                px: 2
              }}
            >
              Đặt lại
            </Button>
          </Box>
        </Box>

        {/* Thông tin bộ lọc hiện tại */}
        <Box mt={2}>
          <Typography variant="body2" color="text.secondary">
            <strong>Bộ lọc hiện tại:</strong> 
            {' '}{selectedServices.map(id => services.find(s => s.id === id)?.name).join(', ')} 
            {' - '}{selectedYears.join(', ')}
            {selectedMonths.length > 0 && ` - ${selectedMonths.map(m => getMonthName(parseInt(m))).join(', ')}`}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ReportFilters;
