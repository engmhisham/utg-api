# UTG-Dashboard API

A comprehensive dashboard API built with NestJS and TypeORM for managing website content with multilingual support (Arabic and English).

## Features

- **Authentication**: JWT-based authentication with role-based access control
- **Content Management**: Manage clients, team members, testimonials, brands, and FAQs
- **SEO Management**: Control SEO settings for the entire site and individual pages
- **Contact Messages**: Handle user inquiries and contact form submissions
- **File Management**: Upload and manage images and other media files
- **Multilingual Support**: Full support for Arabic and English content
- **Audit Logging**: Track all system actions for security and accountability

## Prerequisites

- Node.js (v14+)
- PostgreSQL database
- npm or yarn

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd utg-dashboard-api
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following content:

```
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-password
DB_DATABASE=utg_dashboard
DB_SYNC=true  # Set to false in production

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRATION=1d

# App Configuration
PORT=3000
NODE_ENV=development

# File Upload Limits
MAX_FILE_SIZE=5242880  # 5MB
```

4. Create the upload directory:

```bash
mkdir uploads
```

5. Create the database:

```bash
createdb utg_dashboard
```

## Running the Application

### Development Mode

```bash
npm run start:dev
```

### Production Mode

```bash
npm run build
npm run start:prod
```

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login with email and password
- `GET /api/auth/profile` - Get current user profile
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout

### Users

- `GET /api/users` - Get all users (admin only)
- `POST /api/users` - Create a new user (admin only)
- `GET /api/users/:id` - Get user by ID (admin only)
- `PATCH /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### SEO General Settings

- `GET /api/seo-general?language=en|ar` - Get general SEO settings
- `PUT /api/seo-general` - Update general SEO settings (admin only)

### Page SEO

- `GET /api/page-seo?language=en|ar` - Get all page SEO settings
- `POST /api/page-seo` - Create a new page SEO (admin only)
- `GET /api/page-seo/:id` - Get page SEO by ID
- `GET /api/page-seo/by-url/:url?language=en|ar` - Get page SEO by URL
- `PATCH /api/page-seo/:id` - Update page SEO (admin only)
- `DELETE /api/page-seo/:id` - Delete page SEO (admin only)

### Clients

- `GET /api/clients?language=en|ar&status=active|inactive` - Get all clients
- `POST /api/clients` - Create a new client (admin only)
- `GET /api/clients/:id?language=en|ar` - Get client by ID
- `PATCH /api/clients/:id` - Update client
- `PATCH /api/clients/:id/status` - Update client status (admin only)
- `DELETE /api/clients/:id` - Delete client (admin only)
- `PATCH /api/clients/reorder` - Reorder clients
- `POST /api/clients/bulk-action` - Perform bulk actions on clients

### Team Members

- `GET /api/team-members?language=en|ar&status=active|inactive` - Get all team members
- `POST /api/team-members` - Create a new team member (admin only)
- `GET /api/team-members/:id?language=en|ar` - Get team member by ID
- `PATCH /api/team-members/:id` - Update team member
- `PATCH /api/team-members/:id/status` - Update team member status (admin only)
- `DELETE /api/team-members/:id` - Delete team member (admin only)
- `PATCH /api/team-members/reorder` - Reorder team members
- `POST /api/team-members/bulk-action` - Perform bulk actions on team members

### Testimonials

- `GET /api/testimonials?language=en|ar&status=published|draft` - Get all testimonials
- `POST /api/testimonials` - Create a new testimonial (admin only)
- `GET /api/testimonials/:id?language=en|ar` - Get testimonial by ID
- `PATCH /api/testimonials/:id` - Update testimonial
- `PATCH /api/testimonials/:id/status` - Update testimonial status (admin only)
- `DELETE /api/testimonials/:id` - Delete testimonial (admin only)
- `PATCH /api/testimonials/reorder` - Reorder testimonials
- `POST /api/testimonials/bulk-action` - Perform bulk actions on testimonials

### Brands

- `GET /api/brands?language=en|ar&status=active|inactive` - Get all brands
- `POST /api/brands` - Create a new brand (admin only)
- `GET /api/brands/:id?language=en|ar` - Get brand by ID
- `PATCH /api/brands/:id` - Update brand
- `PATCH /api/brands/:id/status` - Update brand status (admin only)
- `DELETE /api/brands/:id` - Delete brand (admin only)
- `PATCH /api/brands/reorder` - Reorder brands
- `POST /api/brands/bulk-action` - Perform bulk actions on brands

### FAQs

- `GET /api/faqs?language=en|ar&category=general|technical|services&status=active|inactive` - Get all FAQs
- `POST /api/faqs` - Create a new FAQ (admin only)
- `GET /api/faqs/:id?language=en|ar` - Get FAQ by ID
- `PATCH /api/faqs/:id` - Update FAQ
- `PATCH /api/faqs/:id/status` - Update FAQ status (admin only)
- `DELETE /api/faqs/:id` - Delete FAQ (admin only)
- `PATCH /api/faqs/reorder` - Reorder FAQs
- `POST /api/faqs/bulk-action` - Perform bulk actions on FAQs

### Contact Messages

- `GET /api/contact-messages?language=en|ar&read=true|false` - Get all contact messages
- `POST /api/contact-messages` - Create a new contact message (public)
- `GET /api/contact-messages/:id` - Get contact message by ID
- `PATCH /api/contact-messages/:id/read` - Mark contact message as read/unread
- `DELETE /api/contact-messages/:id` - Delete contact message (admin only)
- `POST /api/contact-messages/bulk-action` - Perform bulk actions on messages

### Files

- `POST /api/files/upload` - Upload a file
- `GET /api/files` - Get all files
- `GET /api/files/:filename` - Get file details
- `DELETE /api/files/:filename` - Delete a file (admin only)

### Settings

- `GET /api/settings?language=en|ar` - Get website settings
- `PUT /api/settings` - Update website settings (admin only)

### Audit Logs

- `GET /api/audit-logs` - Get all audit logs (admin only)
- `GET /api/audit-logs/by-entity?entity=client&entityId=123` - Get logs by entity
- `GET /api/audit-logs/by-user?userId=123` - Get logs by user

## Project Structure

```
utg-dashboard-api/
├── src/
│   ├── app.module.ts               # Application main module
│   ├── main.ts                     # Application entry point
│   ├── auth/                       # Authentication module
│   ├── users/                      # Users module
│   ├── common/                     # Shared resources
│   ├── seo-general/                # SEO General Settings module
│   ├── page-seo/                   # Page SEO module
│   ├── clients/                    # Clients module
│   ├── team-members/               # Team Members module
│   ├── testimonials/               # Testimonials module
│   ├── brands/                     # Brands module
│   ├── faqs/                       # FAQs module
│   ├── contact-messages/           # Contact Messages module
│   ├── files/                      # Files module
│   ├── settings/                   # Settings module
│   └── audit-logs/                 # Audit Logs module
├── uploads/                        # File storage directory
├── .env                            # Environment variables
└── package.json                    # Project dependencies
```

## Creating an Admin User

The first admin user should be created directly in the database or via a special setup script. After that, the admin can create more users through the API.

Example script for creating the first admin user:

```typescript
// scripts/create-admin.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/users/users.service';
import { UserRole } from '../src/users/entities/user.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  
  try {
    await usersService.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'strongPassword123',
      role: UserRole.ADMIN,
    });
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error creating admin user:', error.message);
  } finally {
    await app.close();
  }
}

bootstrap();
```

Run with:

```bash
npx ts-node scripts/create-admin.ts
```

## Security Considerations

1. Set `DB_SYNC=false` in production to prevent accidental schema changes
2. Use a strong, unique `JWT_SECRET` in production
3. Store sensitive information in environment variables
4. Regularly update dependencies
5. Implement rate limiting for public endpoints

## License

[MIT](LICENSE)