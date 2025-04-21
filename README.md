# Keepsake: Turn Real Estate Listings into Coloring Pages

Keepsake is a web application that transforms property photos into high-quality printable coloring book pages for real estate agents to use as marketing materials.

## Features

- Upload listing photos and transform them into coloring pages
- Secure payment processing with Stripe
- Artist review and processing workflow
- Client dashboard to view and download completed coloring pages
- Admin back-office for staff to manage orders

## Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **UI/UX**: Modern, clean design inspired by Apple and Canva
- **Authentication**: Email magic links and password-based auth
- **Payments**: Stripe integration

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/keepsake.git
cd keepsake
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) to see the application

## Project Structure

- `app/`: Next.js App Router pages and components
- `app/components/`: Shared UI components
- `app/upload/`: Image upload wizard
- `app/dashboard/`: Client dashboard
- `app/admin/`: Admin back-office

## Deployment

The application can be deployed on Vercel with minimal configuration:

```bash
npm run build
# or
yarn build
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
