import { Link } from 'react-router-dom';

export const Unauthorized = () => (
    <div className="h-full flex flex-col items-center justify-center text-center pt-20">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">403 Unauthorized</h1>
        <p className="text-gray-500 mb-8">You do not have permission to access this page.</p>
        <Link to="/" className="text-primary hover:underline font-medium">Go Back Home</Link>
    </div>
);
