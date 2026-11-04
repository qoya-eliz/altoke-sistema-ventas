export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = [...new Set([1, totalPages, ...Array.from({ length: 5 }, (_, i) => currentPage + i - 2)])]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  return (
    <nav aria-label="Páginas de ventas" className="d-flex flex-wrap justify-content-end align-items-center gap-2 mt-3 pt-2 border-top">
      <span className="small text-muted me-2">Página {currentPage} de {totalPages}</span>
      <button type="button" className="btn btn-sm btn-light border" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>Anterior</button>
      {pages.map((page, index) => (
        <span key={page} className="d-inline-flex align-items-center gap-2">
          {index > 0 && page - pages[index - 1] > 1 && <span aria-hidden="true">…</span>}
          <button type="button" aria-label={`Ir a página ${page}`} aria-current={page === currentPage ? 'page' : undefined} className={`btn btn-sm ${page === currentPage ? 'btn-gold' : 'btn-light border'}`} onClick={() => onPageChange(page)}>{page}</button>
        </span>
      ))}
      <button type="button" className="btn btn-sm btn-light border" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>Siguiente</button>
    </nav>
  );
}
