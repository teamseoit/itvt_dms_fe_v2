import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Fade,
  Button
} from '@mui/material';
import { IconRefresh, IconAlertCircle } from '@tabler/icons-react';

const EmptyState = ({ onRefresh, loading }) => {
  return (
    <Fade in timeout={800}>
      <Card sx={{ 
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        border: '1px solid rgba(0,0,0,0.05)',
        textAlign: 'center',
        p: 4
      }}>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <IconAlertCircle size={64} color="#9e9e9e" />
          </Box>
          
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#333' }}>
            Không có dữ liệu
          </Typography>
          
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
            Hiện tại chưa có dữ liệu thống kê để hiển thị. Vui lòng thử lại sau.
          </Typography>
          
          <Button
            variant="contained"
            startIcon={<IconRefresh />}
            onClick={onRefresh}
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '8px',
              px: 3,
              py: 1.5,
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
          >
            {loading ? 'Đang tải...' : 'Thử lại'}
          </Button>
        </CardContent>
      </Card>
    </Fade>
  );
};

export default EmptyState;
