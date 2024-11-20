import { Search } from "https://esm.sh/lucide-react@0.455.0";

export default function () {
  return (
    <div className="mx-3">
      <label
        htmlFor="pagefind_modal"
        className="text-gray-500 hover:text-gray-700 py-1 border-gray-500"
      >
        <div className="w-3 w-10">
          <Search />
        </div>
      </label>
      <input type="checkbox" id="pagefind_modal" className="modal-toggle" />
      <div className="modal modal-bottom sm:modal-middle" role="dialog">
        <div className="modal-box">
          <div className="flex flex-col h-dvh py-5">
            <div id="search" className="mx-3"></div>
          </div>
        </div>
        <label className="modal-backdrop" htmlFor="pagefind_modal">Close</label>
      </div>
    </div>
  );
}
