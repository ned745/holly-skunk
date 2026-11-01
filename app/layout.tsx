import './globals.css';

export const metadata = {
 title: 'Holly Skunk | Thrift & Lifestyle Storefront',
 description: 'Streetwear Apparel & Premium Lifestyle Portal Layout Layer',
};

export default function RootLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
  <html lang="en">
   <body className="bg-neutral-950 text-neutral-100 antialiased selection:bg-lime-400 selection:text-black">
    {children}
   </body>
  </html>
 );
}
