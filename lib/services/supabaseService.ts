import { supabase } from '../supabase';

type OrderDirection = 'asc' | 'desc';

export class SupabaseService {
  static async create<T>(table: string, data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const payload: any = {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const { data: inserted, error } = await supabase.from(table).insert(payload).select('id').single();
    if (error) throw error;
    return (inserted as any).id;
  }

  static async getById<T>(table: string, id: string): Promise<T | null> {
    const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw error;
    return (data as T) ?? null;
  }

  static async getByUserId<T>(table: string, userId: string, orderByField?: string, orderDirection: OrderDirection = 'desc'): Promise<T[]> {
    let query = supabase.from(table).select('*').eq('user_id', userId);
    if (orderByField) query = query.order(orderByField, { ascending: orderDirection === 'asc' });
    const { data, error } = await query;
    if (error) throw error;
    return (data as T[]) || [];
  }

  static async update<T>(table: string, id: string, updates: Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
    const payload: any = { ...updates, updated_at: new Date().toISOString() };
    const { error } = await supabase.from(table).update(payload).eq('id', id);
    if (error) throw error;
  }

  static async delete(table: string, id: string): Promise<void> {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
  }

  static async query<T>(
    table: string,
    conditions: Array<{ field: string; operator: '==' | '!=' | '>' | '>=' | '<' | '<=' | 'in' | 'contains'; value: any }>,
    orderByField?: string,
    orderDirection: OrderDirection = 'desc',
    limitCount?: number
  ): Promise<T[]> {
    let query: any = supabase.from(table).select('*');

    for (const condition of conditions) {
      const { field, operator, value } = condition;
      switch (operator) {
        case '==':
          query = query.eq(field, value);
          break;
        case '!=':
          query = query.neq(field, value);
          break;
        case '>':
          query = query.gt(field, value);
          break;
        case '>=':
          query = query.gte(field, value);
          break;
        case '<':
          query = query.lt(field, value);
          break;
        case '<=':
          query = query.lte(field, value);
          break;
        case 'in':
          query = query.in(field, value);
          break;
        case 'contains':
          query = query.contains(field, value);
          break;
        default:
          query = query.eq(field, value);
      }
    }

    if (orderByField) query = query.order(orderByField, { ascending: orderDirection === 'asc' });
    if (limitCount) query = query.limit(limitCount);

    const { data, error } = await query;
    if (error) throw error;
    return (data as T[]) || [];
  }
}

export default SupabaseService;


