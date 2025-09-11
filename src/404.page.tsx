import { SITE_DESCRIPTION } from "./consts.ts";

export const layout = "layouts/main.tsx";
export const openGraphLayout = "layouts/mainOgImage.tsx";
export const url = "/404.html";

export const title = "Page Not Found";
export const metas = {
  title: "=title",
  description: SITE_DESCRIPTION,
};

export default function () {
  return (
    <>
      <main className="flex-grow flex flex-col min-h-96">
        <img
          id="img"
          src="https://deno-avatar.deno.dev/avatar/avatar.svg"
          className="mx-auto h-32 w-32 rounded-full md:mb-6 mt-8 md:mt-2"
        />

        <h1 className="text-2xl mt-8 md:text-4xl font-body text-center">
          404 Page Not Found
        </h1>

        <script>
          {`
const random = Math.floor(Math.random() * 16777215).toString(16)
const img = document.getElementById("img")

const host = "https://deno-avatar.deno.dev/"
const svgName = random + ".svg"

const svgURL = new URL(host) 
svgURL.pathname += "avatar";
svgURL.pathname += "/" + svgName

console.log(svgURL)
img.src = svgURL
`}
        </script>
      </main>
    </>
  );
}
