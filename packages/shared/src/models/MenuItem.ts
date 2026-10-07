export interface MenuItem {
  Id: number;
  CanteenId: number;
  Name: string;
  Description: string | null;
  Price: number;
  IsAvailable: boolean;
  CreatedAt: string | Date;
}
