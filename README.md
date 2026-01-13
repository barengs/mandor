# Mandor - Project Management Tool

Mandor is a modern, full-featured project management application designed to streamline team collaboration and task tracking. Built with a robust Laravel backend and a dynamic React frontend, it offers a seamless experience for managing workspaces, projects, and tasks.

## 🚀 Features

-   **Workspace Management**: Organize your projects into distinct workspaces.
-   **Project Tracking**: Create and manage projects with ease.
-   **Kanban Board**: Visual task management with drag-and-drop support.
-   **Dynamic Statuses**: Customizable project workflow statuses.
-   **Multi-language Support**: Fully localized in English and Indonesian (Bahasa Indonesia).
-   **Authentication**: Secure user registration and login system.
-   **Responsive Design**: Optimized for both desktop and mobile devices.
-   **Dark Mode**: Built-in support for light and dark themes.

## 🛠️ Tech Stack

### Frontend

-   **React 18**: Library for building user interfaces.
-   **Vite**: Next Generation Frontend Tooling.
-   **Tailwind CSS**: Utility-first CSS framework for styling.
-   **React Router DOM**: Client-side routing.
-   **TanStack Query**: Powerful asynchronous state management.
-   **i18next**: Internationalization framework.
-   **Lucide React**: Beautiful & consistent icons.

### Backend

-   **Laravel 11**: The PHP Framework for Web Artisans.
-   **MySQL**: Relational database management system.
-   **Sanctum**: API authentication system.

## ⚙️ Installation

Follow these steps to set up the project locally.

### Prerequisites

-   PHP >= 8.2
-   Composer
-   Node.js & npm
-   MySQL

### Backend Setup

1.  **Clone the repository**

    ```bash
    git clone https://github.com/yourusername/mandor.git
    cd mandor
    ```

2.  **Install PHP dependencies**

    ```bash
    composer install
    ```

3.  **Environment Configuration**
    Copy the example env file and configure your database settings.

    ```bash
    cp .env.example .env
    ```

    Update `.env` with your database credentials:

    ```env
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=mandor
    DB_USERNAME=root
    DB_PASSWORD=
    ```

4.  **Generate App Key**

    ```bash
    php artisan key:generate
    ```

5.  **Run Migrations**

    ```bash
    php artisan migrate
    ```

6.  **Serve Application**
    ```bash
    php artisan serve
    ```

### Frontend Setup

1.  **Install Node dependencies**

    ```bash
    npm install
    ```

2.  **Start Development Server**
    ```bash
    npm run dev
    ```

The application should now be accessible at `http://localhost:5173` (or the URL provided by Vite), communicating with the Laravel backend at `http://localhost:8000`.

## 📄 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
