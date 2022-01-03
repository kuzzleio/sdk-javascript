/**
 * Generic API action arguments
 */
export interface ArgsDefault {
  queuable?: boolean;

  timeout?: number;

  [name: string]: any;
}
