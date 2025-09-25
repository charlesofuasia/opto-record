import { NextResponse } from "next/server";
import { resetDatabase } from "../../actions";

export async function POST() {
  try {
    await resetDatabase();
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const errorMessage = (err instanceof Error) ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
