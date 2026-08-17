import { NavLink } from "react-router-dom";
import topTabs from "../../data/topTabs";
import "./TopTabs.css";

export default function TopTabs() {
  return (
    <div className="topTabs">

      {topTabs.map((tab)=>(
        <NavLink
          key={tab.id}
          to={tab.path}
          className={({isActive})=>
            isActive ? "tab active":"tab"
          }
        >
          {tab.title}
        </NavLink>
      ))}

    </div>
  );
}