import { NextResponse } from "next/server";
import { getCmsData } from "@/lib/cms/store";

export async function GET() {
  const cms = await getCmsData();

  return NextResponse.json(cms, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
