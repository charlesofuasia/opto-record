import pool from "@/lib/db";

export default async function TestDbPage() {
  try {
    // Run a simple SELECT query on your users table
    const { rows } = await pool.query(
      "SELECT id, name, email, created_at FROM users"
    );

    return (
      <div>
        <h1>Database Connection Works ✅</h1>
        <ul>
          {Array.isArray(rows) && rows.length > 0 ? (
          rows.map((user) => (
            <li key={user.id}>
              {user.name} ({user.email}) —{" "}
              {new Date(user.created_at).toLocaleString()}
            </li>
          ))
        ) : (
            <li>No users found.</li>
        )}
        </ul>
      </div>
    );
  } catch (err) {
    // Show error if DB connection/query fails
    return <pre>Database error: {String(err)}</pre>;
  }
}
