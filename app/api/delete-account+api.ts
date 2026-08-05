import { createClient } from '@supabase/supabase-js';

/**
 * Permanently deletes the calling user's account. Requires the service role key (server-only —
 * regular users can't delete their own auth.users row via the anon key), so this can't run
 * client-side. Cloud-synced data (user_store_state) cascades on delete — see
 * supabase/migrations/0001_user_store_state.sql.
 */
export async function POST(request: Request): Promise<Response> {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json(
      { error: 'Account deletion is not configured. Set SUPABASE_SERVICE_ROLE_KEY on the server.' },
      { status: 503 },
    );
  }

  const authHeader = request.headers.get('authorization') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;
  if (!token) {
    return Response.json({ error: 'Missing access token.' }, { status: 401 });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: userResult, error: userError } = await adminClient.auth.getUser(token);
  if (userError || !userResult.user) {
    return Response.json({ error: 'Invalid or expired session.' }, { status: 401 });
  }

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(userResult.user.id);
  if (deleteError) {
    return Response.json({ error: deleteError.message }, { status: 500 });
  }

  return Response.json({ deleted: true });
}
