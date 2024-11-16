import { encodeBase64 } from "jsr:@std/encoding";
import { SITE_TITLE } from "../../consts.ts";

const png = await Deno.readFile("./assets/gakumas-sozai.png");
const image = `data:image/png;base64,${encodeBase64(png)}`;

export default function ({ title, description }) {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: `url(${image})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          margin: "auto",
          backgroundColor: "#fff",
          width: "85%",
          height: "85%",
          borderRadius: 30,
        }}
      >
        <div
          style={{
            margin: "auto",
            paddingLeft: 70,
            fontSize: 80, // fontSizeを45にすると大きくスタイルが崩れる
            fontFamily: "NotoSansJPBlack",
            textAlign: "center",
          }}
        >
          {SITE_TITLE}
        </div>
      </div>
    </div>
  );
}
