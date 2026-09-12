// app/api/modules/route.ts
// Two modes query params:
// GET /api/modules  -> ordered list of all modules (id + title only, for nav)
// GET /api/modules?id=mod1 -> that module's full content, joined with its document
// GET /api/modules?id=mod1&language=pa -> same, but content in that language (falls back to English)


import { NextRequest, NextResponse} from 'next/server';
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const language = searchParams.get('language') || 'en';

  if (id) {
    const { data, error } = await supabase
      .from("induction_modules")
      .select(`
        id,
        title,
        display_order,
        document_id,
        documents( id, title, version, category, content)
        `)
      .eq("id", id)
      .single();
    if (error || !data) {
      return NextResponse.json({ error: error?.message || "Module not found" }, { status: 404});
    }

    // Supabase returns the joined table as an object for a to-one relationship,
    // but guard against the array shape too, just in case
    const doc = Array.isArray(data.documents) ? data.documents[0] : data.documents;
    if (!doc) {
      return NextResponse.json({ error: "No document linked to this module" }, {status: 404 });
    }

    return NextResponse.json({
        id: data.id,
        title: data.title,
        order: data.display_order,
        documentId: data.document_id,
        version: doc.version,
        category: doc.category,
        // Falls back to English if this language hasn't been translated into
        // the content jsonb yet — important right now since only "en" exists.
        content: doc.content?.[language] ?? doc.content?.en ?? "",
        availableLanguages: Object.keys(doc.content || {}),
    });
  }

  // No id -> return the ordered module list, used to build the next/previous nav
  const { data, error } = await supabase
    .from("induction_modules")
    .select("id, title, display_order")
    .order("display_order", { ascending: true });
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}