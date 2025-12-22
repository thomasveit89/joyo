'use server';

import { createClient } from '@/lib/supabase/server';
import { SessionAnswer } from '@/types/flow';

export async function createSessionAction(projectId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('sessions')
      .insert({
        project_id: projectId,
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Create session error:', error);
      return { error: 'Failed to create session' };
    }

    return { success: true, sessionId: data.id };
  } catch (error) {
    console.error('Create session action error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function updateSessionAction(
  sessionId: string,
  answers: SessionAnswer[],
  completed: boolean
) {
  try {
    const supabase = await createClient();

    const updateData: any = {
      answers,
      updated_at: new Date().toISOString(),
    };

    if (completed) {
      updateData.completed = true;
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await supabase.from('sessions').update(updateData).eq('id', sessionId);

    if (error) {
      console.error('Update session error:', error);
      return { error: 'Failed to update session' };
    }

    return { success: true };
  } catch (error) {
    console.error('Update session action error:', error);
    return { error: 'An unexpected error occurred' };
  }
}
