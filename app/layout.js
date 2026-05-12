import "./globals.css";

export const metadata = {
  title: "AutoAlpha X",
  description: "Your AI Wealth Operator"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
