import {
  Github,
  Home,
  Info,
  NotepadText,
  Rss,
  Twitter,
  User,
} from "https://esm.sh/lucide-react@0.455.0";
import Search from "./Search.tsx";

// const iconSize = "30";

const HeaderLink = ({ href, title, Child }) => {
  return (
    <li>
      <a
        href={href}
        className="text-gray-500 hover:text-gray-700 py-1 border-gray-500"
        title={title}
      >
        <div className={"mx-3"}>
          <div className="w-3 w-10">
            <Child />
          </div>
        </div>
      </a>
    </li>
  );
};

const links = [
  <HeaderLink href="/" title="Home" Child={Home} />,
  <Search />,
  <HeaderLink href="/diary/1" title="Diary" Child={NotepadText} />,
  <HeaderLink href="/me" title="Me" Child={User} />,
  <HeaderLink href="/info" title="Infomation" Child={Info} />,
  <HeaderLink href="/api/feed.xml" title="RSS" Child={Rss} />,
  <HeaderLink
    href="https://github.com/Comamoca/blog"
    title="Github"
    Child={Github}
  />,
  <HeaderLink
    href="https://twitter.com/Comamoca_"
    title="Twitter"
    Child={Twitter}
  />,
  // <HeaderLink href="" title="" child={} />,
];

export default function Header() {
  return (
    <>
      <div className="flex m-3 sm:flex-row-reverse">
        <ul className="list-none flex items-center mx-auto md:m-2">
          {links.map((child) => child)}
        </ul>
      </div>
    </>
  );
}
