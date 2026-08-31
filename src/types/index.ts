export type WoodType = "Bamboo" | "Maple";

export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviewCount: number;
  wood: WoodType;
  dimensions: string;
  thickness: string;
  weight: string;
  inventory: number;
  images: string[];
  imagePosition?: string[];
  badge?: string;
  features: string[];
  inStock: boolean;
  category: "board" | "gear";
};

export type Review = {
  id: string;
  name: string;
  location: string;
  rating: number;
  title: string;
  body: string;
  product: string;
  image: string;
  date: string;
};
