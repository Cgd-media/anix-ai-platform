import "./globals.css";

export const metadata = {
  title: "ANIX AI",
  description: "AI-powered digital marketing operations platform by CGD Media",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}