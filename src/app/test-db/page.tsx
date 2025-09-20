import pool from "@/lib/db";
import DeleteAndReseedButton from "./DeleteAndReseedButton";

export default async function Page() {
  type User = {
    id: number;
    fname: string;
    lname: string;
    email: string;
    username: string;
    type: string;
  }

  const { rows } = await pool.query(
    "SELECT id, fname, lname, email, username, type FROM users"
  );

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Test Page ✅</h1>

      {/* Button now calls API internally, no props needed */}
      <DeleteAndReseedButton />

      <h2 className="mt-6 text-xl font-semibold">Users in Database:</h2>
      <ul className="mt-2 list-disc pl-6">
        {rows.length > 0 ? (
          rows.map((user: User) => (
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
}
