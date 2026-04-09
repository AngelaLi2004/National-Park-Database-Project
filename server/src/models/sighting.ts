export interface Sighting {
    SightingID: number;
    UserID: number;
    LocationID: number;
    SpeciesID: number;
    SightingDate: string | Date; 
    ImageURL?: string;
    Description?: string;
}