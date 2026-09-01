import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/cms/auth";
import { getFreshCmsData, listPublicImages, saveCmsData } from "@/lib/cms/store";
import { productImageLibrary } from "@/lib/cms/product-images";
import type { CmsData } from "@/lib/cms/types";

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    cms: await getFreshCmsData(),
    images: await listPublicImages(),
    productImages: productImageLibrary(await listPublicImages()),
  });
}

export async function PUT(request: Request) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as CmsData;
    if (!body.site || !Array.isArray(body.products)) {
      return NextResponse.json({ error: "Invalid CMS payload" }, { status: 400 });
    }

    const saved = await saveCmsData({
      ...body,
      version: body.version ?? 1,
    });

    return NextResponse.json({ cms: saved });
  } catch (error) {
    console.error("CMS save error:", error);
    return NextResponse.json(
      { error: "Unable to save CMS data. File writes may be read-only in production." },
      { status: 500 }
    );
  }
}
