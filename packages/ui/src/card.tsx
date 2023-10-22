
export function Card({
  title,
}: {
  className?: string;
  title: string;
  href: string;
}){
  return (
    <div
      class={"bg-red-400"}
    >
      <h2>
        {title} <span>-&gt;</span>
      </h2>
    </div>
  );
}
