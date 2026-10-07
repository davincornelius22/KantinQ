export interface CreateCanteenDto {
  Name: string;
  Location: string;
  Description?: string | null;
  IsActive?: boolean;
}

export interface UpdateCanteenDto {
  Name?: string;
  Location?: string;
  Description?: string | null;
  IsActive?: boolean;
}
