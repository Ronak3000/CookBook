export async function POST() {
  return Response.json({ success: false, message: 'Email codes are no longer required. Please sign in.' }, { status: 410 });
}
