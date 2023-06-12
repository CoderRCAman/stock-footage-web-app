import React, { memo, useRef, useState } from "react";
import { DownOutlined } from "@ant-design/icons";
 function SelectType({selected,setSelected}) {
  const [open, setOpen] = useState(false);
  const dropRef = useRef(null);

  const handleBlur = (e) => {
    if (
      e.nativeEvent.explicitOriginalTarget &&
      e.nativeEvent.explicitOriginalTarget === e.nativeEvent.originalTarget
    ) {
      return;
    }
    if (document.hasFocus()) {
      setOpen(false);
    }
  };
  const handleClick = (event) => {
    if (open) dropRef.current.blur();
    else dropRef.current.focus();
    setOpen(!open);
  };
  const handleSelect = (footageType) => {
    setSelected(footageType);
    dropRef.current.blur();
    setOpen(false);
  };
  return (
    <div
      ref={dropRef}
      tabIndex={0}
      onBlur={handleBlur}
      className="font-Geologica relative z-10  "
    >
      <div
        onClick={handleClick}
        className="w-[115px]  md:w-[155px] py-3 bg-slate-900 flex items-center justify-center gap-2 cursor-pointer capitalize"
      >
        {" "}
        {selected?selected:'select'}
        <DownOutlined className="text-slate-500 text-md" />
      </div>
      <ul
        className={`absolute cursor-pointer w-full bg-slate-800 rounded-b-md  ${
          open ? "block" : "hidden"
        }`}
      >
        <li
          onClick={() => handleSelect("images")}
          className="py-2 text-center border-b-[1px] border-slate-700"
        >
          Images
        </li>
        <li onClick={() => handleSelect("videos")} className="py-2 text-center">
          Videos
        </li>
      </ul>
    </div>
  );
}

export default memo(SelectType)