import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';

import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Box from '@mui/material/Box';
import FormHelperText from '@mui/material/FormHelperText';

import AnimateButton from 'ui-component/extended/AnimateButton';
import { useAuth } from 'contexts/AuthContext';
import axiosInstance from 'api/axios';
import { toast } from 'react-toastify';

const validationSchema = yup.object().shape({
  otp: yup
    .string()
    .required('Vui lòng nhập mã OTP')
    .matches(/^[0-9]+$/, 'Mã OTP chỉ được chứa số')
    .length(6, 'Mã OTP phải có 6 số')
});

export default function AuthVerify() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { completeVerification, userInfo } = useAuth();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await validationSchema.validate({ otp });
      setIsSubmitting(true);
      setError('');

      const response = await axiosInstance.post('/auth/verify-otp', { 
        otp,
        user_id: userInfo?._id 
      });
      completeVerification(response.data.data);
      
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message);
      }
      
      setFailedAttempts(prev => prev + 1);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setIsResending(true);
      setError('');
      
      const response = await axiosInstance.post('/auth/resend-otp', {
        user_id: userInfo?._id
      });
      
      setFailedAttempts(0);
      setOtp('');
      
      if (response.data?.message) {
        setError('');
        toast.success(response.data.message);
      }
      
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Có lỗi xảy ra khi gửi lại mã OTP');
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleOtpChange = (event) => {
    setOtp(event.target.value);
    setError('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormControl fullWidth sx={{ ...theme.typography.customInput }} error={Boolean(error)}>
        <InputLabel htmlFor="outlined-adornment-otp">Mã OTP</InputLabel>
        <OutlinedInput 
          id="outlined-adornment-otp" 
          type="text" 
          name="otp"
          value={otp}
          onChange={handleOtpChange}
          disabled={isSubmitting}
        />
        {error && <FormHelperText error>{error}</FormHelperText>}
      </FormControl>

      {failedAttempts < 3 && <Box sx={{ mt: 2 }}>
        <AnimateButton>
          <Button 
            color="secondary" 
            fullWidth 
            size="large" 
            type="submit" 
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang xác thực...' : 'Xác thực'}
          </Button>
        </AnimateButton>
      </Box>}

      {failedAttempts >= 3 && (
        <Box sx={{ mt: 2 }}>
          <AnimateButton>
            <Button 
              color="primary" 
              fullWidth 
              size="large" 
              variant="outlined"
              onClick={handleResendOtp}
              disabled={isResending}
            >
              {isResending ? 'Đang gửi lại mã...' : 'Gửi lại mã OTP'}
            </Button>
          </AnimateButton>
        </Box>
      )}
    </form>
  );
}
