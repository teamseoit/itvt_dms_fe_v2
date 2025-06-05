import { useState } from 'react';

import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Box from '@mui/material/Box';

import AnimateButton from 'ui-component/extended/AnimateButton';

export default function AuthVerify() {
  const theme = useTheme();

  return (
    <>
      <FormControl fullWidth sx={{ ...theme.typography.customInput }}>
        <InputLabel htmlFor="outlined-adornment-email-login">Mã OTP</InputLabel>
        <OutlinedInput id="outlined-adornment-email-login" type="email" value="phuc" name="email" />
      </FormControl>

      <Box sx={{ mt: 2 }}>
        <AnimateButton>
          <Button color="secondary" fullWidth size="large" type="submit" variant="contained">
            Đăng nhập
          </Button>
        </AnimateButton>
      </Box>
    </>
  );
}
