import { basename } from "jsr:@std/path";
import Logo from "./components/Logo.tsx";

export const layout = "layouts/main.tsx";

export default async function ({ search }: Lume.Data, helpers: Lume.Helpers) {
  return (
    <>
      <div className="-mt-20 mb-10">
        <Logo />
        <h2 className="flex justify-center mt-8 text-2xl">すべての日報</h2>
      </div>
      </div>
    </>
  );
}
