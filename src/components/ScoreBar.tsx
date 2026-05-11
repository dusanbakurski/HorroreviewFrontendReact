interface Props {
  label: string;
  score: number;
  color?: string;
}

export default function ScoreBar({ label, score, color = 'bg-red-600' }: Props) {
  return (
    <div>
      <div className="flex justify-between text-xs text-zinc-400 mb-1">
        <span>{label}</span>
        <span className="font-bold text-zinc-200">{score.toFixed(1)}</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${(score / 10) * 100}%` }}
        />
      </div>
    </div>
  );
}
