interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-6 safe-area-top">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-blue-100 text-sm mt-1">{subtitle}</p>}
      </div>
    </header>
  );
}
