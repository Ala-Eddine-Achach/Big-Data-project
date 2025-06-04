# Your Project Title

## Description

Briefly describe your project here. What does it do? What problem does it solve? What are its main features?

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   **Docker Desktop:** This includes Docker Engine and Docker Compose. You can download it from the official Docker website: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Ala-Eddine-Achach/Big-Data-project.git
    cd Big-Data-project
    ```

2.  **Ensure required files are present:**
    Make sure you have the following files in your project's root directory:
    *   `docker-compose.yml`: Defines the PostgreSQL and pgAdmin services.
    *   `db/init.sql`: (Optional, but recommended for initial table creation) A SQL script that runs when the PostgreSQL container starts for the first time.
    *   `pull_requests_db_backup.sql`: The database backup file you want to restore.

    Your directory structure should look something like this:

    ```
    your_project_folder/
    ├── docker-compose.yml
    ├── pull_requests_db_backup.sql
    └── db/
        └── init.sql
    ```

## Database Setup and Restoration

This section provides instructions on how to set up the PostgreSQL and pgAdmin services using Docker Compose, and then restore the `pull_requests_db` database from a backup file.

### 1. Start Docker Services

Navigate to the directory containing your `docker-compose.yml` file in your terminal and run the following command to start the PostgreSQL and pgAdmin containers:

```bash
docker-compose up -d
```

*   `docker-compose up`: Starts the services defined in `docker-compose.yml`.
*   `-d`: Runs the services in detached mode (in the background).

This will download the necessary Docker images (if not already present) and start the `postgres` and `pgadmin` containers.

### 2. Verify Containers Are Running

You can check if the containers are running correctly with this command:

```bash
docker-compose ps
```

You should see both `postgres_db` and `pgadmin` containers listed with a `State` of `Up`.

### 3. Restore the Database from Backup

Once the `postgres` container is up and running, you can restore your database using the `psql` command. Make sure your `pull_requests_db_backup.sql` file is in the same directory where you run this command.

```bash
docker-compose exec -T postgres psql -U user pull_requests_db < pull_requests_db_backup.sql
```

Let's break down this command:

*   `docker-compose exec postgres`: Executes a command inside the `postgres` service container.
*   `-T`: Disables pseudo-TTY allocation. This is useful when piping input.
*   `psql`: The PostgreSQL command-line client.
*   `-U user`: Specifies the PostgreSQL username (`user` is defined in `docker-compose.yml`).
*   `pull_requests_db`: Specifies the database name to connect to (also defined in `docker-compose.yml`).
*   `< pull_requests_db_backup.sql`: Redirects the content of your backup file as input to the `psql` command, effectively executing all the SQL commands in the backup file to restore the database.

### 4. Access pgAdmin (Optional Verification)

You can use pgAdmin to visually verify that your database has been restored successfully.

1.  Open your web browser and navigate to `http://localhost:9099`.
2.  Log in to pgAdmin using the default credentials:
    *   **Email:** `pgadmin@example.com`
    *   **Password:** `admin`
3.  If you haven't already, add a new server connection:
    *   Right-click on "Servers" -> "Create" -> "Server...".
    *   **General Tab:**
        *   **Name:** `PostgreSQL Local` (or any name you prefer)
    *   **Connection Tab:**
        *   **Host name/address:** `postgres`
        *   **Port:** `5432`
        *   **Maintenance database:** `pull_requests_db`
        *   **Username:** `user`
        *   **Password:** `password`
    *   Click "Save".
4.  Once connected, expand the `pull_requests_db` database and its schemas to see the tables and data that have been restored.

## Usage

Provide instructions on how to use your application once it's set up. For example:

```bash
# Run your main application command
python main.py
```

## Running Tests

Explain how to run any tests for your project. For example:

```bash
pytest
```

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Your Name - your_email@example.com

Project Link: [https://github.com/Ala-Eddine-Achach/Big-Data-project](https://github.com/Ala-Eddine-Achach/Big-Data-project)

## Acknowledgments

*   List any resources, tutorials, or open-source projects that helped you. 