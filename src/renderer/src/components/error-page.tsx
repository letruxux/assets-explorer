import { FallbackProps } from "react-error-boundary";
import { useNavigate } from "react-router-dom";

export default function ErrorFallback({
  error,
  resetErrorBoundary
}: FallbackProps): React.JSX.Element {
  const navigate = useNavigate();
  return (
    <div
      role="alert"
      className="flex justify-center items-center min-h-dvh w-full flex-col gap-y-4"
    >
      <span className="flex flex-col text-center">
        <h2 className="text-3xl font-bold">Oops 😅</h2>
        <h4 className="text-gray-400">Something went super wrong...</h4>
      </span>
      <pre className="text-error bg-error-content py-1 px-2 rounded-xl outline-error outline">
        {error instanceof Error ? error.message : String(error)}
      </pre>
      <div className="flex gap-x-2">
        <button
          className="btn btn-primary"
          onClick={() => {
            resetErrorBoundary();
            navigate(-1);
          }}
        >
          Go back
        </button>
        <button className="btn btn-ghost btn-error" onClick={resetErrorBoundary}>
          Try again
        </button>
      </div>
    </div>
  );
}
