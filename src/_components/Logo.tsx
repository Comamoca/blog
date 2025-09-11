import { SITE_TITLE } from "../consts.ts";

export default async function () {
  return (
    <>
      <div className="flex flex-grow justify-center w-max">
        <h1 className="text-2xl md:text-4xl px-auto pl-5 mx-auto">
          {SITE_TITLE}
        </h1>
      </div>
    </>
  );
}
