# Aether — Website bán quần áo

Aether là ứng dụng cửa hàng quần áo gồm website dành cho khách hàng và khu vực quản trị dành cho nhân viên. Dự án được chia thành frontend Next.js, backend Express và PostgreSQL. Backend cung cấp API sản phẩm, tài khoản, giỏ hàng, đơn hàng, quản lý kho và kiểm soát truy cập theo vai trò/quyền (RBAC).

> README này mô tả trạng thái mã nguồn hiện tại. Database cần được khởi tạo riêng trước khi chạy; repository hiện chưa có bộ migration/seed đầy đủ để tạo toàn bộ schema và dữ liệu mẫu tự động.

## Mục lục

- [Tính năng](#tính-năng)
- [Công nghệ](#công-nghệ)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Yêu cầu](#yêu-cầu)
- [Cấu hình môi trường](#cấu-hình-môi-trường)
- [Khởi tạo database](#khởi-tạo-database)
- [Chạy dự án](#chạy-dự-án)
- [Các trang giao diện](#các-trang-giao-diện)
- [Tài khoản và phân quyền](#tài-khoản-và-phân-quyền)
- [API chính](#api-chính)
- [Kiểm thử luồng API](#kiểm-thử-luồng-api)
- [Build frontend](#build-frontend)
- [Giới hạn hiện tại](#giới-hạn-hiện-tại)
- [Bảo mật](#bảo-mật)

## Tính năng

### Cửa hàng

- Trang chủ, danh sách sản phẩm và trang chi tiết sản phẩm.
- Tìm kiếm/lọc sản phẩm theo các tiêu chí mà API và dữ liệu hiện có hỗ trợ.
- Giỏ hàng, cập nhật số lượng và xóa mặt hàng.
- Đặt hàng với COD hoặc `bank_qr`.
- Đăng ký, đăng nhập bằng email hoặc số điện thoại.
- Trang hồ sơ và lịch sử đơn hàng.

### Quản trị và nhân viên

- Tổng quan, xem và xử lý đơn hàng.
- Quản lý sản phẩm và biến thể.
- Xem tồn kho, lập phiếu nhập/xuất kho.
- Ẩn/hiện khu vực hoặc thao tác theo quyền trên giao diện; backend cũng kiểm tra quyền ở API.

Các trang quản trị cần tài khoản có vai trò/quyền thích hợp. Ẩn nút ở giao diện không thay thế kiểm tra quyền phía backend.

## Công nghệ

- **Frontend:** Next.js App Router, React, TypeScript.
- **Backend:** Node.js, Express.
- **Database:** PostgreSQL.
- **Data access:** `pg` và Prisma adapter/schema.
- **Authentication:** JWT và mật khẩu được băm ở backend.
- **API test:** Postman collection có sẵn trong `server/postman/`.

## Cấu trúc thư mục

```text
PROJECT_WEB/
├── client/                         # Frontend Next.js
│   ├── src/app/                    # App Router: shop, auth, admin
│   ├── src/components/             # Thành phần UI, layout, guards
│   ├── src/context/                # Trạng thái xác thực và giỏ hàng
│   └── src/services/               # Các hàm gọi API
├── server/                         # Backend Express
│   ├── prisma/                     # Prisma schema/configuration
│   ├── src/                        # Routes, middleware và logic API
│   ├── postman/                    # Collection kiểm thử API
│   └── server.js                   # Điểm khởi chạy backend
├── Admin.sql                       # SQL hỗ trợ nâng tài khoản thành nhân viên
├── .env                            # Cấu hình cục bộ, không đưa lên Git
└── README.md
```

## Yêu cầu

- Node.js và npm.
- PostgreSQL đang chạy và có database mà cấu hình `DATABASE_URL` trỏ tới.
- PowerShell trên Windows (các lệnh bên dưới dùng đường dẫn workspace hiện tại `C:\PROJECT_WEB`).

## Cấu hình môi trường

### Backend

Backend đọc cấu hình từ file `.env` ở thư mục gốc dự án. File này cần có tối thiểu:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
JWT_SECRET="thay-bang-chuoi-bi-mat-dai-va-ngau-nhien"
```

Thay các giá trị mẫu bằng thông tin PostgreSQL và secret riêng của bạn. Không sao chép hoặc commit thông tin đăng nhập/secret thật lên Git.

### Frontend

Tạo `client/.env.local` nếu file chưa tồn tại:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Giá trị này phải trỏ tới địa chỉ backend. `NEXT_PUBLIC_` có nghĩa là biến được đưa tới mã frontend, vì vậy không đặt mật khẩu hay secret trong biến này.

## Khởi tạo database

Trước khi chạy backend, cần có PostgreSQL, database và schema/bảng phù hợp với mã nguồn. Endpoint kiểm tra kết nối là:

```text
GET http://localhost:5000/api/test-db
```

Repository hiện **chưa cung cấp một quy trình migration/seed hoàn chỉnh** để tạo toàn bộ bảng RBAC, sản phẩm, biến thể, giỏ hàng, đơn hàng và dữ liệu mẫu từ database trống. Prisma schema hiện có cũng chưa đại diện đầy đủ cho toàn bộ các bảng mà API sử dụng. Vì vậy:

1. Tạo database PostgreSQL và áp dụng schema SQL tương thích với mã backend của dự án.
2. Đảm bảo có dữ liệu nền cần thiết như quyền, vai trò và quan hệ vai trò-quyền.
3. Điền đúng `DATABASE_URL` trong `.env` rồi mới khởi động backend.

Không chạy `prisma migrate`/`prisma db seed` theo README này để mong database trống tự được dựng lên; hiện repo chưa có migration và seed hoàn chỉnh cho mục đích đó.

## Chạy dự án

### 1. Khởi động backend

Mở cửa sổ PowerShell thứ nhất:

```powershell
Set-Location C:\PROJECT_WEB\server
npm install
node server.js
```

Backend mặc định chạy tại `http://localhost:5000`. Mở địa chỉ sau để xác nhận API có thể truy cập database:

```text
http://localhost:5000/api/test-db
```

Phản hồi thành công cho biết truy vấn kiểm tra đã chạy được; nếu có lỗi, kiểm tra PostgreSQL, tên database, thông tin trong `DATABASE_URL`, quyền truy cập và schema cần thiết.

### 2. Khởi động frontend

Mở cửa sổ PowerShell thứ hai:

```powershell
Set-Location C:\PROJECT_WEB\client
```

Nếu chưa có `.env.local`, tạo file từ mẫu:

```powershell
Copy-Item .env.example .env.local
```

Sau đó cài dependencies và chạy Next.js:

```powershell
npm install
npm run dev
```

Website chạy tại `http://localhost:3000`. Giữ cả hai cửa sổ terminal mở trong lúc sử dụng ứng dụng.

> Backend hiện được khởi động bằng `node server.js`; `server/package.json` chưa định nghĩa script `npm run dev` hoặc `npm start`.

## Các trang giao diện

| Khu vực | Đường dẫn | Mục đích |
|---|---|---|
| Cửa hàng | `/` | Trang chủ |
| Sản phẩm | `/products` | Danh sách sản phẩm |
| Chi tiết | `/products/[id]` | Chi tiết sản phẩm |
| Giỏ hàng | `/cart` | Xem và chỉnh sửa giỏ |
| Thanh toán | `/checkout` | Tạo đơn hàng |
| Hồ sơ | `/profile` | Hồ sơ và đơn hàng của tài khoản |
| Đăng nhập | `/login` | Đăng nhập |
| Đăng ký | `/register` | Tạo tài khoản khách hàng |
| Dashboard | `/dashboard` | Tổng quan quản trị |
| Đơn hàng | `/orders` | Danh sách đơn quản trị |
| Chi tiết đơn | `/orders/[id]` | Xử lý đơn |
| Kho | `/stock` | Tồn kho |
| Phiếu kho | `/stock/documents` | Phiếu nhập/xuất |
| Danh mục quản trị | `/catalog` | Sản phẩm và biến thể |
| Cài đặt | `/settings` | Thông tin quyền hiện tại |

Các route quản trị trong nhóm `(admin)` được hiển thị dưới URL như trên; tên trong ngoặc của route group Next.js không xuất hiện trong URL.

## Tài khoản và phân quyền

Đăng ký tại `http://localhost:3000/register`. Tài khoản đăng ký mới có vai trò `CUSTOMER`; đăng ký không tự tạo tài khoản quản trị. Đăng nhập tại `/login` bằng email hoặc số điện thoại cùng mật khẩu.

### Cấp vai trò nhân viên

Sau khi người cần cấp quyền đã đăng ký, quản trị viên có thể dùng các câu lệnh mẫu trong file [`Admin.sql`](./Admin.sql). File gồm các ví dụ cho `SUPER_ADMIN`, `CS_STAFF` và `WAREHOUSE_MANAGER`; hãy thay email mẫu bằng email chính xác của tài khoản đã tồn tại và xem lại từng câu lệnh trước khi chạy trên database.

Database có ràng buộc: tài khoản `user_type='customer'` không được gán trực tiếp vai trò nhân viên/quản trị. Câu lệnh trong `Admin.sql` xử lý việc chuyển loại tài khoản và gán role theo thứ tự cần thiết. Sau khi cấp quyền, người dùng cần đăng xuất rồi đăng nhập lại để nhận trạng thái mới trong giao diện. Backend xác minh token và đọc quyền hiện hành từ database khi request được xử lý.

Vai trò và quyền được cấu hình trong database. Trạng thái role hiện có trong database phát triển có thể khác khi bạn dùng database khác; hãy kiểm tra dữ liệu của chính môi trường đó.

## API chính

Base URL mặc định: `http://localhost:5000`.

| Method | Endpoint | Xác thực / quyền |
|---|---|---|
| GET | `/api/test-db` | Kiểm tra backend và database |
| GET | `/api/products` | Công khai |
| GET | `/api/products/:id` | Công khai |
| POST | `/api/auth/register` | Công khai; tạo `CUSTOMER` |
| POST | `/api/auth/login` | Công khai |
| GET | `/api/cart` | Bearer token, `CART_ORDER` |
| POST | `/api/cart/items` | Bearer token, `CART_ORDER` |
| PATCH / DELETE | `/api/cart/items/:itemId` | Bearer token, `CART_ORDER` |
| POST | `/api/orders/checkout` | Bearer token, `CART_ORDER` |
| GET | `/api/orders` | Bearer token, đơn của người dùng |
| GET | `/api/orders/:orderId` | Bearer token, đơn của người dùng |
| GET | `/api/admin/orders` | `ORDER_HISTORY_ALL_VIEW` |
| GET | `/api/admin/orders/:orderId` | `ORDER_HISTORY_ALL_VIEW` |
| POST | `/api/admin/orders/:orderId/confirm` | `ORDER_CONFIRM_CANCEL` |
| POST | `/api/admin/orders/:orderId/cancel` | `ORDER_CONFIRM_CANCEL` |
| PATCH | `/api/admin/orders/:orderId/status` | `ORDER_STATUS_UPDATE` |
| GET | `/api/admin/stock/inventory` | `WAREHOUSE_REPORT_VIEW` |
| GET | `/api/admin/stock/documents` | `WAREHOUSE_REPORT_VIEW` |
| GET | `/api/admin/stock/documents/:documentId` | `WAREHOUSE_REPORT_VIEW` |
| POST | `/api/admin/stock/documents` | `STOCK_IO_MANAGE` |
| GET / POST | `/api/admin/products` | `PRODUCT_MANAGE` cho thao tác quản trị |
| PATCH / DELETE | `/api/admin/products/:productId` | `PRODUCT_MANAGE` |
| PATCH | `/api/admin/products/variants/:variantId` | `PRODUCT_MANAGE` |

Các route cần quyền sử dụng header:

```http
Authorization: Bearer <JWT>
```

Đăng ký nhận `fullName`, `phone`, `password` và email tùy chọn. Đăng nhập nhận `identifier` (email hoặc số điện thoại) và `password`. Checkout hiện cần đăng nhập, nhận phương thức `cod` hoặc `bank_qr` cùng địa chỉ người nhận gồm `recipientName`, `recipientPhone`, `province`, `district`, `ward`, `streetAddress`.

## Kiểm thử luồng API

Import collection sau vào Postman:

```text
server/postman/Aether_Order_Warehouse_Flow.postman_collection.json
```

Collection hướng dẫn luồng đăng ký → thêm giỏ hàng → checkout → CSKH xác nhận → kho xử lý/phiếu xuất → cập nhật giao hàng và hoàn tất. Thiết lập các biến collection/environment theo hướng dẫn trong Postman, gồm `baseUrl`, `variantId`, `quantity`, `csIdentifier`, `csPassword`, `warehouseIdentifier`, `warehousePassword`.

Luồng kho tạo chứng từ và thay đổi dữ liệu tồn kho/đơn hàng trong database. Chạy collection trên môi trường phát triển hoặc dữ liệu thử nghiệm, không chạy tùy tiện trên database đang dùng thật.

## Build frontend

Trong `client/`, chạy:

```powershell
npm run build
```

Nếu build thành công, có thể chạy bản production cục bộ bằng:

```powershell
npm start
```

Lệnh `npm start` cũng cần chạy trong thư mục `client/`. Backend vẫn phải được chạy riêng.

## Giới hạn hiện tại

- Chưa có migration/seed đầy đủ để dựng toàn bộ database mới từ đầu.
- Checkout backend hiện yêu cầu đăng nhập; giỏ hàng guest ở frontend không đồng nghĩa với guest checkout đã hoàn thiện ở API.
- `bank_qr` là giá trị phương thức thanh toán được API chấp nhận; luồng tạo mã QR và đối soát thanh toán chưa được thể hiện như tích hợp thanh toán hoàn chỉnh.
- Voucher, chỉnh sửa hồ sơ/địa chỉ, API quản lý nhân viên và gán role trên giao diện, nhật ký hệ thống và báo cáo tổng thể chưa hoàn thiện thành các luồng đầy đủ.
- Trang cài đặt hiện chủ yếu hiển thị thông tin quyền; việc cấp role thực hiện qua database/SQL hiện có.
- Tạo sản phẩm quản trị yêu cầu các dữ liệu liên quan, chẳng hạn danh mục, đã tồn tại trong database.

## Bảo mật

- Không commit `.env`, `.env.local`, mật khẩu database, JWT secret hoặc token.
- Dùng `JWT_SECRET` riêng, đủ dài và chỉ lưu ở backend.
- Chỉ cấp vai trò nhân viên/quản trị cho tài khoản đã xác minh và đúng người nhận.
- Chỉ dùng dữ liệu thử nghiệm khi chạy các thao tác tạo đơn, phiếu kho hoặc cập nhật tồn kho.
