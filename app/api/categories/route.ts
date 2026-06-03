import { auth } from "@/auth";
import { isProducerOrAdmin } from "@/lib/auth/permissions";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/db/categories";
import {
  categorySchema,
  categoryUpdateSchema,
} from "@/lib/validations/category";

export async function GET() {
  const session = await auth();
  if (!isProducerOrAdmin(session)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const categories = await listCategories();
  return Response.json({ categories });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!isProducerOrAdmin(session)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Ugyldig data" }, { status: 400 });
  }

  const category = await createCategory(parsed.data);
  return Response.json({ category }, { status: 201 });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!isProducerOrAdmin(session)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = categoryUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Ugyldig data" }, { status: 400 });
  }

  const { id, ...data } = parsed.data;
  const category = await updateCategory(id, data);
  if (!category) {
    return Response.json({ error: "Ikke funnet" }, { status: 404 });
  }
  return Response.json({ category });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!isProducerOrAdmin(session)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) {
    return Response.json({ error: "Mangler id" }, { status: 400 });
  }

  await deleteCategory(id);
  return Response.json({ success: true });
}
