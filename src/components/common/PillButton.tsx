import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";

interface PillButtonProps {
  to: string;
  label: string;
  className?: string;
  circleClassName?: string;
  labelClassName?: string;
  hoverLabelClassName?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  ease?: string;
}

export const PillButton = ({
  to,
  label,
  className = "",
  circleClassName = "bg-cyan-400",
  labelClassName = "text-white font-extrabold uppercase tracking-wider text-xs",
  hoverLabelClassName = "text-[#020817] font-black uppercase tracking-wider text-xs",
  onClick,
  ease = "power2.easeOut",
}: PillButtonProps) => {
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const circleRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const hoverLabelRef = useRef<HTMLSpanElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const pill = buttonRef.current;
    const circle = circleRef.current;
    const labelEl = labelRef.current;
    const hoverLabelEl = hoverLabelRef.current;

    if (!pill || !circle) return;

    const layout = () => {
      const rect = pill.getBoundingClientRect();
      const { width: w, height: h } = rect;
      if (w === 0 || h === 0) return;

      const R = ((w * w) / 4 + h * h) / (2 * h);
      const D = Math.ceil(2 * R) + 2;
      const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
      const originY = D - delta;

      circle.style.width = `${D}px`;
      circle.style.height = `${D}px`;
      circle.style.bottom = `-${delta}px`;

      gsap.set(circle, {
        xPercent: -50,
        scale: 0,
        transformOrigin: `50% ${originY}px`,
      });

      if (labelEl) gsap.set(labelEl, { y: 0 });
      if (hoverLabelEl) gsap.set(hoverLabelEl, { y: h + 8, opacity: 0 });

      tlRef.current?.kill();
      const tl = gsap.timeline({ paused: true });

      tl.to(circle, { scale: 1.25, xPercent: -50, duration: 2, ease, overwrite: "auto" }, 0);

      if (labelEl) {
        tl.to(labelEl, { y: -(h + 8), duration: 2, ease, overwrite: "auto" }, 0);
      }

      if (hoverLabelEl) {
        gsap.set(hoverLabelEl, { y: Math.ceil(h + 20), opacity: 0 });
        tl.to(hoverLabelEl, { y: 0, opacity: 1, duration: 2, ease, overwrite: "auto" }, 0);
      }

      tlRef.current = tl;
    };

    layout();

    window.addEventListener("resize", layout);
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    return () => {
      window.removeEventListener("resize", layout);
      tlRef.current?.kill();
    };
  }, [ease, label]);

  const handleMouseEnter = () => {
    const tl = tlRef.current;
    if (!tl) return;
    tl.tweenTo(tl.duration(), {
      duration: 0.35,
      ease,
      overwrite: "auto",
    });
  };

  const handleMouseLeave = () => {
    const tl = tlRef.current;
    if (!tl) return;
    tl.tweenTo(0, {
      duration: 0.25,
      ease,
      overwrite: "auto",
    });
  };

  return (
    <Link
      ref={buttonRef}
      to={to}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative inline-flex items-center justify-center overflow-hidden cursor-pointer whitespace-nowrap select-none ${className}`}
    >
      <span
        ref={circleRef}
        aria-hidden="true"
        className={`absolute left-1/2 rounded-full pointer-events-none will-change-transform z-0 ${circleClassName}`}
      />
      <span className="relative z-10 inline-flex flex-col items-center justify-center pointer-events-none">
        <span ref={labelRef} className={`will-change-transform leading-none ${labelClassName}`}>
          {label}
        </span>
        <span
          ref={hoverLabelRef}
          aria-hidden="true"
          className={`absolute inset-0 flex items-center justify-center will-change-transform leading-none ${hoverLabelClassName}`}
        >
          {label}
        </span>
      </span>
    </Link>
  );
};

export default PillButton;
