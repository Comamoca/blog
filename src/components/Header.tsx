import { Github } from "lucide-react";
import { Home } from "lucide-react";
import { Info } from "lucide-react";
import { Rss } from "lucide-react";
import { Twitter } from "lucide-react";
import { User } from "lucide-react";

// const iconSize = "30";

const links = [
  {
    child: <Home />,
    name: "Home",
    href: "/",
  },
  {
    child: <User />,
    name: "Me",
    href: "/me",
  },
  {
    child: <Info />,
    name: "Infomation",
    href: "/info/",
  },
  {
    child: <Rss />,
    name: "RSS",
    href: "/api/feed.xml",
  },
  {
    child: <Github />,
    name: "Github",
    href: "https://github.com/Comamoca/blog",
  },
  {
    child: <Twitter />,
    name: "Twitter",
    href: "https://twitter.com/Comamoca_",
  },
];

export default function Header() {
  return (
    <>
      <div className="flex m-3 md:flex-row-reverse">
        <ul className="flex items-center mx-auto md:m-2">
          {links.map((link) => (
            <li>
              <a
                href={link.href}
                className={"text-gray-500 hover:text-gray-700 py-1 border-gray-500"}
              >
                <div className={"mx-3"}>
                  <div className="w-3 md:w-10">{link.child}</div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
