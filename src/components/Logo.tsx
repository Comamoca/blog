import { SITE_TITLE } from "../consts.ts";

export default function Logo() {
  return (
    <>
      <div className="flex justify-center">
        <h1 className="text-3xl mt-2 md:text-4xl font-body text-center pl-8">
          {SITE_TITLE}
        </h1>
      </div>
    </>
  );
}
