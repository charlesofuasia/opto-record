import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className='flex'>
        {/* Main content area */}
        <main className='flex-1 bg-background'>{children}</main>
      </body>
    </html>
  );
}
