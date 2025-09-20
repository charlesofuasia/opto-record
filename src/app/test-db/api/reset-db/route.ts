import { NextResponse } from "next/server";
import { resetDatabase } from "../../actions";

export async function POST() {
  try {
    await resetDatabase();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
