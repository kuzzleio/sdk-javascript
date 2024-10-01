/**
 * Generic API action arguments
 */
export interface ArgsDefault {
  queuable?: boolean;

  timeout?: number;

  triggerEvents?: boolean;

  [name: string]: any;
}
