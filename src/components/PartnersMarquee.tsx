import React from "react";

import afribot from "@/assets/patners/afribot.png";
import angaza from "@/assets/patners/angaza.png";
import bausTaka from "@/assets/patners/baus taka.png";
import innovus from "@/assets/patners/innovus.png";
import ntech from "@/assets/patners/ntech.png";
import swahilipot from "@/assets/patners/swahilipot.png";
import wiseAdmit from "@/assets/patners/wise admit.png";
import ysk from "@/assets/patners/ysk.png";

const logos = [
  afribot,
  angaza,
  bausTaka,
  innovus,
  ntech,
  swahilipot,
  wiseAdmit,
  ysk,
];

const PartnersMarquee: React.FC = () => {
  // duplicate logos so marquee appears continuous
  const display = [...logos, ...logos];

  return (
    <div className="w-full overflow-hidden">
      <div className="marquee">
        <div className="marquee-track flex items-center space-x-8">
          {display.map((src, i) => (
            <div key={i} className="marquee-item flex-shrink-0 opacity-90">
              <img src={src} alt={`partner-${i}`} className="h-16 md:h-20 object-contain" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PartnersMarquee;
