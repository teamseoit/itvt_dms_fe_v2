# Báo cáo thống kê chi phí

## Tổng quan
Trang báo cáo thống kê chi phí cho phép người dùng xem và phân tích chi phí của 5 dịch vụ chính:
- Domain (ID: 1)
- Hosting (ID: 2) 
- Email (ID: 3)
- SSL (ID: 4)
- Website (ID: 5)

## Tính năng

### 1. Bộ lọc (ReportFilters)
- **Chọn dịch vụ**: Multi-select để chọn một hoặc nhiều dịch vụ
- **Chọn năm**: Dropdown để chọn năm báo cáo
- **Chọn tháng**: Dropdown tùy chọn để xem báo cáo theo tháng cụ thể
- **Nút Áp dụng**: Tải dữ liệu theo bộ lọc đã chọn
- **Nút Đặt lại**: Reset về bộ lọc mặc định

### 2. Tổng kết (ExpenseSummary)
- **Tổng chi phí**: Hiển thị tổng chi phí của các dịch vụ được chọn
- **Số lượng dịch vụ**: Số dịch vụ được chọn trong báo cáo
- **Tổng số bản ghi**: Tổng số dịch vụ được đăng ký
- **Chi phí trung bình**: Chi phí trung bình theo tháng hoặc tổng
- **Dịch vụ có chi phí cao nhất**: Dịch vụ chiếm tỷ lệ cao nhất
- **Chi tiết theo dịch vụ**: Phân tích chi tiết từng dịch vụ
- **Thống kê theo tháng**: Hiển thị chi phí từng tháng (chỉ khi xem theo năm)

### 3. Biểu đồ (ExpenseChart)
- **Biểu đồ cột**: Hiển thị chi phí theo dịch vụ hoặc theo tháng
- **Biểu đồ tròn**: Phân bố tỷ lệ chi phí theo dịch vụ
- **Biểu đồ đường**: Xu hướng chi phí theo tháng (chỉ khi xem theo năm)

### 4. Bảng dữ liệu (ExpenseTable)
- **Bảng chi tiết**: Hiển thị dữ liệu chi tiết với phân trang
- **Tỷ lệ phần trăm**: Hiển thị tỷ lệ chi phí của từng dịch vụ/tháng
- **Chi tiết dịch vụ**: Hiển thị chi phí từng dịch vụ trong từng tháng (chỉ khi xem theo năm)

## API Endpoints

### 1. Lấy danh sách dịch vụ
```
GET /statistics/services
```
Trả về danh sách các dịch vụ có sẵn với ID và tên.

### 2. Lấy danh sách năm có dữ liệu
```
GET /statistics/expense-report-years
```
Trả về danh sách các năm có dữ liệu báo cáo.

### 3. Lấy báo cáo chi phí
```
GET /statistics/expense-report?year=2024&month=1&services=1,2,3
```
**Tham số:**
- `year` (required): Năm báo cáo
- `month` (optional): Tháng cụ thể (1-12)
- `services` (optional): Danh sách ID dịch vụ, phân cách bằng dấu phẩy

**Response cho báo cáo theo tháng:**
```json
{
  "period": "Tháng 1",
  "data": {
    "Domain": { "totalPrice": 1000000, "count": 5 },
    "Hosting": { "totalPrice": 2000000, "count": 10 }
  },
  "totalExpense": 3000000,
  "summary": {
    "totalServices": 2,
    "totalRecords": 15
  }
}
```

**Response cho báo cáo theo năm:**
```json
{
  "period": "Năm 2024",
  "monthlyData": [
    {
      "month": "Tháng 1",
      "monthNumber": 1,
      "services": {
        "Domain": { "totalPrice": 1000000, "count": 5 }
      },
      "monthlyTotal": 1000000
    }
  ],
  "yearlyTotals": {
    "Domain": { "totalPrice": 12000000, "count": 60 }
  },
  "grandTotal": 12000000,
  "summary": {
    "totalServices": 1,
    "totalRecords": 60,
    "averageMonthlyExpense": 1000000
  }
}
```

## Cấu trúc Component

```
src/views/report/
├── Report.jsx                 # Component chính
└── components/
    ├── ReportFilters.jsx      # Bộ lọc
    ├── ExpenseSummary.jsx     # Tổng kết
    ├── ExpenseChart.jsx       # Biểu đồ
    └── ExpenseTable.jsx       # Bảng dữ liệu
```

## Dependencies

- `chart.js`: Thư viện biểu đồ
- `react-chartjs-2`: React wrapper cho Chart.js
- `@mui/x-date-pickers`: Date picker components
- `date-fns`: Thư viện xử lý ngày tháng

## Cách sử dụng

1. Truy cập trang báo cáo qua menu "Báo cáo thống kê"
2. Chọn dịch vụ muốn xem báo cáo (có thể chọn nhiều)
3. Chọn năm báo cáo
4. Tùy chọn chọn tháng cụ thể (để xem báo cáo theo tháng)
5. Nhấn "Áp dụng" để tải dữ liệu
6. Xem các biểu đồ và bảng dữ liệu chi tiết

## Lưu ý

- Khi không chọn tháng, hệ thống sẽ hiển thị báo cáo theo năm với dữ liệu từng tháng
- Khi chọn tháng cụ thể, hệ thống sẽ hiển thị báo cáo theo tháng với dữ liệu từng dịch vụ
- Tất cả số tiền được hiển thị theo định dạng tiền tệ Việt Nam (VNĐ)
- Biểu đồ tự động điều chỉnh màu sắc và kích thước theo số lượng dịch vụ
