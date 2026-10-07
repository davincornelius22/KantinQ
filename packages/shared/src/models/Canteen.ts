export interface Canteen {
  Id: number;
  Name: string;
  Location: string;
  Description: string | null;
  IsActive: boolean;
  CreatedAt: string | Date;
}
