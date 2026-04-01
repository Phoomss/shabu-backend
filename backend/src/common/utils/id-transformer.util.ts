import { Injectable } from '@nestjs/common';

/**
 * ID Transformer Utility
 * 
 * Converts raw database IDs to prefixed, encoded IDs for API responses
 * and decodes them back for database queries.
 * 
 * Format: {prefix}_{encoded_uuid}
 * Examples:
 * - inv_abc123... for Invoice
 * - ses_abc123... for Session
 * - ord_abc123... for Order
 * - tbl_123... for Table (int ID)
 * - usr_abc123... for User
 */

export enum IdPrefix {
  INVOICE = 'inv',
  SESSION = 'ses',
  ORDER = 'ord',
  TABLE = 'tbl',
  USER = 'usr',
  TIER = 'tier',
  MENU_ITEM = 'menu',
  CATEGORY = 'cat',
  KITCHEN = 'kit',
  INGREDIENT = 'ing',
  ORDER_ITEM = 'oi',
}

@Injectable()
export class IdTransformer {
  /**
   * Encode a UUID to a prefixed ID
   */
  encode(uuid: string, prefix: IdPrefix): string {
    if (!uuid || typeof uuid !== 'string') {
      throw new Error('Invalid UUID provided for encoding');
    }
    
    // Remove any existing prefix if present
    const rawId = this.decodeToRaw(uuid);
    
    // Simple encoding: replace dashes with a different character
    // This makes the ID shorter and less recognizable as a UUID
    const encoded = rawId.replace(/-/g, '');
    
    return `${prefix}_${encoded}`;
  }

  /**
   * Encode an integer ID to a prefixed ID
   */
  encodeInt(id: number, prefix: IdPrefix): string {
    if (typeof id !== 'number' || isNaN(id)) {
      throw new Error('Invalid ID provided for encoding');
    }
    
    // Pad the number to make it less predictable
    const padded = id.toString().padStart(6, '0');
    
    return `${prefix}_${padded}`;
  }

  /**
   * Decode a prefixed ID back to raw UUID
   */
  decode(prefixedId: string): string {
    if (!prefixedId || typeof prefixedId !== 'string') {
      throw new Error('Invalid prefixed ID provided for decoding');
    }

    const parts = prefixedId.split('_');
    if (parts.length < 2) {
      // Not a prefixed ID, might be a raw UUID
      return this.validateUuid(prefixedId);
    }

    // Remove the prefix and reconstruct the UUID
    const encoded = parts.slice(1).join('_');
    
    // Try to decode back to UUID format
    const rawId = this.decodeToRaw(prefixedId);
    
    return this.validateUuid(rawId);
  }

  /**
   * Decode a prefixed integer ID
   */
  decodeInt(prefixedId: string): number {
    if (!prefixedId || typeof prefixedId !== 'string') {
      throw new Error('Invalid prefixed ID provided for decoding');
    }

    const parts = prefixedId.split('_');
    if (parts.length < 2) {
      // Not a prefixed ID, try parsing as number
      const num = parseInt(prefixedId, 10);
      if (isNaN(num)) {
        throw new Error('Invalid integer ID');
      }
      return num;
    }

    const encoded = parts.slice(1).join('_');
    const num = parseInt(encoded, 10);
    
    if (isNaN(num)) {
      throw new Error('Invalid integer ID format');
    }
    
    return num;
  }

  /**
   * Check if a string is a prefixed ID with a specific prefix
   */
  isPrefixedId(value: string, prefix: IdPrefix): boolean {
    if (!value || typeof value !== 'string') {
      return false;
    }
    return value.startsWith(`${prefix}_`);
  }

  /**
   * Get the prefix from a prefixed ID
   */
  getPrefix(value: string): string | null {
    if (!value || typeof value !== 'string') {
      return null;
    }
    const parts = value.split('_');
    return parts.length > 0 ? parts[0] : null;
  }

  /**
   * Decode to raw ID without validation
   */
  private decodeToRaw(prefixedId: string): string {
    const parts = prefixedId.split('_');
    if (parts.length < 2) {
      return prefixedId;
    }
    
    const encoded = parts.slice(1).join('_');
    
    // Try to reconstruct UUID with dashes (36 characters = UUID with dashes)
    if (encoded.length === 32) {
      // Insert dashes back to form a standard UUID
      return `${encoded.slice(0, 8)}-${encoded.slice(8, 12)}-${encoded.slice(12, 16)}-${encoded.slice(16, 20)}-${encoded.slice(20)}`;
    }
    
    return encoded;
  }

  /**
   * Validate UUID format
   */
  private validateUuid(value: string): string {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new Error(`Invalid UUID format: ${value}`);
    }
    return value;
  }
}
