# Grocery Booking API

## Introduction
An easy-to-use RESTful API for admins to handle grocery items and for users to browse and reserve groceries hassle-free.

## Features

- **Express.js**: A fast, unopinionated, minimalist web framework for Node.js.
- **Routing**: Basic routing setup for handling different endpoints and HTTP methods.
- **Configuration**: Environment variables and configuration setup using the dotenv package.
- **JSON Responses**: JSON as the default response format for API endpoints.
- **Error Handling**: Centralized error handling and custom error classes for better control.
- **Logging**: Integration with a logging library for capturing application logs.
- **Linting**: Pre-configured ESLint setup for code linting and formatting.
- **Security**: Includes basic security practices like `helmet` for HTTP headers and input validation.
- **Gitignore**: Commonly ignored files and directories are already set up.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (>=14.x)
- npm (Node Package Manager) or Yarn

## Getting Started

1. Clone this repository to your local machine:

    ```bash
    git clone https://github.com/Clumsynite/qp-assessment
    ```


2. Navigate to the project directory:

    ```bash
    cd qp-assessment
    ```

3. Install the dependencies:

    ```bash
    npm install
    ```

    or

    ```bash
    yarn install
    ```

4. Rename the `.env.example` file to `.env` and customize the environment variables as needed.

5. Start the server:

    ```bash
    npm dev
    ```

Your Express server should now be up and running at http://localhost:5000.


## Usage

- Create your **\`routes\`** in the routes directory following the existing examples.
- Organize your controllers and business logic in the **\`controllers\`** directory.
- Store your data models in the **\`models\`** directory.
- Add your application-specific middleware in the **\`middlewares\`** directory.


## Knex

### New Migration

```bash
npx knex --knexfile ./src/knexFile.ts migrate:make "migration-name" +x ts # new migration
npx knex --knexfile ./src/knexFile.ts migrate:latest +x ts # Add all migrations to db
npx knex --knexfile ./src/knexFile.ts migrate:down "filename.ts" # Remove Migration
npx knex --knexfile ./src/knexFile.ts migrate:up "filename.ts" # Add Migration

```

### Seed

```bash
npx knex --knexfile ./src/knexFile.ts seed:run +x ts ## Add seed data to db
```