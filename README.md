# Chat Assistant Node.js App

This is a Node.js application built using TypeScript that serves as a chat assistant. It integrates with a chat service and utilizes the OpenAI API to provide responses to messages.

## Prerequisites

Before running the application, ensure you have the following prerequisites installed on your system:

- Node.js (version 18 and above)
- [Docker](https://docs.docker.com/get-docker/): Install Docker to run containers.

## Getting Started

### Starting the Database using Docker Compose

To run the database for this application locally, you can use Docker Compose with the provided `docker-compose-db.yml` file.

#### Starting the Database

Follow these steps to start the database using Docker Compose:

1. **Navigate to the Project Directory:**

   Open your terminal and navigate to the root directory of your project where the `docker-compose-db.yml` file is located.

2. **Start the Database Containers:**

   Run the following command to start the database containers defined in the `docker-compose-db.yml` file:

   ```bash
   docker-compose -f docker-compose-db.yml up -d

### Starting the application

Follow these steps to get the application up and running locally.

1. Install project dependencies:

   ```bash
   npm install
   ```

1. Configure Environment Variables:
Create a `.env` file based on `.env.test` file in the root directory of the project and set the environment variables according to your configuration.

1. Start the Application: Build &
Run the Node.js application:

   ```bash
   npm run build
   npm start
   ```

### Testing

You can run tests for the application using the following command:

   ```bash
   npm test
   ```