# 🛍️ E-Commerce Web Application

A full-stack e-commerce platform built with Node.js, Express, MongoDB, and React.

## 📋 Features

### Frontend
- 🎨 Modern React UI with Tailwind CSS
- 🛒 Shopping cart with persistent storage
- 🔍 Advanced product search and filtering
- 📱 Responsive design for all devices
- 👤 User authentication and profile management
- 📦 Order history and tracking
- 📊 Admin dashboard with analytics

### Backend
- 🔐 JWT-based authentication
- 🗄️ MongoDB database integration
- 📝 RESTful API with comprehensive documentation
- 👥 Role-based access control (Admin/User)
- 📊 Advanced statistics and analytics
- 🔄 Data seeding for demo purposes

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/deveshsingh641/E-Commerce-Web-Application.git
   cd E-Commerce-Web-Application
   ```

2. Install root dependencies:
   ```bash
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd backend && npm install
   ```

4. Install frontend dependencies:
   ```bash
   cd frontend && npm install
   ```

### Configuration

1. Create a `.env` file in the `backend` folder:
   ```env
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=your_secret_key_here
   PORT=5000
   NODE_ENV=development
   ```

2. Update the API base URL in `frontend/src/services/api.js` if needed.

### Running the Application

#### Start Both Frontend and Backend Together:
```bash
npm run dev
```

#### Start Individually:
```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

#### Build for Production:
```bash
npm run build
```

## 📱 Demo Credentials

### Admin Account
- **Email:** admin@demo.com
- **Password:** admin123

### Regular User
- **Email:** user@demo.com
- **Password:** user123

## 🏗️ Project Structure

```
E-Commerce-Web-Application/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Authentication & authorization
│   ├── models/          # Database schemas
│   ├── routes/          # API routes
│   ├── data/            # Database seeders
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # State management
│   │   ├── services/    # API services
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
└── package.json         # Root package configuration
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (Protected)
- `PUT /api/auth/profile` - Update user profile (Protected)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Orders
- `POST /api/orders` - Create order (Protected)
- `GET /api/orders` - Get user orders (Protected)
- `GET /api/orders/:id` - Get order details (Protected)
- `PUT /api/orders/:id` - Update order status (Admin only)

### Stats
- `GET /api/stats/dashboard` - Dashboard statistics (Admin only)
- `GET /api/stats/sales` - Sales analytics (Admin only)

## 🛠️ Technology Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Context API for state management
- Axios for API calls

### Backend
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

## 📖 Documentation

For detailed documentation, check individual files:
- Backend API Documentation: `backend/README.md`
- Frontend Documentation: `frontend/README.md`

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

[Devesh Singh](https://github.com/deveshsingh641)

## 📞 Support

For support, email deveshsingh641@gmail.com or open an issue in the repository.

---

**Made with ❤️ by Devesh Singh**
