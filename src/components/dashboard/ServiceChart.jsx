import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Fade,
  Slide,
  Grid,
  LinearProgress,
  Chip
} from '@mui/material';
import { 
  IconChartPie,
  IconTrendingUp,
  IconAlertTriangle,
  IconX
} from '@tabler/icons-react';

const ServiceChart = ({ serviceStats }) => {
  if (!serviceStats) return null;

  const services = [
    {
      name: 'Tên miền',
      stats: serviceStats.domain,
      color: '#667eea',
      icon: '🌐'
    },
    {
      name: 'SSL',
      stats: serviceStats.ssl,
      color: '#4caf50',
      icon: '🔒'
    },
    {
      name: 'Hosting',
      stats: serviceStats.hosting,
      color: '#ff9800',
      icon: '🖥️'
    },
    {
      name: 'Email',
      stats: serviceStats.email,
      color: '#9c27b0',
      icon: '📧'
    },
    {
      name: 'Website',
      stats: serviceStats.website,
      color: '#f44336',
      icon: '🌍'
    }
  ];

  const getTotalForService = (stats, type) => {
    if (type === 'website') {
      return stats.active + stats.closed;
    }
    return stats.active + stats.nearExpired + stats.expired;
  };

  const getPercentage = (value, total) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  const getTotalAllServices = () => {
    return services.reduce((total, service) => {
      return total + getTotalForService(service.stats, service.name === 'Website' ? 'website' : 'default');
    }, 0);
  };

  const totalAllServices = getTotalAllServices();

  return (
    <Fade in timeout={1200}>
      <Card sx={{ 
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        border: '1px solid rgba(0,0,0,0.05)'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box 
              sx={{ 
                p: 1.5, 
                borderRadius: '12px', 
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                mr: 2
              }}
            >
              <IconChartPie size={24} color="#667eea" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#333' }}>
              Phân bố Dịch vụ
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {services.map((service, index) => {
              const serviceTotal = getTotalForService(service.stats, service.name === 'Website' ? 'website' : 'default');
              const percentage = getPercentage(serviceTotal, totalAllServices);
              
              return (
                <Grid item xs={12} sm={6} md={4} key={service.name}>
                  <Slide direction="up" in timeout={1400 + (index * 100)}>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h6" sx={{ fontSize: '1.2rem' }}>
                            {service.icon}
                          </Typography>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333' }}>
                            {service.name}
                          </Typography>
                        </Box>
                        <Chip 
                          label={`${serviceTotal} dịch vụ`}
                          size="small"
                          sx={{ 
                            backgroundColor: service.color,
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      </Box>

                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: 'rgba(0,0,0,0.1)',
                          mb: 1,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: service.color,
                            borderRadius: 4,
                          }
                        }}
                      />

                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {percentage}% tổng số dịch vụ
                      </Typography>

                      <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'nowrap' }}>
                        {service.name === 'Website' ? (
                          <>
                            <Chip 
                              icon={<IconTrendingUp size={14} />}
                              label={`${service.stats.active} hoạt động`}
                              size="small"
                              sx={{ backgroundColor: '#4caf50', color: 'white', fontSize: '0.7rem' }}
                            />
                            <Chip 
                              icon={<IconX size={14} />}
                              label={`${service.stats.closed} đóng`}
                              size="small"
                              sx={{ backgroundColor: '#f44336', color: 'white', fontSize: '0.7rem' }}
                            />
                          </>
                        ) : (
                          <>
                            <Chip 
                              icon={<IconTrendingUp size={14} />}
                              label={`${service.stats.active} hoạt động`}
                              size="small"
                              sx={{ backgroundColor: '#4caf50', color: 'white', fontSize: '0.7rem' }}
                            />
                            <Chip 
                              icon={<IconAlertTriangle size={14} />}
                              label={`${service.stats.nearExpired} sắp hết hạn`}
                              size="small"
                              sx={{ backgroundColor: '#ff9800', color: 'white', fontSize: '0.7rem' }}
                            />
                            <Chip 
                              icon={<IconX size={14} />}
                              label={`${service.stats.expired} hết hạn`}
                              size="small"
                              sx={{ backgroundColor: '#f44336', color: 'white', fontSize: '0.7rem' }}
                            />
                          </>
                        )}
                      </Box>
                    </Box>
                  </Slide>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>
    </Fade>
  );
};

export default ServiceChart;
