import { encodeBase64 } from "jsr:@std/encoding";

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
            fontSize: 55, // fontSizeを45にすると大きくスタイルが崩れる
            padding: "40",
            flexGrow: 2,
            fontFamily: "Noto Sans JP",
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", paddingBottom: 48 }}>
          <div style={{ display: "flex", flexGrow: 2, paddingLeft: 40 }}>
            <img
              src="https://r2.comamoca.dev/icon.png"
              width={80}
              height={80}
              style={{ borderRadius: 9999 }}
            />
            <span
              style={{
                fontSize: 46,
                fontWeight: 600,
                paddingLeft: 20,
                paddingTop: 10,
                fontFamily: "NotoSansJP",
              }}
            >
              Comamoca
            </span>
          </div>
          <span
            style={{
              fontSize: 40,
              paddingTop: 20,
              paddingRight: 30,
              fontFamily: "NotoSansJP",
            }}
          >
            かわいい駆動生活。
          </span>
        </div>
      </div>
    </div>
  );
}
