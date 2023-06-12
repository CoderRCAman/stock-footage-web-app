import React from "react";
import Sidebar from "../../components/Sidebar";
import ShowContent from "./ShowContent";

export default function Dashboard() {
  return (
    <>
      <div className="flex w-full overflow-hidden max-h-screen">
        <Sidebar />
        <div className="overflow-y-scroll w-full text-stone-200">
          <ShowContent />
        </div>
      </div>
    </>
  );
}
