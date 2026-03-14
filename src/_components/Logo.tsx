import { SITE_TITLE } from "../consts.ts";

export default async function () {
  return (
    <>
      <div className="flex justify-center w-full">
        <h1 className="text-2xl md:text-4xl text-center">
          {SITE_TITLE}
        </h1>
      </div>
    </>
  );
}
