import { notFound } from "next/navigation";

interface ErrorPageProps {
  error: {
    status: number;
    message: string;
  };
}

export async function ErrorPage({ error }: ErrorPageProps) {
  if (error.status === 404) {
    notFound();
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Error {error.status}</h1>
        <h2 className="text-xl text-gray-700">{error.message}</h2>
      </div>
    </div>
  );
}

