import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,
  Paper,
  Avatar,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Assessment,
  Timeline,
  PieChart,
  BarChart,
  ShowChart,
  AccountBalance,
  MonetizationOn
} from '@mui/icons-material';

const ExpenseSummary = ({ data, period, isMonthly }) => {
  if (!data) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" color="text.secondary" align="center">
            Chưa có dữ liệu để hiển thị tổng kết
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getTotalExpense = () => {
    if (isMonthly) {
      return data.totalExpense || 0;
    } else {
      return data.grandTotal || 0;
    }
  };

  const getTotalRecords = () => {
    if (isMonthly) {
      return data.summary?.totalRecords || 0;
    } else {
      return data.summary?.totalRecords || 0;
    }
  };

  const getTotalServices = () => {
    if (isMonthly) {
      return data.summary?.totalServices || 0;
    } else {
      return data.summary?.totalServices || 0;
    }
  };

  const getAverageExpense = () => {
    if (isMonthly) {
      return getTotalExpense();
    } else {
      return data.summary?.averageMonthlyExpense || 0;
    }
  };

  const getTopService = () => {
    if (isMonthly) {
      const services = Object.keys(data.data || {});
      if (services.length === 0) return null;
      
      return services.reduce((top, service) => {
        const currentTotal = data.data[service]?.totalPrice || 0;
        const topTotal = data.data[top]?.totalPrice || 0;
        return currentTotal > topTotal ? service : top;
      });
    } else {
      const yearlyTotals = data.yearlyTotals || {};
      const services = Object.keys(yearlyTotals);
      if (services.length === 0) return null;
      
      return services.reduce((top, service) => {
        const currentTotal = yearlyTotals[service]?.totalPrice || 0;
        const topTotal = yearlyTotals[top]?.totalPrice || 0;
        return currentTotal > topTotal ? service : top;
      });
    }
  };

  const getTopServiceAmount = () => {
    const topService = getTopService();
    if (!topService) return 0;
    
    if (isMonthly) {
      return data.data[topService]?.totalPrice || 0;
    } else {
      return data.yearlyTotals[topService]?.totalPrice || 0;
    }
  };

  const getTopServicePercentage = () => {
    const topAmount = getTopServiceAmount();
    const total = getTotalExpense();
    return total > 0 ? ((topAmount / total) * 100).toFixed(1) : 0;
  };

  const SummaryCard = ({ title, value, icon, color = 'primary', subtitle, trend, trendValue }) => (
    <Card 
      sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${color}.light 0%, ${color}.lighter 100%)`,
        border: `1px solid ${color}.main`,
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
          transition: 'all 0.3s ease-in-out'
        }
      }}
    >
      <CardContent sx={{ position: 'relative', zIndex: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Avatar
            sx={{
              backgroundColor: `${color}.main`,
              width: 48,
              height: 48,
              boxShadow: 2
            }}
          >
            {icon}
          </Avatar>
          {trend && (
            <Box display="flex" alignItems="center">
              {trend === 'up' ? (
                <TrendingUp sx={{ color: 'success.main', fontSize: 20 }} />
              ) : (
                <TrendingDown sx={{ color: 'error.main', fontSize: 20 }} />
              )}
              <Typography 
                variant="body2" 
                color={trend === 'up' ? 'success.main' : 'error.main'}
                sx={{ ml: 0.5, fontWeight: 'bold' }}
              >
                {trendValue}
              </Typography>
            </Box>
          )}
        </Box>
        
        <Typography color="text.secondary" gutterBottom variant="body2" sx={{ fontWeight: 500 }}>
          {title}
        </Typography>
        <Typography variant="h4" component="div" color={`${color}.main`} sx={{ fontWeight: 'bold', mb: 1 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
      
      {/* Decorative background */}
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: '50%',
          backgroundColor: `${color}.main`,
          opacity: 0.1,
          zIndex: 1
        }}
      />
    </Card>
  );

  const ServiceBreakdownCard = () => {
    const services = isMonthly 
      ? Object.keys(data.data || {})
      : Object.keys(data.yearlyTotals || {});

    if (services.length === 0) {
      return (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Chi tiết theo dịch vụ
            </Typography>
            <Typography color="text.secondary">
              Không có dữ liệu dịch vụ
            </Typography>
          </CardContent>
        </Card>
      );
    }

    // Chuẩn bị dữ liệu cho biểu đồ cột
    const chartData = services.map(service => {
      const serviceData = isMonthly 
        ? data.data[service]
        : data.yearlyTotals[service];
      
      const amount = serviceData?.totalPrice || 0;
      const percentage = getTotalExpense() > 0 
        ? ((amount / getTotalExpense()) * 100).toFixed(1) 
        : 0;

      return {
        service,
        amount,
        percentage: parseFloat(percentage)
      };
    });

    // Sắp xếp theo số tiền giảm dần
    chartData.sort((a, b) => b.amount - a.amount);

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <BarChart sx={{ mr: 1, color: 'primary.main' }} />
            Chi tiết theo dịch vụ
          </Typography>
          <Box mt={2}>
            {chartData.map((item, index) => {
              const maxAmount = Math.max(...chartData.map(d => d.amount));
              const barWidth = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
              
              return (
                <Box key={item.service} mb={3}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body1" fontWeight="medium" sx={{ fontSize: '0.9rem' }}>
                      {item.service}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                        {formatCurrency(item.amount)}
                      </Typography>
                      <Chip 
                        label={`${item.percentage}%`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    </Box>
                  </Box>
                  
                  {/* Thanh tiến trình */}
                  <Box 
                    sx={{ 
                      width: '100%', 
                      height: 8, 
                      backgroundColor: '#e0e0e0', 
                      borderRadius: 4,
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                  >
                    <Box
                      sx={{
                        width: `${barWidth}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, #2196f3 0%, #1976d2 100%)`,
                        borderRadius: 4,
                        transition: 'width 0.3s ease-in-out'
                      }}
                    />
                  </Box>
                </Box>
              );
            })}
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      {/* 6 Cards trong grid 2x3 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Row 1 */}
        <Grid item xs={12} sm={6} md={4}>
          <SummaryCard
            title="Tổng chi phí"
            value={formatCurrency(getTotalExpense())}
            icon={<AttachMoney />}
            color="primary"
            subtitle="Tổng chi phí các dịch vụ"
            trend="up"
            trendValue="+12%"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <SummaryCard
            title="Số lượng dịch vụ"
            value={getTotalServices()}
            icon={<Assessment />}
            color="success"
            subtitle="Dịch vụ đang hoạt động"
            trend="up"
            trendValue="+2"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <SummaryCard
            title="Tổng số bản ghi"
            value={getTotalRecords()}
            icon={<Timeline />}
            color="info"
            subtitle="Tổng số giao dịch"
            trend="up"
            trendValue="+15%"
          />
        </Grid>

        {/* Row 2 */}
        <Grid item xs={12} sm={6} md={4}>
          <SummaryCard
            title={isMonthly ? "Chi phí trung bình" : "Chi phí TB/tháng"}
            value={formatCurrency(getAverageExpense())}
            icon={<TrendingUp />}
            color="warning"
            subtitle="Chi phí trung bình"
            trend="down"
            trendValue="-5%"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <SummaryCard
            title="Dịch vụ cao nhất"
            value={getTopService() || "N/A"}
            icon={<PieChart />}
            color="secondary"
            subtitle={getTopService() ? formatCurrency(getTopServiceAmount()) : "Không có dữ liệu"}
            trend="up"
            trendValue={`${getTopServicePercentage()}%`}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <SummaryCard
            title="Tỷ lệ tăng trưởng"
            value="+8.5%"
            icon={<ShowChart />}
            color="error"
            subtitle="So với tháng trước"
            trend="up"
            trendValue="+2.1%"
          />
        </Grid>
      </Grid>

      {/* Chi tiết theo dịch vụ */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ServiceBreakdownCard />
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <ShowChart sx={{ mr: 1, color: 'primary.main' }} />
                Phân tích theo tháng
              </Typography>
              <Box mt={2}>
                {!isMonthly && data.monthlyData ? (
                  <Box>
                    {data.monthlyData
                      .filter(monthData => monthData.monthlyTotal > 0)
                      .map((monthData, index) => {
                        const maxAmount = Math.max(...data.monthlyData.map(m => m.monthlyTotal));
                        const barWidth = maxAmount > 0 ? (monthData.monthlyTotal / maxAmount) * 100 : 0;
                        const percentage = getTotalExpense() > 0 
                          ? ((monthData.monthlyTotal / getTotalExpense()) * 100).toFixed(1) 
                          : 0;
                        
                        return (
                          <Box key={monthData.month} mb={3}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                              <Typography variant="body1" fontWeight="medium" sx={{ fontSize: '0.9rem' }}>
                                {monthData.month}
                              </Typography>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                  {formatCurrency(monthData.monthlyTotal)}
                                </Typography>
                                <Chip 
                                  label={`${percentage}%`} 
                                  size="small" 
                                  color="secondary" 
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                              </Box>
                            </Box>
                            
                            {/* Thanh tiến trình */}
                            <Box 
                              sx={{ 
                                width: '100%', 
                                height: 8, 
                                backgroundColor: '#e0e0e0', 
                                borderRadius: 4,
                                overflow: 'hidden',
                                position: 'relative'
                              }}
                            >
                              <Box
                                sx={{
                                  width: `${barWidth}%`,
                                  height: '100%',
                                  background: `linear-gradient(90deg, #ff9800 0%, #f57c00 100%)`,
                                  borderRadius: 4,
                                  transition: 'width 0.3s ease-in-out'
                                }}
                              />
                            </Box>
                          </Box>
                        );
                      })}
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Báo cáo theo tháng
                    </Typography>
                    <Typography variant="h6" color="primary.main">
                      {period}
                    </Typography>
                    <Box mt={2}>
                      <Typography variant="body2" gutterBottom>
                        Tổng chi phí: {formatCurrency(getTotalExpense())}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Số dịch vụ: {getTotalServices()}
                      </Typography>
                      <Typography variant="body2">
                        Số bản ghi: {getTotalRecords()}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Thông tin bổ sung cho báo cáo năm */}
      {!isMonthly && data.monthlyData && (
        <Box mt={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <AccountBalance sx={{ mr: 1, color: 'primary.main' }} />
                Thống kê theo tháng
              </Typography>
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {data.monthlyData.map((monthData, index) => (
                  <Grid item xs={6} sm={4} md={2} key={index}>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center',
                        background: monthData.monthlyTotal > 0 
                          ? 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'
                          : 'linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%)',
                        border: monthData.monthlyTotal > 0 ? '1px solid #2196f3' : '1px solid #e0e0e0',
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 2
                        }
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {monthData.month}
                      </Typography>
                      <Typography 
                        variant="h6" 
                        color={monthData.monthlyTotal > 0 ? "primary.main" : "text.secondary"}
                        sx={{ fontWeight: 'bold' }}
                      >
                        {formatCurrency(monthData.monthlyTotal)}
                      </Typography>
                      {monthData.monthlyTotal > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          {Object.keys(monthData.services).length} dịch vụ
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default ExpenseSummary;
