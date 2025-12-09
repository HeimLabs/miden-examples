export const NODE_ENDPOINT = "https://rpc.testnet.miden.io:443";

// Faucet IDs
export const MIDEN_FAUCET_ID = "mtst1ap2t7nsjausqsgrswk9syfzkcu328yna"; // MIDEN token faucet
export const HLT_FAUCET_ID = "mm1arajukt424pyvgrcgg6wxnycwvezgzey"; // HLT token faucet

// Token decimals (assuming 8 decimals for both)
export const TOKEN_DECIMALS = 8;

// Marketplace assets
export interface MarketplaceAsset {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number; // Price in MIDEN tokens (without decimals)
  hltReward: number; // HLT tokens received (without decimals)
}

export const MARKETPLACE_ASSETS: MarketplaceAsset[] = [
  {
    id: "1",
    name: "Digital Art Piece #1",
    description: "A beautiful digital artwork showcasing modern design",
    imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop",
    price: 100,
    hltReward: 50,
  },
  {
    id: "2",
    name: "Abstract Composition",
    description: "An abstract composition with vibrant colors",
    imageUrl: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&h=400&fit=crop",
    price: 200,
    hltReward: 100,
  },
  {
    id: "3",
    name: "Nature Landscape",
    description: "A serene landscape capturing nature's beauty",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    price: 150,
    hltReward: 75,
  },
  {
    id: "4",
    name: "Urban Architecture",
    description: "Modern architecture in an urban setting",
    imageUrl: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400&h=400&fit=crop",
    price: 250,
    hltReward: 125,
  },
  {
    id: "5",
    name: "Abstract Patterns",
    description: "Intricate patterns and geometric designs",
    imageUrl: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&h=400&fit=crop",
    price: 180,
    hltReward: 90,
  },
  {
    id: "6",
    name: "Colorful Gradient",
    description: "A vibrant gradient artwork",
    imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop",
    price: 120,
    hltReward: 60,
  },
];
