export interface CreateMenuItemDto {
  Name: string;
  Description?: string | null;
  Price: number;
  IsAvailable?: boolean;
}

export interface UpdateMenuItemDto {
  Name?: string;
  Description?: string | null;
  Price?: number;
  IsAvailable?: boolean;
}

export interface UpdateAvailabilityDto {
  IsAvailable: boolean;
}
