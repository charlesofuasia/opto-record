import Sidebar from '../components/Sidebar';

interface Props {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: Props) {
  return (
    <div className='flex'>
      <Sidebar />
      <main className='flex-1 bg-background p-6'>{children}</main>
    </div>
  );
}