import pool from "@/lib/db";
import DeleteAndReseedButton from "./DeleteAndReseedButton";

export default async function TestDbPage() {
  try {
    // Query current users
    const { rows } = await pool.query(
      "SELECT id, fname, lname, email, username, type FROM users"
    );

    return (
      <div>
        <h1>Database Test Page ✅</h1>
        <DeleteAndReseedButton />

        <h2 className="mt-4">Users in Database:</h2>
        <ul>
          {Array.isArray(rows) && rows.length > 0 ? (
            rows.map((user) => (
              <li key={user.id}>
                <strong>{user.fname} {user.lname}</strong> — {user.email} ({user.username}) [{user.type}]
              </li>
            ))
          ) : (
            <li>No users found.</li>
          )}
        </ul>
      </div>
    );
  } catch (err) {
    return <pre>Database error: {String(err)}</pre>;
  }
}
