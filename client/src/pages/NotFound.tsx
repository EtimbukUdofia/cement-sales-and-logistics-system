import { Link } from 'react-router'

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8">
      <h1 className="text-6xl sm:text-8xl font-bold text-slate-500 m-0">404</h1>
      <h2 className="text-xl sm:text-2xl text-slate-800 my-4 text-center">Page Not Found</h2>
      <p className="text-slate-500 mb-8 text-center max-w-md">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium transition-colors hover:bg-blue-700 text-center"
      >
        Go Home
      </Link>
    </div>
  )
}

export default NotFound