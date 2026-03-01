import { CustomTooltip } from "@/components/CustomTooltip";
import { useState } from "react";

export function TruncatedCell({ text }: { text: string }) {
  const [isTruncated, setIsTruncated] = useState(false);
  const capitalized = text.charAt(0).toUpperCase() + text.slice(1);
  const refCallback = (el: HTMLDivElement | null) => {
    if (el) setIsTruncated(el.scrollWidth > el.clientWidth);
  };

  const content = (
    <div ref={refCallback} className="truncate max-w-50 cursor-default">
      {capitalized}
    </div>
  );

  if (!isTruncated) return content;

  return <CustomTooltip content={text}>{content}</CustomTooltip>;
}
