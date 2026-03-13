const MarqueeTicker = () => {
  const items = [
    "CMPT354 GROUP PROJECT",
    "JERRY",
    "MIKE",
    "JEONGMIN",
    "JAMES",
  ];

  const repeated = [...items, ...items, ...items, ...items];

  return (
    <div className="bg-foreground text-background py-3 overflow-hidden">
      <div className="animate-marquee flex whitespace-nowrap">
        {repeated.map((item, i) => (
          <span key={i} className="text-xs font-mono uppercase tracking-wider mx-6">
            // {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MarqueeTicker;
