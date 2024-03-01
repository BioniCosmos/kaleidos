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
    <div class="flex flex-col items-center py-8">
      <span class="text-sm text-gray-700 font-semibold dark:text-gray-400">
        {currentPage}/{totalPages}
      </span>
      <div class="inline-flex mt-2 xs:mt-0">
        <a
          href={
            currentPage > 1 ? `${basePath}?page=${currentPage - 1}` : undefined
          }
          class="flex items-center justify-center px-4 h-10 text-base font-medium text-white bg-gray-800 rounded-s hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
        >
          Prev
        </a>
        <a
          href={
            currentPage < totalPages
              ? `${basePath}?page=${currentPage + 1}`
              : undefined
          }
          class="flex items-center justify-center px-4 h-10 text-base font-medium text-white bg-gray-800 border-0 border-s border-gray-700 rounded-e hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
        >
          Next
        </a>
      </div>
    </div>
  ) : null
}
