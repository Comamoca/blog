import {
  Github,
  Home,
  Info,
  NotepadText,
  Rss,
  Twitter,
  User,
  Waypoints,
} from "lucide-react";
import Search from "./Search.tsx";

// const iconSize = "30";

const HeaderLink = ({ href, title, Child }) => {
  return (
    <a
      href={href}
      className="text-gray-500 hover:text-gray-700 py-1 border-gray-500"
      title={title}
    >
      <div className="mx-3 w-3 w-10">
        <Child />
      </div>
    </a>
  );
};

const links = [
  <HeaderLink href="/" title="Home" Child={Home} />,
  // <Search />,
  <HeaderLink href="/diary/1" title="Diary" Child={NotepadText} />,
  <HeaderLink href="/me" title="Me" Child={User} />,
  <HeaderLink href="/hub" title="Hub" Child={Waypoints} />,
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
      <div className="flex m-3 mt-5 sm:flex-row-reverse">
        <div className="list-none flex items-stretch mx-auto">
          {links.map((child, idx) => <li key={idx}>{child}</li>)}
        </div>
      </div>
    </>
  );
}
