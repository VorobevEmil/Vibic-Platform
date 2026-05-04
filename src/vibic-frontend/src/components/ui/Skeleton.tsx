interface SkeletonProps {
  className?: string;
}

function joinClasses(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(' ');
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={joinClasses(
        'animate-pulse rounded-xl bg-white/[0.05]',
        className,
      )}
      aria-hidden="true"
    />
  );
}
