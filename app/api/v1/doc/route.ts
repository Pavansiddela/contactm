import { NextRequest, NextResponse } from "next/server";
import a from "@/data/openapispec.json";

export const GET = async (req: NextRequest) => {
  console.log(a);
  return NextResponse.json(a);
};
