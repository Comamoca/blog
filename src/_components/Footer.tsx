const today = new Date();

export default function Footer() {
  return (
    <>
      <footer className="flex justify-center mt-3">
        <a href="/info">
          <div className="border(t gray-200) block p-4 md:p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 m-3">
            <p className="font-normal text-gray-700 dark:text-gray-400">
              &copy; {today.getFullYear()} Comamoca. All rights reserved.
            </p>
          </div>
        </a>
      </footer>
    </>
  );
}
