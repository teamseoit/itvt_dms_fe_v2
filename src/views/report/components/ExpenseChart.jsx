import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Paper,
  Avatar,
  Chip
} from '@mui/material';
import {
  BarChart,
  PieChart,
  ShowChart,
  TrendingUp,
  Assessment,
  Timeline
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const ExpenseChart = ({ data, period, isMonthly }) => {
  if (!data) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" color="text.secondary" align="center">
            Chưa có dữ liệu để hiển thị biểu đồ
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Chuẩn bị dữ liệu cho biểu đồ cột
  const prepareBarChartData = () => {
    if (isMonthly) {
      // Dữ liệu theo tháng - hiển thị các dịch vụ
      const services = Object.keys(data.data || {});
      const serviceData = services.map(service => ({
        service,
        totalPrice: data.data[service]?.totalPrice || 0,
        totalPurchasePrice: data.data[service]?.totalPurchasePrice || 0,
        count: data.data[service]?.count || 0
      }));

      return {
        labels: serviceData.map(item => item.service),
        datasets: [
          {
            label: 'Tổng chi phí (VNĐ)',
            data: serviceData.map(item => item.totalPrice),
            backgroundColor: 'rgba(54, 162, 235, 0.8)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          },
          {
            label: 'Tổng giá mua (VNĐ)',
            data: serviceData.map(item => item.totalPurchasePrice),
            backgroundColor: 'rgba(75, 192, 192, 0.8)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }
        ]
      };
    } else {
      // Dữ liệu theo năm - hiển thị theo tháng
      const monthlyData = data.monthlyData || [];
      
      return {
        labels: monthlyData.map(item => item.month),
        datasets: [
          {
            label: 'Tổng chi phí (VNĐ)',
            data: monthlyData.map(item => item.monthlyTotal),
            backgroundColor: 'rgba(54, 162, 235, 0.8)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          },
          {
            label: 'Tổng giá mua (VNĐ)',
            data: monthlyData.map(item => item.monthlyPurchaseTotal || 0),
            backgroundColor: 'rgba(75, 192, 192, 0.8)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }
        ]
      };
    }
  };

  // Chuẩn bị dữ liệu cho biểu đồ tròn
  const preparePieChartData = () => {
    if (isMonthly) {
      const services = Object.keys(data.data || {});
      const serviceData = services.map(service => ({
        service,
        totalPrice: data.data[service]?.totalPrice || 0
      }));

      return {
        labels: serviceData.map(item => item.service),
        datasets: [
          {
            data: serviceData.map(item => item.totalPrice),
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0',
              '#9966FF'
            ],
            borderWidth: 2
          }
        ]
      };
    } else {
      const yearlyTotals = data.yearlyTotals || {};
      const services = Object.keys(yearlyTotals);
      
      return {
        labels: services,
        datasets: [
          {
            data: services.map(service => yearlyTotals[service]?.totalPrice || 0),
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0',
              '#9966FF'
            ],
            borderWidth: 2
          }
        ]
      };
    }
  };

  // Chuẩn bị dữ liệu cho biểu đồ đường
  const prepareLineChartData = () => {
    if (!isMonthly && data.monthlyData) {
      const monthlyData = data.monthlyData;
      
      // Tạo datasets cho từng dịch vụ
      const services = Object.keys(data.yearlyTotals || {});
      const datasets = services.map((service, index) => {
        const colors = [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ];
        
        return {
          label: service,
          data: monthlyData.map(item => item.services[service]?.totalPrice || 0),
          borderColor: colors[index % colors.length],
          backgroundColor: colors[index % colors.length].replace('1)', '0.2)'),
          tension: 0.1
        };
      });

      return {
        labels: monthlyData.map(item => item.month),
        datasets
      };
    }
    
    return null;
  };

  const barChartData = prepareBarChartData();
  const pieChartData = preparePieChartData();
  const lineChartData = prepareLineChartData();

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Biểu đồ chi phí - ${period}`
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed.y || context.parsed;
            return `${context.dataset.label || context.label}: ${value.toLocaleString('vi-VN')} VNĐ`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value.toLocaleString('vi-VN') + ' VNĐ';
          }
        }
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: `Phân bố chi phí theo dịch vụ - ${period}`
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value.toLocaleString('vi-VN')} VNĐ (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Row 1 */}
      {/* Biểu đồ cột - Doanh thu theo tháng */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)' }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <BarChart />
              </Avatar>
              <Typography variant="h6" fontWeight="bold">
                So sánh chi phí và giá mua
              </Typography>
            </Box>
            <Box height="300px">
              <Bar data={barChartData} options={chartOptions} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Biểu đồ tròn - Doanh thu theo vùng */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #fff3e0 0%, #fce4ec 100%)' }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                <PieChart />
              </Avatar>
              <Typography variant="h6" fontWeight="bold">
                Doanh thu theo vùng
              </Typography>
            </Box>
            <Box height="300px">
              <Doughnut data={pieChartData} options={pieChartOptions} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Row 2 */}
      {/* Tình trạng thanh toán */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)' }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <Assessment />
              </Avatar>
              <Typography variant="h6" fontWeight="bold">
                Tình trạng thanh toán
              </Typography>
            </Box>
            <Box height="300px">
              <Bar 
                data={{
                  labels: barChartData.labels,
                  datasets: [{
                    ...barChartData.datasets[0],
                    backgroundColor: ['#4caf50', '#ff9800'],
                    label: 'Đã thanh toán / Chưa thanh toán'
                  }]
                }} 
                options={chartOptions} 
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ExpenseChart;
