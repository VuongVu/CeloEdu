export interface Course {
    index: number;
    title: string;
    description: string;
    author: string;
    image: string;
    price: number;
    sold: number;
}

export enum CourseStatus {
    NEW,
    BOUGHT,
    COMPLETED,
}
