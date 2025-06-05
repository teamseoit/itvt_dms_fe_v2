import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Box from '@mui/material/Box';

import AnimateButton from 'ui-component/extended/AnimateButton';
import { useAuth } from 'contexts/AuthContext';

export default function AuthVerify() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { completeVerification } = useAuth();

  const handleSubmit = (event) => {
    event.preventDefault();
    completeVerification();
    navigate('/');
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormControl fullWidth sx={{ ...theme.typography.customInput }}>
        <InputLabel htmlFor="outlined-adornment-otp">Mã OTP</InputLabel>
        <OutlinedInput id="outlined-adornment-otp" type="text" name="otp" />
      </FormControl>

      <Box sx={{ mt: 2 }}>
        <AnimateButton>
          <Button color="secondary" fullWidth size="large" type="submit" variant="contained">
            Xác thực
          </Button>
        </AnimateButton>
      </Box>
    </form>
  );
}
