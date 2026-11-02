import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User.model';
import { signUpSchema } from '@/schemas/signUpSchema';
import bcrypt from 'bcryptjs';
export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ success: false, message: 'Invalid request.' }, { status: 400 }); }
  const parsed = signUpSchema.safeParse(body);
  if (!parsed.success) return Response.json({ success: false, message: parsed.error.issues[0].message }, { status: 400 });
  try {
    await dbConnect();
    const { name, username, password } = parsed.data;
    const email = parsed.data.email.toLowerCase();
    if (await UserModel.exists({ $or: [{ email }, { username }] })) return Response.json({ success: false, message: 'That email or username already has an account. Please sign in.' }, { status: 409 });
    await UserModel.create({ name, username, email, password: await bcrypt.hash(password, 12), isVerified: false });
    return Response.json({ success: true, message: 'Your account is ready. Welcome to the table.' }, { status: 201 });
  } catch (error) {
    const duplicate = typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
    return Response.json({ success: false, message: duplicate ? 'That email or username already has an account.' : 'Unable to create your account. Please try again.' }, { status: duplicate ? 409 : 503 });
  }
}
