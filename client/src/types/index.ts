// Pet types
export interface Pet {
    pet_id: number;
    pet_name: string;
    type: PetType;
    race: string;
    size: PetSize;
    birth_date: string;
    creation_date: string;
    photo?: string;
    description?: string;
}

// Post types
export interface Post {
    post_id: number;
    user_id: number;
    city?: string;
    postal_code?: string;
    name?: string;
    surname?: string;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    description?: string;
    cost: number;
    pet_count?: number;
    pet_photos?: string[];
    pet_list?: string[];
    status?: string;
    pending_applications?: number;
    is_active?: boolean;
}

// Backend response types
export interface MyPostsResponse {
    post_lst: BackendPost[];
}

export interface BackendPost {
    post_id: number;
    user_id: number;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    description?: string;
    cost: number;
    pet_lst: string[];
    status: string;
    pending_applications?: number;
    is_active?: boolean;
}


export interface User {
    user_id: number;
    name: string;
    surname: string;
    city: string;
    postal_code: string;
    rating?: number;
    photo?: string;
    description?: string;
}

export interface IRating {
    usr_rating_id: number;
    star_number: number;
    description: string;
}


export interface PostDetails {
    user: User;
    post: Post;
    pets: Pet[];
    status: "own" | "applied" | "accepted" | "declined" | "";
    can_rate?: boolean;
}

export interface Applicant extends User {
    status: "Accepted" | "Declined" | "Pending";
}

// Other shared types can be added here
export type PetSize = 'Mały' | 'Średni' | 'Duży';
export type PetType = 'Pies' | 'Kot' | 'Królik' | 'Papuga' | 'Fretka' | 'Inne';

export const PET_SIZES: PetSize[] = ['Mały', 'Średni', 'Duży'];
export const PET_TYPES: PetType[] = ['Pies', 'Kot', 'Królik', 'Papuga', 'Fretka', 'Inne'];