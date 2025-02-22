export default function Marquee({ items }: { items: string[] }) {
  return (
    <div className="relative flex w-full overflow-x-hidden border-border text-text font-base my-4">
      <div className="animate-marquee whitespace-nowrap py-1">
        {items.map((item) => {
          return (
            <span key={item} className="mx-4 text-sm">
              {item}
            </span>
          )
        })}
      </div>

      <div className="absolute top-0 animate-marquee2 whitespace-nowrap py-1">
        {items.map((item) => {
          return (
            <span key={item} className="mx-4 text-sm">
              {item}
            </span>
          )
        })}
      </div>

      {/* must have both of these in order to work */}
    </div>
  )
}
