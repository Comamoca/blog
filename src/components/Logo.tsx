import { SITE_TITLE } from "../consts.ts";

export default function () {
  return (
    <>
      <div className="flex justify-center">
        <div className="flex flex-col mt-8">
          <h1 className="text-3xl md:text-4xl mx-auto mt-8 ml-5">
            {SITE_TITLE}
          </h1>
        </div>
      </div>
    </>
  );
}
