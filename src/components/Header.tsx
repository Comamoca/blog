import { Github } from "lucide-react";
import { Home } from "lucide-react";
import { Info } from "lucide-react";
import { Rss } from "lucide-react";
import { Twitter } from "lucide-react";
import { User } from "lucide-react";

const iconSize = "30";

const links = [
  {
    child: <Home size={iconSize} />,
    name: "Home",
    href: "/",
  },
  {
    child: <User size={iconSize} />,
    name: "Me",
    href: "/me",
  },
  {
    child: <Info size={iconSize} />,
    name: "Infomation",
    href: "/info/",
  },
  {
    child: <Rss size={iconSize} />,
    name: "RSS",
    href: "/api/feed.xml",
  },
  {
    child: <Github size={iconSize} />,
    name: "Github",
    href: "https://github.com/Comamoca/blog",
  },
  {
    child: <Twitter size={iconSize} />,
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
                <div className={"ml-6 m-t4"}>
                  {link.child}
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
