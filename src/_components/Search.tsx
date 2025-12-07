export default async function Search() {
  return (
    <div className="mx-3">
      <label
        htmlFor="pagefind_modal"
        className="text-gray-500 hover:text-gray-700 py-1 border-gray-500"
      >
        <div className="w-3 md:w-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="lucide lucide-search"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
      </label>

      <input
        type="checkbox"
        id="pagefind_modal"
        className="modal-toggle hidden"
      />
      <div className="modal modal-bottom sm:modal-middle" role="dialog">
        <div className="modal-box">
          <div className="flex flex-col h-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">検索</h3>
              <label
                htmlFor="pagefind_modal"
                className="btn btn-sm btn-circle btn-ghost"
              >
                ✕
              </label>
            </div>
            <div id="search" className="flex-1"></div>
          </div>
        </div>
        <label className="modal-backdrop" htmlFor="pagefind_modal">Close</label>
      </div>
    </div>
  );
}
