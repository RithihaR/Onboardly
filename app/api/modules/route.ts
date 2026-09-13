// app/api/modules/route.ts
// Now company-aware. Every request should include ?company=warehouse or
// ?company=software (defaults to "warehouse" if omitted, so nothing that
// already calls this without the param breaks).
//   GET /api/modules?company=software                -> ordered list for that company
//   GET /api/modules?id=mod-sw1&company=software      -> that module's full content

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const language = searchParams.get("language") || "en";
  const company = searchParams.get("company") || "warehouse";

  if (id) {
    const { data, error } = await supabase
      .from("induction_modules")
      .select(`
        id,
        title,
        display_order,
        document_id,
        company_id,
        documents ( id, title, version, category, content )
      `)
      .eq("id", id)
      .eq("company_id", company)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message || "Module not found" }, { status: 404 });
    }

    const doc = Array.isArray(data.documents) ? data.documents[0] : data.documents;
    if (!doc) {
      return NextResponse.json({ error: "No document linked to this module" }, { status: 404 });
    }

    return NextResponse.json({
      id: data.id,
      title: data.title,
      order: data.display_order,
      documentId: data.document_id,
      version: doc.version,
      category: doc.category,
      content: doc.content?.[language] ?? doc.content?.en ?? "",
      availableLanguages: Object.keys(doc.content || {}),
    });
  }

  const { data, error } = await supabase
    .from("induction_modules")
    .select("id, title, display_order")
    .eq("company_id", company)
    .order("display_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}