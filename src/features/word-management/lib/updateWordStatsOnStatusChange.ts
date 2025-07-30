// This function is deprecated since we're using Supabase now
// Word stats should be managed through Supabase RPC functions
export async function updateWordStatsOnStatusChange({
  wordId,
  userId,
  oldStatus,
  newStatus,
}: {
  wordId: string;
  userId: string;
  oldStatus: number;
  newStatus: number;
}) {
  // TODO: Implement Supabase version if needed
  // For now, this is a no-op since Supabase handles word stats
  console.log("Word status change:", { wordId, userId, oldStatus, newStatus });
}

// This function is deprecated since we're using Supabase now
export async function updateWordStatsOnDeletion({
  wordId,
  userId,
  oldStatus,
}: {
  wordId: string;
  userId: string;
  oldStatus: number;
}) {
  // TODO: Implement Supabase version if needed
  // For now, this is a no-op since Supabase handles word stats
  console.log("Word deletion:", { wordId, userId, oldStatus });
}
