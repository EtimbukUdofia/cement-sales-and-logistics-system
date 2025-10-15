interface LoadingSpinnerProps {
  className?: string;
}

const LoadingSpinner = ({ className = "w-16 h-16" }: LoadingSpinnerProps) => {
  return (
    <div className="flex items-center justify-center">
      <div className={`border-4 border-blue-500 border-dashed rounded-full animate-spin ${className}`}></div>
    </div>
  )
}

export default LoadingSpinner;