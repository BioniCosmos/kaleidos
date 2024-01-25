export default function Pagination({
  currentPage,
  totalPages,
  basePath,
}: {
  currentPage: number
  totalPages: number
  basePath: string
}) {
  return totalPages > 1 ? (
    <div>
      {currentPage > 1 && (
        <a href={`${basePath}?page=${currentPage - 1}`}>Previous</a>
      )}
      {currentPage}/{totalPages}
      {currentPage !== totalPages && (
        <a href={`${basePath}?page=${currentPage + 1}`}>Next</a>
      )}
    </div>
  ) : null
}
