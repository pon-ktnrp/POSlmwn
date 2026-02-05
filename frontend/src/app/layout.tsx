import type { Metadata } from 'next';
import ThemeRegistry from '@/lib/ThemeRegistry';
import "./globals.css";
import MiniDrawer from "@/components/Sidebar";
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { Box } from "@mui/material";


export const metadata: Metadata = {
  title: 'POS System',
  description: 'MUI Enterprise POS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Define the 3 requested Navigation Items
  const navItems = [
    { 
      text: "POS", 
      path: "/", // "This page"
      icon: <PointOfSaleIcon /> 
    },
    { 
      text: "Orders", 
      path: "/orders", // "Order List Page"
      icon: <ReceiptLongIcon /> 
    },
    { 
      text: "Reports", 
      path: "/reports", // "Report Page"
      icon: <AssessmentIcon /> 
    },
  ]
    return (
      <html lang="en">
        <body>
          <ThemeRegistry>
            <Box sx={{ display: "flex" }}>
              <MiniDrawer navItems={navItems} />
              <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                {children}
              </Box>
            </Box>
          </ThemeRegistry>
        </body>
      </html>
    );
}