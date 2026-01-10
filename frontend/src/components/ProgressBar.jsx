export default function ProgressBar({ value }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-4">
      <div
        className="bg-green-500 h-4 rounded-full text-xs text-white text-center"
        style={{ width: `${value}%` }}
      >
        {value}%
      </div>
    </div>
  );
}
