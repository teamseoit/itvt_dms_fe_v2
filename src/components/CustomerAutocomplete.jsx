import { useState, useEffect } from 'react';
import { Box, TextField, Typography, Autocomplete } from '@mui/material';
import { phoneNumber } from '../utils/formatConstants';
import CUSTOMER_API from '../services/customerService';

export default function CustomerAutocomplete({ 
  value, 
  onChange, 
  label = "Khách hàng (*)", 
  placeholder = "Tìm kiếm theo tên, số điện thoại, email hoặc địa chỉ...",
  disabled = false,
  required = true,
  sx = { mb: 3 }
}) {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [customerSearchValue, setCustomerSearchValue] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await CUSTOMER_API.getAll({ limit: 1000 });
      if (response.data.success) {
        const customerData = response.data.data || [];
        setCustomers(customerData);
        setFilteredCustomers(customerData);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = (searchValue) => {
    if (!searchValue.trim()) {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer =>
        (customer.fullName || '').toLowerCase().includes(searchValue.toLowerCase()) ||
        (customer.phoneNumber || '').toString().includes(searchValue) ||
        (customer.email || '').toLowerCase().includes(searchValue.toLowerCase()) ||
        (customer.address || '').toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredCustomers(filtered);
    }
  };

  const handleCustomerSearchChange = (event, newValue) => {
    setCustomerSearchValue(newValue);
    filterCustomers(newValue);
  };

  const handleChange = (event, newValue) => {
    onChange(newValue ? newValue._id : '');
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Set search value when value changes (for edit mode)
  useEffect(() => {
    if (value && customers.length > 0) {
      const selectedCustomer = customers.find(customer => customer._id === value);
      if (selectedCustomer) {
        setCustomerSearchValue(`${selectedCustomer.fullName} / ${phoneNumber(selectedCustomer.phoneNumber)} / ${selectedCustomer.email} / ${selectedCustomer.address}`);
      }
    } else if (!value) {
      setCustomerSearchValue('');
    }
  }, [value, customers]);

  return (
    <Autocomplete
      fullWidth
      options={filteredCustomers}
      getOptionLabel={(option) => 
        `${option.fullName || ''} / ${phoneNumber(option.phoneNumber || '')} / ${option.email || ''} / ${option.address || ''}`
      }
      value={customers.find(customer => customer._id === value) || null}
      onChange={handleChange}
      inputValue={customerSearchValue}
      onInputChange={handleCustomerSearchChange}
      loading={loading}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          required={required}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {option.fullName || ''}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {phoneNumber(option.phoneNumber || '')} / {option.email || ''} / {option.address || ''}
            </Typography>
          </Box>
        </Box>
      )}
      ListboxProps={{
        style: {
          maxHeight: 300,
          overflow: 'auto'
        }
      }}
      noOptionsText="Không tìm thấy khách hàng"
      sx={sx}
    />
  );
}
