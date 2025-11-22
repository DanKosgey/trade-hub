import { supabase } from '../supabase/client';
import { TradeEntry } from '../types';

export const journalService = {
  // Fetch all journal entries for a user
  async getJournalEntries(userId: string): Promise<TradeEntry[]> {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;

      return data.map(entry => ({
        id: entry.id,
        pair: entry.pair,
        type: entry.type,
        entryPrice: entry.entry_price,
        stopLoss: entry.stop_loss,
        takeProfit: entry.take_profit,
        status: entry.status,
        validationResult: entry.validation_result,
        notes: entry.notes,
        date: entry.date,
        emotions: entry.emotions,
        pnl: entry.pnl,
        exitPrice: entry.exit_price,
        screenshotUrl: entry.screenshot_url
      }));
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      throw error;
    }
  },

  // Create a new journal entry
  async createJournalEntry(entry: Omit<TradeEntry, 'id'>, userId: string): Promise<TradeEntry | null> {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: userId,
          pair: entry.pair,
          type: entry.type,
          entry_price: entry.entryPrice,
          stop_loss: entry.stopLoss,
          take_profit: entry.takeProfit,
          exit_price: entry.exitPrice,
          status: entry.status,
          validation_result: entry.validationResult,
          notes: entry.notes,
          date: entry.date,
          emotions: entry.emotions,
          pnl: entry.pnl,
          screenshot_url: entry.screenshotUrl
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        pair: data.pair,
        type: data.type,
        entryPrice: data.entry_price,
        stopLoss: data.stop_loss,
        takeProfit: data.take_profit,
        exitPrice: data.exit_price,
        status: data.status,
        validationResult: data.validation_result,
        notes: data.notes,
        date: data.date,
        emotions: data.emotions,
        pnl: data.pnl,
        screenshotUrl: data.screenshot_url
      };
    } catch (error) {
      console.error('Error creating journal entry:', error);
      return null;
    }
  },

  // Update a journal entry
  async updateJournalEntry(id: string, updates: Partial<TradeEntry>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .update({
          pair: updates.pair,
          type: updates.type,
          entry_price: updates.entryPrice,
          stop_loss: updates.stopLoss,
          take_profit: updates.takeProfit,
          exit_price: updates.exitPrice,
          status: updates.status,
          validation_result: updates.validationResult,
          notes: updates.notes,
          date: updates.date,
          emotions: updates.emotions,
          pnl: updates.pnl,
          screenshot_url: updates.screenshotUrl
        })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating journal entry:', error);
      return false;
    }
  },

  // Delete a journal entry
  async deleteJournalEntry(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      return false;
    }
  }
};