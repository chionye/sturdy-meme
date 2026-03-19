const Pagination = ({ page, pages, onPage }) => {
  if (pages <= 1) return null;
  const items = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || (i >= page - 2 && i <= page + 2)) {
      items.push(i);
    } else if (items[items.length - 1] !== '...') {
      items.push('...');
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button onClick={() => onPage(page - 1)} disabled={page === 1} className="btn-secondary px-3 py-2 text-sm disabled:opacity-40">
        Prev
      </button>
      {items.map((item, idx) => (
        item === '...'
          ? <span key={idx} className="px-2 text-gray-400">...</span>
          : <button
              key={idx}
              onClick={() => onPage(item)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${item === page ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
            >
              {item}
            </button>
      ))}
      <button onClick={() => onPage(page + 1)} disabled={page === pages} className="btn-secondary px-3 py-2 text-sm disabled:opacity-40">
        Next
      </button>
    </div>
  );
};

export default Pagination;
