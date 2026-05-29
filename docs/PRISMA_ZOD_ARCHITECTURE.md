# OptiConnect GIS: Modern Architecture Documentation

This document explains the modern architectural additions to the OptiConnect GIS backend: **Prisma (ORM)** and **Zod (Validation)**. These tools enhance database security, developer experience, and application stability.

---

## 1. Prisma (Database ORM)

Prisma is a modern Object-Relational Mapper (ORM) that replaces raw SQL string queries with type-safe JavaScript methods.

### Why We Use It
* **Type Safety:** Prevents typos in column names or table names.
* **Auto-Migrations:** Automatically tracks changes to the database schema.
* **Security:** Automatically sanitizes inputs to prevent SQL Injection.
* **IntelliSense:** Provides autocomplete in VSCode for all database queries.

### Core Files & Directories
* `backend/prisma/schema.prisma` -> The single source of truth for the database schema.
* `backend/sql/migrations/` -> Contains historical SQL dumps (used alongside Prisma for legacy systems).
* `backend/src/config/database.js` -> Initializes the Prisma Client using the `@prisma/adapter-pg` driver, allowing Prisma to share the existing connection pool.
* `backend/src/generated/prisma/` -> The auto-generated client code.

### How It Works in Code
**Raw SQL (Legacy):**
```javascript
const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
const user = result.rows[0];
```

**Prisma (Modern):**
```javascript
const user = await prisma.users.findUnique({
  where: { email: email }
});
```

### The PostGIS Exception
Prisma does not have native support for advanced PostGIS spatial functions (like `ST_AsMVT`, `ST_Intersects`, etc.). For complex spatial queries, we use Prisma's raw query escape hatch:
```javascript
const result = await prisma.$queryRawUnsafe(`
  SELECT ST_AsMVT(...) FROM network_features
`);
// NOTE: Prisma returns bytea (binary data) as a Uint8Array, not a Node.js Buffer.
// For spatial endpoints, we explicitly cast this to a Buffer:
return Buffer.from(result[0].mvt);
```

### Deployment Impact
The Prisma Client is architecture-specific (it compiles different native bindings for Windows vs. Linux).
During deployment (`master_executor.sh`), the script:
1. Copies the source code to the server.
2. Runs `npx prisma generate` directly on the Ubuntu server.
This ensures the Linux server runs the Linux version of the Prisma client, preventing architecture mismatch errors.

---

## 2. Zod (Input Validation)

Zod is a TypeScript-first schema declaration and validation library. We use it to validate all incoming HTTP request payloads (`req.body`, `req.query`, `req.params`) before they reach our business logic.

### Why We Use It
* **Security:** Prevents bad data, malicious payloads, and NoSQL/SQL injections from entering the system.
* **Stability:** Throws clear 400 Bad Request errors instead of causing 500 Internal Server errors deep in the database code.
* **Documentation:** The schemas act as living documentation for what an API endpoint expects.

### How It Works in Code
**1. Define a Schema:**
```javascript
const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters")
});
```

**2. Validate the Request:**
We use a middleware wrapper to apply the schema to an Express route:
```javascript
const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body); // Validates and strips unknown fields
    next();
  } catch (error) {
    res.status(400).json({ success: false, errors: error.errors });
  }
};

// Apply to route
router.post('/login', validate(loginSchema), authController.login);
```

If a user sends `{"email": "not-an-email"}`, Zod immediately rejects the request with a clean error message, and the controller never even runs.

---

## 3. Summary of API Flow

1. **Client** makes an HTTP POST request.
2. **Express Router** receives the request.
3. **Zod Middleware** intercepts and validates the payload against a strict schema.
4. If invalid, returns `400 Bad Request`.
5. If valid, passes the sanitized payload to the **Controller**.
6. The **Service Layer** uses **Prisma** to safely interact with the PostgreSQL database.
7. The database responds, and the **Controller** sends a `200 OK` response back to the client.
