export interface SightingInput {
    UserID: number;
    LocationID: number;
    SpeciesID: number;
    SightingDate: string | Date; 
    ImageURL?: string;
    Description?: string;
}