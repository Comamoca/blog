import { encodeBase64 } from "jsr:@std/encoding";

const png = await Deno.readFile("./assets/gakumas-sozai.png");
const image = `data:image/png;base64,${encodeBase64(png)}`;

// 長すぎるdescriptionはレイアウトが崩れるので切り詰める
const MAX_DESCRIPTION_LENGTH = 80;

function truncate(text: string) {
  return text.length > MAX_DESCRIPTION_LENGTH
    ? `${text.slice(0, MAX_DESCRIPTION_LENGTH)}…`
    : text;
}

export default function ({ title, description }) {
  const desc = (description ?? "").trim();

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
            display: "flex",
            flexDirection: "column",
            padding: "40",
            flexGrow: 2,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 55, // fontSizeを45にすると大きくスタイルが崩れる
              fontFamily: "NotoSansJP Regular",
            }}
          >
            {title}
          </div>
          {desc && (
            <div
              style={{
                display: "flex",
                fontSize: 32,
                paddingTop: 20,
                color: "#4b5563",
                fontFamily: "NotoSansJP Regular",
              }}
            >
              {truncate(desc)}
            </div>
          )}
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
                fontFamily: "NotoSansJP Bold",
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
              fontFamily: "NotoSansJP Bold",
            }}
          >
            かわいい駆動生活。
          </span>
        </div>
      </div>
    </div>
  );
}
