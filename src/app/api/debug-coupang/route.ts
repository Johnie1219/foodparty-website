import crypto from "crypto";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getSignedDate(): string {
  const now = new Date();
  const yy = String(now.getUTCFullYear()).slice(2);
  const MM = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const HH = String(now.getUTCHours()).padStart(2, "0");
  const mm = String(now.getUTCMinutes()).padStart(2, "0");
  const ss = String(now.getUTCSeconds()).padStart(2, "0");
  return `${yy}${MM}${dd}T${HH}${mm}${ss}Z`;
}

export async function GET() {
  const accessKey = process.env.COUPANG_ACCESS_KEY;
  const secretKey = process.env.COUPANG_SECRET_KEY;

  if (!accessKey || !secretKey) {
    return NextResponse.json({ error: "API 키 없음", accessKey: !!accessKey, secretKey: !!secretKey });
  }

  const DOMAIN = "https://api-gateway.coupang.com";
  const path = "/v2/providers/affiliate_open_api/apis/openapi/v1/products/search";
  const keyword = "올리브오일";
  const limit = "5";

  const query = `keyword=${encodeURIComponent(keyword)}&limit=${limit}`;
  const signedDate = getSignedDate();
  const message = signedDate + "GET" + path + query;
  const signature = crypto.createHmac("sha256", secretKey).update(message).digest("hex");
  const auth = `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${signedDate}, signature=${signature}`;

  const url = `${DOMAIN}${path}?${query}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Authorization: auth, "Content-Type": "application/json;charset=UTF-8" },
      cache: "no-store",
    });

    const body = await res.text();

    return NextResponse.json({
      status: res.status,
      statusText: res.statusText,
      signedDate,
      message,
      query,
      url,
      responseBody: body,
      headers: Object.fromEntries(res.headers.entries()),
    });
  } catch (err) {
    return NextResponse.json({ fetchError: String(err) });
  }
}
