export default function Marquee({ 
  items, 
  onItemClick,
  inputValue,
  setInputValue
}: { 
  items: string[];
  onItemClick: (text: string, index: number) => void;
  inputValue: string;
  setInputValue: (text: string) => void;
}) {
  const handleClick = (item: string, index: number) => {
    console.log('Marquee click:', item);
    setInputValue(item);
    onItemClick(item, index);
  };

  return (
    <div className="relative flex w-full overflow-x-hidden border-border text-text font-base my-4">
      <div className="animate-marquee whitespace-nowrap py-1">
        {items.map((item, index) => (
          <button 
            key={item} 
            className="mx-4 text-sm hover:text-primary transition-colors"
            onClick={() => handleClick(item, index)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="absolute top-0 animate-marquee2 whitespace-nowrap py-1">
        {items.map((item, index) => (
          <button 
            key={item} 
            className="mx-4 text-sm hover:text-primary transition-colors"
            onClick={() => handleClick(item, index)}
          >
            {item}
          </button>
        ))}
      </div>

      {/* must have both of these in order to work */}
    </div>
  )
}
