# Sabri Admin Backend Setup

This document provides instructions for setting up and running the Sabri Admin backend API.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

## Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:
   - Copy `backend/env.example` to `backend/.env`
   - Update the configuration as needed

## Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/sabri-admin

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Admin Credentials (for initial setup)
ADMIN_EMAIL=admin@sabri.com
ADMIN_PASSWORD=admin123

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

## Database Setup

1. Make sure MongoDB is running on your system
2. The application will automatically connect to the database when started

## Initial Admin Setup

Run the following command to create the initial super admin:

```bash
npm run init-admin
```

This will create a super admin with:

- Email: admin@sabri.com (or as configured in .env)
- Password: admin123 (or as configured in .env)
- Role: super-admin

## Running the Backend

### Development Mode

```bash
npm run backend:dev
```

### Production Mode

```bash
npm run backend
```

The API will be available at: `http://localhost:3001`

## API Endpoints

### Authentication

- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/me` - Get current admin profile

### Products

- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `GET /api/products/:id` - Get single product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders

- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/orders/:id` - Get single order
- `PUT /api/admin/orders/:id` - Update order
- `PUT /api/admin/orders/:id/status` - Update order status

### Customers

- `GET /api/admin/customers` - Get all customers
- `GET /api/admin/customers/:id` - Get single customer
- `POST /api/admin/customers` - Create new customer
- `PUT /api/admin/customers/:id` - Update customer

## Database Models

### Admin

- Authentication and authorization
- Role-based permissions
- Profile management

### Product

- Product catalog management
- Inventory tracking
- Category organization

### Order

- Order processing
- Payment tracking
- Shipping management

### Customer

- Customer management
- Order history
- Address management

## Security Features

- JWT-based authentication
- Role-based authorization
- Rate limiting
- Input validation
- CORS protection
- Helmet security headers

## Development

The backend includes:

- Express.js server
- MongoDB with Mongoose
- JWT authentication
- Input validation with express-validator
- Error handling
- Logging

## Health Check

Check if the API is running:

```
GET http://localhost:3001/health
```

## Troubleshooting

1. **Database Connection Issues**

   - Ensure MongoDB is running
   - Check MONGODB_URI in .env file

2. **Authentication Issues**

   - Run `npm run init-admin` to create initial admin
   - Check JWT_SECRET in .env file

3. **CORS Issues**
   - Update FRONTEND_URL in .env file
   - Ensure frontend is running on correct port

## Production Deployment

1. Set `NODE_ENV=production` in environment variables
2. Use a strong JWT_SECRET
3. Use MongoDB Atlas or secure MongoDB instance
4. Configure proper CORS origins
5. Set up SSL/TLS certificates
6. Use PM2 or similar process manager

## API Documentation

The API follows RESTful conventions and returns JSON responses with the following structure:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```
