# Contact Management API

A RESTful API for user authentication and contact management.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start server
npm start
```

## Environment Variables
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_SERVICE=your_email_service_provider
EMAIL_USER=your_email_username
EMAIL_PASS=your_email_password
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | User login | No |
| GET | `/auth/emailverify` | Verify email | No |
| POST | `/auth/resetpassword` | Request password reset | No |
| POST | `/auth/newpassword` | Reset password | No |

### Contact Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/contact/create` | Create contact | Yes |
| PUT | `/contact/create` | Update contact | Yes |
| DELETE | `/contact/create` | Delete contact | Yes |
| GET | `/contact/allcontacts` | List all contacts | Yes |
| POST | `/contact/multicreate` | Create multiple contacts | Yes |
| POST | `/contact/bulk` | Import contacts from file | Yes |
| POST | `/contact/retrive` | Retrieve contacts with filtering | Yes |

## Request Examples

### Register User
```json
POST /auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure123"
}
```

### Create Contact
```json
POST /contact/create
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phoneNumber": "1234567890",
  "address": "123 Main St"
}
```

### Retrieve Contacts
```
POST /contact/retrive?startDate=2024-01-01T00:00:00Z&endDate=2024-12-31T23:59:59Z&timezone=Asia/Kolkata

Request Body (optional):
{
  "timezone": "Asia/Kolkata"
}

Response:
{
  "contactsWithConvertedTimestamps": [
    {
      "id": "uuid",
      "createdAt": "2024-01-15T10:30:00+05:30",
      "updatedAt": "2024-01-15T10:30:00+05:30",
      "deleted": false,
      "userId": "uuid"
    }
  ],
  "timezone": {
    "time": "2024-01-15T10:30:00+05:30",
    "before": "2024-01-15T05:00:00Z",
    "zone": "Asia/Kolkata"
  },
  "zonedDate": "2024-01-15T10:30:00+05:30"
}
```

### Bulk Import
```
POST /contact/bulk
Content-Type: multipart/form-data
file: [CSV or Excel file]
```

## Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Server Error |

## Security Features

- JWT Authentication
- Password Hashing
- Email Verification
- Cookie-based Session
- Input Validation

## Error Response Format
```json
{
  "error": "Error description"
}
```

## Success Response Format
```json
{
  "success": "Success message",
  "data": {
    // Response data
  }
}
```

## File Import Format

### CSV/Excel Columns
- name (required)
- email (required)
- phoneNumber
- address

## Contact Retrieval Parameters

### Query Parameters
| Parameter | Description | Required |
|-----------|-------------|-----------|
| startDate | Start date for filtering contacts (ISO format) | No |
| endDate | End date for filtering contacts (ISO format) | No |
| timezone | Timezone for date conversions (default: UTC) | No |

### Features
- Date range filtering
- Timezone conversion support
- Excludes deleted contacts
- JWT authentication required

## Author & License

Created by Pavan
MIT License