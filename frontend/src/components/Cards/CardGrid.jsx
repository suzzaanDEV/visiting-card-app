import CardRenderer from './CardRenderer';

export default function CardGrid({ cards, loading, emptyMessage }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!cards?.length) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400 py-8">
        {emptyMessage || 'No cards found'}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map(card => (
        <a
          key={card._id}
          href={`/card/${card._id}`}
          className="block hover:shadow-lg transition-shadow rounded-xl overflow-hidden"
        >
          <CardRenderer card={card} mode="preview" />
        </a>
      ))}
    </div>
  );
}
