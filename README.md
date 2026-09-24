# PC & Laptop Inventory System

This version follows the basic structure of the provided Padyak project:

- React + Vite frontend
- Express backend
- Firebase Authentication
- Firestore used for user role data
- Bootstrap + Bootstrap Icons
- Separate `backend` and `frontend` folders

## Roles

There is no role selector in the login form.

The role is read from Firestore:

`users/{uid}.role`

Allowed roles:

- `admin`
- `superadmin`

### Admin

- View inventory
- Add PC/laptop
- Edit inventory
- Increase/decrease stock
- Search and filter inventory

### Superadmin

All Admin functions plus:

- Delete inventory items

## Backend

The Express backend runs on port `8080` and provides:

- `GET /api/inventory`
- `GET /api/inventory/:id`
- `POST /api/inventory`
- `PUT /api/inventory/:id`
- `PATCH /api/inventory/:id/quantity`
- `DELETE /api/inventory/:id`
- `GET /api/health`

The sample backend data is kept in memory, similar to the supplied Padyak backend. Restarting the backend resets the sample data.

## Run

From the project root:

```bash
npm install
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:8080`

Before running the frontend, copy:

`frontend/.env.local.example` → `frontend/.env.local`

Then put your Firebase Web App configuration values there.
