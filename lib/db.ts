import { createClient } from "@libsql/client";

const db = createClient({
  url: "libsql://metafan-maarcotoselli.aws-eu-west-1.turso.io",
  authToken:
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzI3OTUyOTYsImlkIjoiMDE5Y2MyOGUtZDMwMS03YzYxLTg4YjUtMzFiMWY3N2ZjZmY5IiwicmlkIjoiZjExMDg3YzItMGYyOC00MzNmLTkyZTUtZjZkNTUyMTc0ODE0In0.hBgc2nqYNvNptQ7761MM-PfU19jmczo7UX7p-UlQUqUifQbafThs9oWILQIW3BWffD8ghK3k8qAkO0Pzd9m4BQ",
});

export default db;
