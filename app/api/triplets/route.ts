import { NextResponse } from "next/server";
import { deleteTriplet, getAllTriplets } from "@/lib/kg/db";

export async function GET() {
  try {
    const triplets = await getAllTriplets();
    return NextResponse.json({ success: true, data: triplets });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { subject, predicate, object } = body;

    if (!subject || !predicate || !object) {
      return NextResponse.json({ success: false, error: "Missing triplet components" }, { status: 400 });
    }

    await deleteTriplet(subject, predicate, object);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
