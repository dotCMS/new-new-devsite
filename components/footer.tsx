import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-100 p-4 text-center">
      <p>&copy; {new Date().getFullYear()} dotCMS. All rights reserved.</p>
      <div className="flex justify-center space-x-4 mt-2">
        <Link href="/" className="text-blue-500 hover:underline">Home</Link>
        <Link href="/about" className="text-blue-500 hover:underline">About</Link>
        {/* Add more links as needed */}
      </div>
    </footer>
  );
} 