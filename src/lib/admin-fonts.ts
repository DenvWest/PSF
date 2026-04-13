import { DM_Sans, DM_Serif_Display } from "next/font/google";

export const adminSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const adminSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dm-serif",
});
