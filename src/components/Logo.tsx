import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export function OldLogo() {
  return (
    <>
      <div className="flex justify-center">
        <img
          src="https://emoji2svg.deno.dev/api/🧠"
          class="w-10 mt-2.5 mr-1"
          alt="brain"
        />
        <h1 class="text-3xl mt-2 md:text-4xl font-body text-center">
          |&gt; IO.puts()
        </h1>
      </div>
    </>
  );
}

export default function Logo() {
  return (
    <>
      <div className="flex justify-center">
        <h1 class="text-3xl mt-2 md:text-4xl font-body text-center pl-8">
	 {SITE_TITLE}
        </h1>
      </div>
    </>
  );
}
